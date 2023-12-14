// Main entry point for the backend server.
// Feel free to modify this file to add additional routes, middleware, etc.
import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import debug from 'debug';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { init as authInit, getRequestHandler as auth } from '@subzerocloud/auth';
import { init as restInit, getRequestHandler as rest, getSchemaHandler, getPermissionsHandler, onSubzeroError } from '@subzerocloud/rest'


import Client from 'better-sqlite3';
import permissions from './permissions'


// read env
const env = dotenv.config();
expand(env);

const {
    DB_URI,
    DATABASE_URL,
    JWT_SECRET,
    GOTRUE_JWT_SECRET,
    DB_ANON_ROLE,
    DB_SCHEMAS,
    STATIC_DIR,
    NODE_ENV,
    PORT,
    
} = process.env;

const dbAnonRole = DB_ANON_ROLE || 'anon';
const dbSchemas = DB_SCHEMAS ? DB_SCHEMAS.split(',') : ['public'];
const staticDir = STATIC_DIR || path.resolve(__dirname, 'public')

// use DB_URI and JWT_SECRET as defaults for DATABASE_URL and GOTRUE_JWT_SECRET
// which are used by @subzerocloud/auth (gotrue) 
if (!DATABASE_URL) process.env.DATABASE_URL = DB_URI
if (!GOTRUE_JWT_SECRET) process.env.GOTRUE_JWT_SECRET = JWT_SECRET

// Create a database connection pool


const dbPool = new Client(DB_URI.replace('sqlite://',''));


// Create the Express application
const app = express();
export const handler = app;

// set up logging
const logger = morgan(NODE_ENV === 'production' ? 'combined' : 'dev');
app.use(logger);

// set up CORS
app.use(
    cors({
        exposedHeaders: [
            'content-range',
            'range-unit',
            'content-length',
            'content-type',
            'x-client-info',
        ],
    }),
);

// Configure Express to parse incoming JSON data and cookies
// while preserving the raw body
const preserveRawBody = (req: Request, res: Response, buf: Buffer, encoding: string) => {
    // @ts-ignore
    if (buf && buf.length) { req.rawBody = buf.toString('utf8'); }
};
app.use(express.json({ verify: preserveRawBody }));
app.use(express.urlencoded({ extended: true, verify: preserveRawBody }));
app.use(cookieParser());

// set up passport for JWT auth
passport.use(
    new JwtStrategy(
        {
            // we use custom function because we want to extract the token from the cookie
            // if it's not present in the Authorization header
            jwtFromRequest: (req: Request) => {
                let token: string | null = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                // Extract token from the access_token cookie
                if (!token && req.cookies && req.cookies.access_token) {
                    token = req.cookies.access_token;
                }
                return token;
            },
            secretOrKey: JWT_SECRET,
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);
app.use(passport.initialize());

// helper middleware to authenticate requests
export const isAuthenticated = passport.authenticate('jwt', { session: false });
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
        'jwt',
        { session: false },
        (error: Error, user: Express.User, info: any) => {
            if (error) return next(error);
            if (user) req.user = user;
            next();
        },
    )(req, res, next);
};

// The auth module provides a GoTrue-compatible API for user authentication
const authHandler = auth();
app.use('/auth/v1', authHandler);
app.use('/auth', authHandler);

// The rest module provides a PostgREST-compatible API for accessing the database
const restHandler = rest(dbSchemas, {debugFn: debug('subzero:rest')});
app.use('/rest/v1', isAuthenticated, restHandler);
app.use('/rest', isAuthenticated, restHandler);

// The schema and permissions endpoints are used by the UI to auto-configure itself
const schemaHandler = getSchemaHandler(dbAnonRole);
const permissionsHandler = getPermissionsHandler(dbAnonRole);
app.get('/schema', optionalAuth, schemaHandler);
app.get('/functions/v1/schema', optionalAuth, schemaHandler);
app.get('/permissions', optionalAuth, permissionsHandler);
app.get('/functions/v1/permissions', optionalAuth, permissionsHandler);

// custom route example
async function totalRows(req: Request, res: Response) {
    const db = dbPool
    db.exec(`analyze`);
    const rows = db.prepare(`
        select 
            'public' as table_schema,
            tbl as table_name,
            stat 
        from sqlite_stat1
    `).all();
    const result = rows.map(({ table_schema, table_name, stat }) => ({
        table_schema,
        table_name,
        row_count: parseInt(stat.split(' ')[0]),
    }));
    
    res.json(result);
}
app.get('/functions/total-rows', isAuthenticated, totalRows);
app.get('/functions/v1/total-rows', isAuthenticated, totalRows);

// Serve static files from the 'public' directory
if (staticDir && fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    // Serve index.html as a fallback for non-static routes
    // and let the frontend (react-admin) handle the routing
    app.get('*', (req, res) => {
        res.sendFile('index.html', { root: staticDir });
    });
}
else {
    console.warn(`Static directory ${staticDir} does not exist. Skipping...`);
}

// register error handlers
app.use(onSubzeroError);

export async function init() {
    // Initialize the auth module
    await authInit('sqlite', Client, nodemailer, {
        logFn: debug('subzero:auth'),
        // uncomment this line if you get the error:
        // "total length of command line and environment variables exceeds limit"
        // customEnv: env.parsed,
    });

    // Initialize the rest module
    await restInit(app, 'sqlite', dbPool, dbSchemas, {
        
        
        permissions,
        
        debugFn: debug('subzero:rest'),
    });
}

// in dev mode let vite (and the subzero plugin for vite) handle the server start
const startServer = NODE_ENV === 'production' && !(global as any).__vite_start_time;
function gracefulShutdown() {
    // Perform any necessary cleanup operations here
    console.log("Shutting down gracefully...");
    process.exit();
}
if (startServer) {
    const port = PORT || 3000;
    const server = app.listen(port, async () => {
        try {
            await init();
        } catch (e) {
            server.close();
            console.error(e);
            process.exit(1);
        }
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        console.log(`Listening on port ${port}...`);
    });
}


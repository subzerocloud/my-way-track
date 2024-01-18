// Main entry point for the backend server.
// Feel free to modify this file to add additional routes, middleware, etc.
import { Router } from 'itty-router'
import { init as restInit, getRequestHandler as rest, getSchemaHandler, getPermissionsHandler, } from '@subzerocloud/rest-web'
export { onSubzeroError } from '@subzerocloud/rest-web'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import type { OpfsDatabase, Database, SqlValue } from '@sqlite.org/sqlite-wasm';
// import sql file as a string
import initMigration from '../db/include/schema.sql?raw';
import dataMigration from '../db/include/data.sql?raw';
const migrations = [
    initMigration,
    dataMigration,
    /*
    // initial migration
    `
        CREATE TABLE ...;
        CREATE INDEX ...;
    `,
    // second migration
    `
        ALTER TABLE ... ADD COLUMN ...;
    `,
    */
];


const DB_ANON_ROLE = 'authenticated';
const DB_SCHEMAS = 'public';

const dbAnonRole = DB_ANON_ROLE || 'anon';
const dbSchemas = DB_SCHEMAS ? DB_SCHEMAS.split(',') : ['public'];

function compareObjects(parent: any, child: any): boolean {
    if (Array.isArray(parent)) {
        if (Array.isArray(child)) {
            return child.every(childElement => 
                parent.some(parentElement => compareObjects(parentElement, childElement)));
        } else {
            // If parent is an array and child is not, check if child is an element of parent
            return parent.some(parentElement => compareObjects(parentElement, child));
        }
    } else if (parent && child && typeof parent === 'object' && typeof child === 'object') {
        return Object.keys(child).every(key => 
            parent.hasOwnProperty(key) && compareObjects(parent[key], child[key]));
    }
    return parent === child;
}

function cs(n:number, parentJsonStr: SqlValue, childJsonStr: SqlValue): number {
    let parentJson: any;
    let childJson: any;

    try {
        parentJson = JSON.parse(parentJsonStr as string);
        childJson = JSON.parse(childJsonStr as string);
    } catch (e) {
        // If JSON parsing fails, return false
        return 0;
    }
    return compareObjects(parentJson, childJson)? 1 : 0;
}

// dbPool.function('cs', { deterministic: true }, cs);

import permissions from './permissions'

const settings = {};
export const router = Router();

// partial mock of express app, this is used by subzero rest module
const app = {
    set: function (name: string, value: any) {
        settings[name] = value;
    },
    get: function(name: string) {
        return settings[name];
    },
    use: function (fn) {
        router.all('*', fn);
    },
}

// monkey-patch the web api Request object to match the express Request object
const withExpressRequest = (req) => {
    const url = new URL(req.url);
    req.get = (name) => {
        switch (name) {
            case 'host':
                return url.host;
            default:
                return req.headers.get(name);
        }
        
    };
    req.protocol = url.protocol.replace(':', '');
    req.originalUrl = url.pathname + url.search;
    req.path_prefix = '/rest/v1/';
    req.user = { role: dbAnonRole };
    req.app = app
}
router.all('*', withExpressRequest);

// The rest module provides a PostgREST-compatible API for accessing the database
const restHandler = rest(dbSchemas, {
    //debugFn: console.log
});
router.all('/rest/v1/*', restHandler);
//router.all('/rest/*', restHandler);

// The schema and permissions endpoints are used by the UI to auto-configure itself
const schemaHandler = getSchemaHandler(dbAnonRole);
const permissionsHandler = getPermissionsHandler(dbAnonRole);
//router.get('/schema', schemaHandler);
router.get('/functions/v1/schema', schemaHandler);
//router.get('/permissions', permissionsHandler);
router.get('/functions/v1/permissions', permissionsHandler);


export async function init() {
    // Initialize the database
    const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
    });
    //console.log('Running SQLite3 version', (sqlite3 as any).version.libVersion, sqlite3);
    let dbPool: OpfsDatabase | Database;
    if ('opfs' in sqlite3) {
        dbPool = new sqlite3.oo1.OpfsDb('/mywaytrackdb.sqlite3', 'c');
        //console.log('+++++ !!!! OPFS is available, created persisted database at', dbPool.filename);
    } else {
        dbPool = new sqlite3.oo1.DB('/mywaytrackdb.sqlite3', 'c');
        //console.log('---- OPFS is not available, created transient database', dbPool.filename);
    }

    dbPool.createFunction('cs', cs, { arity:2, deterministic:true });
    // Run migrations
    let dbVersion = dbPool.selectValue('PRAGMA user_version') as number | null;
    //dbVersion = null;
    console.log('Database version', dbVersion);
    if (dbVersion === null) {
        console.log('Initializing database');
        await dbPool.exec('PRAGMA user_version = 0');
        dbVersion = 0;
    }
    for (let i = dbVersion; i < migrations.length; i++) {
        console.log('Running migration', i);
        await dbPool.exec(migrations[i]);
        await dbPool.exec(`PRAGMA user_version = ${i + 1}`);
    }


    // Initialize the rest module
    // @ts-ignore // we add ts-ignore here because app is a partial mock of express app
    await restInit(app, 'sqlite', dbPool, dbSchemas, {
        permissions,
        allowedSelectFunctions: ['count', 'strftime', 'sum', 'timediff', 'avg','unixepoch','sub'],
        //debugFn: console.log,
    });
}

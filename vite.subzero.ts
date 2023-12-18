// this plugin is responsible for starting the backend server and the database when running in dev mode.
// additionally, it will create a demo user if one does not exist.
// it will also watch for changes in the sql directory and restart the server if any changes are detected.

import { PluginOption } from 'vite';
import { existsSync } from 'fs';
import { resolve } from 'path';
const { spawnSync } = require('child_process');
import jws from 'jws';
import { AdminClient } from '@subzerocloud/auth';
import { AddressInfo } from 'net';

import { dirname, basename } from 'path';


// ANSI escape codes for colors
const reset = "\x1b[0m";
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";



let sqlite3IsInstalled: boolean|undefined = undefined;
const runSql = (file: string, dbUri: string, rootDir: string) => {
    // check if sqlite3 is installed
    if (sqlite3IsInstalled === undefined) {
        const r = spawnSync('sqlite3', ['--version'], { stdio: 'ignore' });
        sqlite3IsInstalled = r.status === 0;
    }
    if (!sqlite3IsInstalled) {
        console.error(`${red}sqlite3 is not installed. Please install it and try again.${reset}`);
        process.exit(1);
    }
    const normalizedFile = resolve(rootDir, file);
    const normalizedDbUri = resolve(rootDir, dbUri);
    const sqlDir = dirname(normalizedFile);
    const sqlFile = basename(normalizedFile);
    const result = spawnSync('sqlite3', [normalizedDbUri, `.read ${sqlFile}`], { stdio: 'inherit', cwd: sqlDir });
    if (result.status !== 0) {
        console.error(`${red}Error resetting database${reset}`);
        return false;
    }
    return true;
}


const stopDocker = (rootDir) => {
    return function () {
        spawnSync('docker', ['compose', 'down'], { cwd: rootDir });
    }
}

const startDocker = (rootDir) => {
    if (existsSync(`${rootDir}/docker-compose.yml`)) {
        process.on('exit', stopDocker(rootDir));
        spawnSync('docker', ['compose', 'up', '-d'], { cwd: rootDir });
    }
    else {
        console.warn(`${yellow}No docker-compose.yml file found. Skipping docker-compose up.${reset}`);
    }
}

const addTestUses = async (currentPort: string) => {
    const {
        SUBZERO_TEST_USERS,
        JWT_SECRET,
        API_EXTERNAL_URL,
    } = process.env;
    const testUsers = SUBZERO_TEST_USERS ? JSON.parse(SUBZERO_TEST_USERS) : [];
    const token = jws.sign({
        header: { alg: 'HS256' },
        payload: { role: 'service_role' },
        secret: JWT_SECRET
    });
    const adminApiUrl = new URL(`${API_EXTERNAL_URL}/admin`);
    adminApiUrl.port = currentPort;
    const adminClient = new AdminClient(`${adminApiUrl}`, token);
    for (const user of testUsers) {
        const { email, password, role } = user;
        await adminClient.createUser(email, password, role);
    }
}

const addIdentityProvider = async (currentPort: string) => {
    const {
        SUBZERO_IDENTITY_PROVIDER,
        JWT_SECRET,
        API_EXTERNAL_URL,
    } = process.env;
    const identityProvider = SUBZERO_IDENTITY_PROVIDER ? JSON.parse(SUBZERO_IDENTITY_PROVIDER) : undefined;
    const token = jws.sign({
        header: { alg: 'HS256' },
        payload: { role: 'service_role' },
        secret: JWT_SECRET
    });
    const adminApiUrl = new URL(`${API_EXTERNAL_URL}/admin`);
    adminApiUrl.port = currentPort;
    const adminClient = new AdminClient(`${adminApiUrl}`, token);
    if (identityProvider) {
        const { domain, metadata_url } = identityProvider;

        // keycloak might not be ready yet, so we need to test the url is reachable
        let tries = 0;
        let success = false;
        while (tries < 10 && !success) {
            try {
                const response = await fetch(metadata_url);
                success = response.status === 200;
            }
            catch (e) {
                console.warn(`${yellow}Waiting for identity provider ${domain} to be ready...${reset}`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                tries++;
            }
        }
        if (!success) {
            console.error(`${red}Identity provider ${domain} is not ready. Aborting...${reset}`);
            process.exit(1);
        }
        console.log(`${green}Identity provider ${domain} is ready. Adding...${reset}`);
        await adminClient.createProvider(domain, metadata_url)
    }
}

type PluginConfig = {
    sqlDir?: string,
    sqlInitScript?: string,
    startDocker?: boolean,
    devServerFile?: string,
    prodServerFile?: string,
}

export default function subzeroPlugin(projectRootDir, config?: PluginConfig): PluginOption {
    const c = {
        sqlDir: 'db',
        startDocker: true,
        sqlInitScript: 'init.sql',
        prodServerFile: './dist/server.cjs',
        ...config
    }

    return {
        name: 'configure-server',
        apply: 'serve',
        configurePreviewServer: async function (server) {
            if (c.startDocker) {
                startDocker(projectRootDir)
            }
            // require the server file
            const { handler, init } = await import(c.prodServerFile)
            const {
                DB_URI,
            } = process.env;
            if (!DB_URI) {
                console.error(`${red}DB_URI environment variable is not set. Please set it and try again.${reset}`);
                process.exit(1);
            }
            
            console.log(`${yellow}Seeding database...${reset}`);
            runSql(`${c.sqlDir}/${c.sqlInitScript}`, DB_URI, projectRootDir);
            

            // add our handler (the main express app) as a middleware to the vite server
            server.middlewares.use(handler)
            
            // return a function that will be called when the vite server is ready
            // this is where we can do any initialization work
            return async () => {
                // run our server init function
                await init()
                
                // add a test users
                const address = server.httpServer?.address();
                const currentPort = typeof address === 'string' ? parseInt(address.split(':')[1]) : (address as AddressInfo).port;
                await addTestUses(currentPort.toString());
                await addIdentityProvider(currentPort.toString());
            }
        },
        configureServer: async function(server) {
            if (c.startDocker) {
                startDocker(projectRootDir)
            }
            const { handler, init } = await import('./src/server')
            const {
                DB_URI,
            } = process.env;
            if (!DB_URI) {
                console.error(`${red}DB_URI environment variable is not set. Please set it and try again.${reset}`);
                process.exit(1);
            }
            
            console.log(`${yellow}Seeding database...${reset}`);
            runSql(`${c.sqlDir}/${c.sqlInitScript}`, DB_URI, projectRootDir);
            

            // watch for changes in the sql directory and restart the server if any changes are detected
            server.watcher.add(`${projectRootDir}/${c.sqlDir}/**/*.sql`);
            let dbResetRunning = false;
            server.watcher.on('change', async (changedPath) => {
                if (changedPath.endsWith('.sql')) {
                    if (dbResetRunning) { return; }
                    dbResetRunning = true;
                    console.log(`${yellow}Detected change in ${changedPath}. Reloading...${reset}`);
                    const success = await runSql(`${c.sqlDir}/${c.sqlInitScript}`, DB_URI, projectRootDir);
                    if (success) {
                        await server.restart();
                        await server.ws.send({ type: 'full-reload' });
                        console.log(`${green}Changes applied successfully.${reset}`);
                    }
                    else {
                        console.error(`${red}Error applying changes.${reset}`);
                    }
                    dbResetRunning = false;
                }
            });
            
            // add our handler (the main express app) as a middleware to the vite server
            server.middlewares.use(handler)

            // return a function that will be called when the vite server is ready
            // this is where we can do any initialization work
            return async () => {
                // run our server init function
                await init()

                // add a test users
                const address = server.httpServer?.address();
                const currentPort = typeof address === 'string' ? parseInt(address.split(':')[1]) : (address as AddressInfo).port;
                await addTestUses(currentPort.toString());
                await addIdentityProvider(currentPort.toString());
            }
        },
    }
}

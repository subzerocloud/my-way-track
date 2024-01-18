

import { defineConfig } from 'vite';
import subzeroPlugin from './vite.subzero';
import react from '@vitejs/plugin-react';
import { buildSync } from "esbuild";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        subzeroPlugin(__dirname),
        {
            name: "build-server",
            apply: "build",
            enforce: "post",
            transformIndexHtml() {
                console.log("Building server...")
                buildSync({
                    entryPoints: [{ out: 'server', in: 'src/server.ts'}],
                    outExtension: { '.js': '.cjs' },
                    bundle: true,
                    platform: 'node',
                    outdir: 'dist',
                    minify: false,
                    metafile: true,
                    mainFields: ['module', 'main'],
                    sourcemap: true,
                    external: [
                        'performance',
                        '@libsql/client',
                        'express',
                        '@subzerocloud/auth',
                        '@subzerocloud/rest'
                    ],
                });
            },
        },
    ],
    build: {
        outDir: 'dist/public',
    }
});

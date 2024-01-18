

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { buildSync } from "esbuild";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
    plugins: [
        react(),
        {
            name: "build-service-worker",
            apply: "build",
            enforce: "post",
            transformIndexHtml() {
                console.log("Building service worker...")
                buildSync({
                    minify: true,
                    bundle: true,
                    entryPoints: ["service-worker.ts"],
                    outdir: "dist",
                });
            },
        },
    ],
    optimizeDeps: {
        exclude: ['@sqlite.org/sqlite-wasm', "@subzerocloud/rest-web"],
    },
    build: {
        outDir: 'dist',
        minify: true,
    },
});

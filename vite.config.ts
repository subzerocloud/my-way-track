

import { defineConfig } from 'vite';
import subzeroPlugin from './vite.subzero';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        subzeroPlugin(__dirname)
    ],
    build: {
        outDir: 'dist/public',
    },
    // preview: {
    //     port: process.env.FRONTEND_PORT?parseInt(process.env.FRONTEND_PORT):undefined,
    // },
    resolve: {
        alias: {
            'react-router': path.resolve(__dirname, './node_modules/react-router'),
            'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
            'react-query': path.resolve(__dirname, './node_modules/react-query'),
            '@supabase/supabase-js': path.resolve(__dirname, './node_modules/@supabase/supabase-js'),
            'react': path.resolve(__dirname, './node_modules/react'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
            'ra-core': path.resolve(__dirname, './node_modules/ra-core'),
            'ra-ui-materialui': path.resolve(__dirname, './node_modules/ra-ui-materialui'),
            '@emotion/react': path.resolve(__dirname, './node_modules/@emotion/react'),
        },
    },
});

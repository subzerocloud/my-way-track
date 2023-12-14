import * as esbuild from 'esbuild'
// import * as x from 'esbuild-plugin-copy';

// let result =
await esbuild.build({
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
        'better-sqlite3',
        
        'express',
        '@subzerocloud/auth',
        '@subzerocloud/rest'
    ],
    // in case you want to bundle auth and rest packages, uncomment the following lines
    // plugins: [
    //     x.copy({ assets: { from: ['./node_modules/@subzerocloud/auth/auth.wasm'], to: ['auth.wasm'] } }),
    //     x.copy({ assets: { from: ['./node_modules/@subzerocloud/auth/migrations/**/*'], to: ['migrations/'] } }),
    //     x.copy({ assets: { from: ['./node_modules/@subzerocloud/rest/subzero_wasm_bg.wasm'], to: ['subzero_wasm_bg.wasm'] } }),
    // ]
});

//console.log(await esbuild.analyzeMetafile(result.metafile))

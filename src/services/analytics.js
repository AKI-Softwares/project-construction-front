07:51:18.475 Running build in Washington, D.C., USA (East) – iad1
07:51:18.475 Build machine configuration: 2 cores, 8 GB
07:51:18.630 Cloning github.com/AKI-Softwares/project-construction-front (Branch: main, Commit: 589c3fe)
07:51:19.383 Cloning completed: 753.000ms
07:51:19.528 Restored build cache from previous deployment (3CKDfxQEbAUY89BuQkh7hXUiJAKH)
07:51:19.813 Running "vercel build"
07:51:19.842 Vercel CLI 54.19.0
07:51:20.841 Installing dependencies...
07:51:21.901 
07:51:21.902 up to date in 901ms
07:51:21.903 
07:51:21.903 30 packages are looking for funding
07:51:21.903   run `npm fund` for details
07:51:21.985 Running "npm run build"
07:51:22.145 
07:51:22.146 > cofront-web@0.0.0 build
07:51:22.146 > vite build
07:51:22.146 
07:51:22.648 vite v8.0.13 building client environment for production...
07:51:24.026 
transforming...✓ 168 modules transformed.
07:51:24.030 ✗ Build failed in 1.38s
07:51:24.031 error during build:
07:51:24.032 Build failed with 1 error:
07:51:24.032 
07:51:24.033 [PARSE_ERROR] Unexpected token
07:51:24.033    ╭─[ src/services/analytics.js:1:1 ]
07:51:24.034    │
07:51:24.034  1 │ <template>
07:51:24.035    │ ┬  
07:51:24.035    │ ╰── 
07:51:24.035 ───╯
07:51:24.036 
07:51:24.036     at aggregateBindingErrorsIntoJsError (file:///vercel/path0/node_modules/rolldown/dist/shared/error-CkdMJ9ps.mjs:48:18)
07:51:24.037     at unwrapBindingResult (file:///vercel/path0/node_modules/rolldown/dist/shared/error-CkdMJ9ps.mjs:18:128)
07:51:24.037     at #build (file:///vercel/path0/node_modules/rolldown/dist/shared/rolldown-build-BVD3dIdE.mjs:3275:34)
07:51:24.038     at async buildEnvironment (file:///vercel/path0/node_modules/vite/dist/node/chunks/node.js:33133:64)
07:51:24.038     at async Object.build (file:///vercel/path0/node_modules/vite/dist/node/chunks/node.js:33555:19)
07:51:24.039     at async Object.buildApp (file:///vercel/path0/node_modules/vite/dist/node/chunks/node.js:33552:153)
07:51:24.039     at async CAC.<anonymous> (file:///vercel/path0/node_modules/vite/dist/node/cli.js:777:3) {
07:51:24.040   errors: [Getter/Setter]
07:51:24.040 }
07:51:24.078 Error: Command "npm run build" exited with 1

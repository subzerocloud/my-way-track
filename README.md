# MyWayTrack
## Track your job applications privately

This is an app that allows you to track your job applications privately.
I's built using the [subZero](https://subzero.cloud/) stack.
The data is stored locally in your browser using [SQLite](https://sqlite.org/wasm/doc/trunk/index.md).
Although there is a logical split between the frontend and the backend similar to a traditional web application, the backend code (`server.ts`) is running in the browser as a Web Worker and all the requests made by the frontend code are intercepted by a service worker and routed to the worker running the backend code.

We call this "server free" architecture.

A live version is deployed at [https://my-way-track.vercel.app/](https://my-way-track.vercel.app/). 

To run it locally, clone the repo and run `npm install` followed by `npm run dev`.
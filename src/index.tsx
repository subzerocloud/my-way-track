import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles.css';

// create a worker that will run our server code
let workerReady = false;
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
})
// Worker message listener
worker.addEventListener('message', function(event) {
    const { type } = event.data;
    switch (type) {
        case 'worker-fetch-response':
            navigator.serviceWorker.controller.postMessage(event.data);
            break;
        case 'worker-ready':
            workerReady = true;
            break;
    }
});

// create a service worker that will intercept and forward fetch requests to the worker
let serviceWorkerReady = false;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
        import.meta.env.MODE === 'production' ? '/service-worker.js' : '/service-worker.ts',
        {
            type: 'module',
            scope: '/',
        }
    );

    navigator.serviceWorker.ready.then((registration) => {
        serviceWorkerReady = true;
    });

    // Listen for message from service worker
    navigator.serviceWorker.addEventListener('message', function(event) {
        const { type } = event.data;
        switch (type) {
            case 'worker-fetch':
                worker.postMessage(event.data);
                break;
        }
    });
}

// set a timer to check if the worker and service worker are ready then render the app
const timer = setInterval(async () => {
    if (workerReady && serviceWorkerReady) {
        clearInterval(timer);
        // delay for another 100ms to allow the service worker to claim the client
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
            <BrowserRouter><App /></BrowserRouter>
        );
    }
}, 100);

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//     <BrowserRouter><App /></BrowserRouter>
// );
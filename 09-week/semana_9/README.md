# Corte 2 - App Ionic React + API Express

## Architecture

This application consists of a full-stack system using Node.js with Express for the backend and Ionic React for the frontend. The backend server exposes a REST API with HTTP endpoints to retrieve and submit product data formatted as JSON. The GET /api/productos endpoint fetches the current list of products, while the POST /api/productos endpoint processes incoming payload data to register new entries. On the client side, Ionic React leverages functional components and the useState hook to manage application states, form inputs, and selected item details. Data fetching is handled via the asynchronous fetch API, featuring error management to handle network failures smoothly and display notifications to the user.
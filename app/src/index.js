/**
 * Index.js (Entry Point of the React Application)
 * ------------------------------------------------
 * - This file is the starting point of the React application.
 * - It sets up the React environment and renders the App component.
 * 
 * Main Responsibilities:
 * 1. Importing Essential Modules:
 *    - React: The core React library.
 *    - ReactDOM: Provides DOM-specific methods to enable an efficient way of managing DOM elements in a web page.
 *    - index.css: Global CSS file for styling.
 *    - App: The root component of the React application.
 * 
 * 2. Rendering the App Component:
 *    - The App component is mounted into the DOM inside the 'root' div (defined in index.html).
 *    - Uses ReactDOM.createRoot to create a root DOM node and the root.render method to render the App component.
 * 
 * Notes:
 * - The index.js file typically remains unchanged in most React applications.
 * - It is crucial for bootstrapping the React application.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
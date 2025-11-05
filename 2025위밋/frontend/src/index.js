import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container || document.body.appendChild(document.createElement('div')));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

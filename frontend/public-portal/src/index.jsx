import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Suppress WebSocket connection errors from browser extensions/devtools
const originalError = console.error
console.error = function(...args) {
  if (args[0]?.includes?.('WebSocket') || args[0]?.includes?.('ws://')) {
    return // Silent
  }
  originalError.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

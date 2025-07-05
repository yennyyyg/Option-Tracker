import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx: Starting application bootstrap...')

try {
  console.log('main.tsx: Creating React root...')
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  console.log('main.tsx: React root created successfully')
  
  console.log('main.tsx: Rendering App component...')
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('main.tsx: App component rendered successfully')
} catch (error) {
  console.error('main.tsx: Error during application bootstrap:', error)
  
  // Fallback error display
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
        <h1>Application Error</h1>
        <p>Failed to load the application. Check the console for details.</p>
        <pre>${error}</pre>
      </div>
    `
  }
}
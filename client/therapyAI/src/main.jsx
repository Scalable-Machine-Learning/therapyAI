import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { AuthcontextProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <AuthcontextProvider>
        <RouterProvider router={router} />
      </AuthcontextProvider>
      
    </>
  </StrictMode>,
)

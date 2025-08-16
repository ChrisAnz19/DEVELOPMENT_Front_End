import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import HubSpotOAuthCallback from './components/HubSpotOAuthCallback.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/oauth/hubspot/callback" element={<HubSpotOAuthCallback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app.tsx';
import './main.css';
import theme from './theme.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </CssVarsProvider>
  </React.StrictMode>
);

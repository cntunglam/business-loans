import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { AppRouter } from './app.tsx';
import './i18n/config';
import './main.css';
import theme from './theme.ts';

// const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme} defaultMode="light">
      {/* <QueryClientProvider client={queryClient}> */}
      {/* <UserProvider> */}
      <CssBaseline />
      <BrowserRouter>
        {/* <VisitorProvider> */}
        <AppRouter />
        {/* <ToastContainer /> */}
        {/* <DialogContainer /> */}
        {/* </VisitorProvider> */}
        {/* <ToastContainer /> */}
      </BrowserRouter>
      {/* </UserProvider> */}
      {/* </QueryClientProvider> */}
    </CssVarsProvider>
  </React.StrictMode>
);

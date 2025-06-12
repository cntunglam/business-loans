import { Navigate, useRoutes } from 'react-router-dom';
import { MainLayout } from './components/layout/mainLayout';
import { LoanApplicationView } from './views/loanApplication.view';

export const AppRouter = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <Navigate replace to="apply" /> },
        { path: 'apply', element: <LoanApplicationView /> },
        { path: '*', element: <Navigate replace to="apply" /> }
      ]
    },
    {
      path: '*',
      element: <Navigate replace to="/" />
    }
  ]);
  return routes;
};

import { LoanRequestTypeEnum } from '@roshi/shared';
import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { MainLayout } from './components/layout/mainLayout';
import { LoanApplicationView } from './views/loanApplication.view';

export const AppRouter = () => {
  const routes = useRoutes([
    /* {
      path: 'error/:code',
      element: <ErrorView />
    },
    {
      path: '/book/:code',
      element: <BookingView />
    },
    {
      path: '/signin',
      element: (
        <Authorization>
          <SigninView />
        </Authorization>
      )
    }, */
    {
      path: '/',
      element: (
        <React.Fragment>
          {/* <Authorization> */}
          {/* <MatomoTagManager /> */}
          <MainLayout />
          {/* </Authorization> */}
        </React.Fragment>
      ),
      children: [
        { path: 'apply', element: <LoanApplicationView loanRequestType={LoanRequestTypeEnum.GENERAL} /> },
        /* {
          path: 'apply-for-zero-interest-loan',
          element: <LoanApplicationView loanRequestType={LoanRequestTypeEnum.ZERO_INTEREST} />
        }, */
        { path: '*', element: <Navigate replace to="apply" /> }
      ]
    },
    /* {
      path: '/user',
      element: (
        <Authorization requiredRole={[UserRoleEnum.BORROWER, UserRoleEnum.ADMIN]}>
          <MatomoTagManager />
          <UserLayout />
        </Authorization>
      ),
      children: [
        { path: '', element: <Navigate replace to="dashboard" /> },
        { path: 'dashboard', element: <UserOverviewView /> },
        { path: 'documents', element: <UserDocumentsView /> },
        { path: '*', element: <Navigate replace to="dashboard" /> }
      ]
    },
    {
      path: '/applicant/:id',
      element: (
        <Authorization requiredRole={[UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]}>
          <ApplicantInfoView />
        </Authorization>
      )
    },
    {
      path: '/unsubscribe/:code',
      element: <UserUnsubscribeView />
    }, */
    {
      path: '*',
      element: <Navigate replace to="/" />
    }
  ]);
  return routes;
};

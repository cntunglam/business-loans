import { LoanRequestTypeEnum, UserRoleEnum } from "@roshi/shared";
import { Navigate, useRoutes } from "react-router-dom";
import { Authorization } from "./components/authentication/authorization";
import { AdminLayout } from "./components/layout/adminLayout";
import { AffiliateLayout } from "./components/layout/affiliateLayout";
import { LenderLayout } from "./components/layout/lenderLayout";
import { MainLayout } from "./components/layout/mainLayout";
import { UserLayout } from "./components/layout/userLayout";
import MatomoTagManager from "./components/shared/MatomoTagManager";
import { AdminDashboardView } from "./views/adminDashboard.view";
import { AffiliateOverviewView } from "./views/affiliateOverview";
import { ApplicantInfoView } from "./views/applicantInfoView";
import { BookingView } from "./views/bookingView";
import { ChatDashboardView } from "./views/chatDashboard.view";
import { ErrorView } from "./views/error.view";
import { LenderDashboardView } from "./views/lenderDashboard.view";
import { LenderSettingsView } from "./views/lenderSettings.view";
import { LoanApplicationView } from "./views/loanApplication.view";
import { SigninView } from "./views/signin.view";
import { UserDocumentsView } from "./views/userDocuments.view";
import { UserOverviewView } from "./views/userOverview.view";
import { UserUnsubscribeView } from "./views/userUnsubscribe.view";

export const AppRouter = () => {
  const routes = useRoutes([
    {
      path: "error/:code",
      element: <ErrorView />,
    },
    {
      path: "/book/:code",
      element: <BookingView />,
    },
    {
      path: "/signin",
      element: (
        <Authorization>
          <SigninView />
        </Authorization>
      ),
    },
    {
      path: "/",
      element: (
        <Authorization>
          <MatomoTagManager />
          <MainLayout />
        </Authorization>
      ),
      children: [
        { path: "apply", element: <LoanApplicationView loanRequestType={LoanRequestTypeEnum.GENERAL} /> },
        {
          path: "apply-for-zero-interest-loan",
          element: <LoanApplicationView loanRequestType={LoanRequestTypeEnum.ZERO_INTEREST} />,
        },
        { path: "*", element: <Navigate replace to="apply" /> },
      ],
    },
    {
      path: "/user",
      element: (
        <Authorization requiredRole={[UserRoleEnum.BORROWER, UserRoleEnum.ADMIN]}>
          <MatomoTagManager />
          <UserLayout />
        </Authorization>
      ),
      children: [
        { path: "", element: <Navigate replace to="dashboard" /> },
        { path: "dashboard", element: <UserOverviewView /> },
        { path: "documents", element: <UserDocumentsView /> },
        // { path: "my-application", element: <UserApplicationView /> },
        { path: "*", element: <Navigate replace to="dashboard" /> },
      ],
    },
    {
      path: "/affiliate",
      element: (
        <Authorization requiredRole={[UserRoleEnum.AFFILIATE, UserRoleEnum.ADMIN]}>
          <AffiliateLayout />
        </Authorization>
      ),
      children: [
        { path: "", element: <Navigate replace to="dashboard" /> },
        { path: "dashboard", element: <AffiliateOverviewView /> },
        { path: "*", element: <Navigate replace to="dashboard" /> },
      ],
    },
    {
      path: "/lender",
      element: (
        <Authorization requiredRole={[UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]}>
          <LenderLayout />
        </Authorization>
      ),
      children: [
        { path: "", element: <Navigate replace to="dashboard" /> },
        { path: "dashboard", element: <LenderDashboardView /> },
        { path: "settings", element: <LenderSettingsView /> },
      ],
    },
    {
      path: "/admin",
      element: (
        <Authorization requiredRole={[UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]}>
          <AdminLayout />
        </Authorization>
      ),
      children: [
        { path: "", element: <Navigate replace to="dashboard" /> },
        { path: "dashboard", element: <AdminDashboardView /> },
        { path: "chat", element: <ChatDashboardView /> },
        // { path: "chat", element: <ChatDashboardView /> },
      ],
    },
    {
      path: "/applicant/:id",
      element: (
        <Authorization requiredRole={[UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]}>
          <ApplicantInfoView />
        </Authorization>
      ),
    },
    {
      path: "/unsubscribe/:code",
      element: <UserUnsubscribeView />,
    },
    {
      path: "*",
      element: <Navigate replace to="/" />,
    },
  ]);
  return routes;
};

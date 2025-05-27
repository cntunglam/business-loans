import { UserRoleEnum, UserStatusEnum } from "@roshi/shared";
import { FC, ReactNode, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import { useUserContext } from "../../context/userContext";
import { LoadingPage } from "../shared/loadingPage";

export const DASHBOARD_REDIRECTS = {
  [UserRoleEnum.ADMIN]: "/admin",
  [UserRoleEnum.CUSTOMER_SUPPORT]: "/admin",
  [UserRoleEnum.LENDER]: "/lender/dashboard",
  [UserRoleEnum.BORROWER]: "/user/dashboard",
  [UserRoleEnum.AFFILIATE]: "/affiliate/dashboard",
} as const;

interface Props {
  children: ReactNode;
  requiredRole?: UserRoleEnum[];
}

export const Authorization: FC<Props> = ({ requiredRole, children }) => {
  const { user, isLoading, refetch } = useUserContext();
  const {
    data,
    isLoading: isLoadingApplication,
    isFetching,
  } = useGetMyLoanRequest({
    enabled: !!user && user.role !== UserRoleEnum.AFFILIATE,
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isLoading || isLoadingApplication || isFetching) return;

    //TEMPORARY SOLUTION TO BAN AN ACCOUNT
    if (user?.status && user.status !== UserStatusEnum.ACTIVE) {
      localStorage.removeItem("token");
      toast.error("Your account has been restricted");
      refetch?.();
      return navigate(`/signin`, { replace: true });
    }

    if (!user && pathname === "/") {
      return navigate(`/apply`, { replace: true });
    }

    if (!user && requiredRole) return navigate(`/signin`, { replace: true });

    if (user && requiredRole && !requiredRole.includes(user.role as UserRoleEnum)) {
      return navigate(DASHBOARD_REDIRECTS[user.role as keyof typeof DASHBOARD_REDIRECTS], { replace: true });
    }

    if (user && pathname === "/signin") {
      return navigate(DASHBOARD_REDIRECTS[user.role as keyof typeof DASHBOARD_REDIRECTS], { replace: true });
    }

    if (user && user.role === UserRoleEnum.AFFILIATE && !pathname.startsWith("/affiliate")) {
      return navigate(DASHBOARD_REDIRECTS[user.role as keyof typeof DASHBOARD_REDIRECTS], { replace: true });
    }

    if (user && pathname === "/") {
      return navigate(DASHBOARD_REDIRECTS[user.role as keyof typeof DASHBOARD_REDIRECTS], { replace: true });
    }

    if (
      user &&
      user.role === UserRoleEnum.BORROWER &&
      pathname.startsWith("/user") &&
      (!data || data.isWithdrawn || data.isExpired)
    ) {
      return navigate("/apply");
    }
  }, [
    data,
    isLoading,
    isLoadingApplication,
    navigate,
    pathname,
    refetch,
    requiredRole,
    searchParams,
    user,
    isFetching,
  ]);

  return (
    <>
      <LoadingPage variant="overlay" opacity={1} isLoading={isLoading || isLoadingApplication} />
      {children}
    </>
  );
};

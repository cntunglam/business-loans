import { Link, Typography } from "@mui/joy";
import { UserRoleEnum } from "@roshi/shared";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSingpassFetchPersons } from "../api/useSingpassApi";
import { DASHBOARD_REDIRECTS } from "../components/authentication/authorization";
import { Flex } from "../components/shared/flex";
import { LoadingPage } from "../components/shared/loadingPage";
import { useUserContext } from "../context/userContext";
import { KEYS } from "../data/constants";
import { getFromLocalStorage } from "../utils/localStorageHelper";

export const SingpassCallbackView = () => {
  const [searchParams] = useSearchParams();
  const { refetch: refetchUser } = useUserContext();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const codeVerifier = getFromLocalStorage<string>(KEYS.SINGPASS_CODE_VERIFIER);
  const visitorId = getFromLocalStorage<string>(KEYS.VISITOR_ID_KEY);
  // If no loan type is selected, it means the user is signing in
  const isSignin = !getFromLocalStorage<boolean>(KEYS.APPLICATION_LOAN_TYPE);
  const { data, isError } = useSingpassFetchPersons({
    code: code || undefined,
    codeVerifier: codeVerifier || undefined,
    visitorId: visitorId || undefined,
  });

  useEffect(() => {
    if (data?.success) {
      (async () => {
        if (data.token) {
          localStorage.setItem(KEYS.AUTH_TOKEN, data.token);
          await refetchUser?.();
          if (isSignin) {
            navigate(DASHBOARD_REDIRECTS[UserRoleEnum.BORROWER]);
          } else {
            navigate(`/singpass-apply`);
          }
        } else {
          navigate(`/singpass-apply`);
        }
      })();
    }
  }, [data?.token, data?.success, navigate, refetchUser]);

  return isError || (!code && !codeVerifier) ? (
    <Flex grow y yc xc gap2>
      <Typography level="body-lg">An error occurred while fetching your Singpass data</Typography>
      {!isSignin && <Link href="/apply?singpass=false">Go back to apply manually</Link>}
    </Flex>
  ) : (
    <LoadingPage isLoading={true} variant="overlay" />
  );
};

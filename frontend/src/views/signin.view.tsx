import { Box, Button, Divider, FormControl, FormHelperText, Input, Typography, useTheme } from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSingpassLogin } from "../api/useSingpassApi";
import { OTPModal } from "../components/authentication/OTPModal";
import { Flex } from "../components/shared/flex";
import { RoshiLogo } from "../components/shared/roshiLogo";
import { useUserContext } from "../context/userContext";
import { KEYS, TIME_CONSTANTS } from "../data/constants";
import { useLogin } from "../hooks/useLogin";
import { saveToLocalStorage } from "../utils/localStorageHelper";

export const SigninView = () => {
  const { isLoading: isLoadingUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const singpassLogin = useSingpassLogin();

  const { handleLogin, isLoading } = useLogin({
    onError: () => setEmailError(true),
    onSuccess: () => setIsOTPModalOpen(true),
  });

  return (
    <Flex y grow yc xc>
      {isOTPModalOpen && (
        <OTPModal
          onSuccess={() => {
            setIsOTPModalOpen(false);
          }}
          onClose={() => setIsOTPModalOpen(false)}
          email={email}
        />
      )}
      <Flex y xc gap2 fullwidth maxWidth="300px">
        <RoshiLogo />
        <FormControl error={emailError}>
          <Input
            sx={{ mt: 2, width: "300px" }}
            type="email"
            onKeyDown={(e) => e.key === "Enter" && handleLogin(email)}
            value={email}
            placeholder={t("email")}
            onChange={(e) => {
              setEmailError(false);
              setEmail(e.target.value);
            }}
          />
          {emailError && <FormHelperText>{t("invalid_email")}</FormHelperText>}
        </FormControl>
        <Button
          size="lg"
          onClick={() => handleLogin(email)}
          loading={isLoading || isLoadingUser}
          sx={{ width: "300px" }}
        >
          {t("signin")}
        </Button>
        <Flex y gap3 mt={4}>
          <Box sx={{ position: "relative" }}>
            <Divider />
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                border: "1px solid " + theme.palette.divider,
                width: "30px",
                height: "30px",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                borderRadius: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography fontSize="sm" textColor="neutral.400">
                OR
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => {
              singpassLogin.mutateAsync().then((data) => {
                localStorage.removeItem(KEYS.APPLICATION_LOAN_TYPE);
                saveToLocalStorage(KEYS.SINGPASS_CODE_VERIFIER, data.codeVerifier, TIME_CONSTANTS.ONE_HOUR);
                window.location.assign(data.authorizeUrl);
              });
            }}
            size="lg"
            sx={{ fontWeight: "bold", backgroundColor: "#F4323C", color: "white", width: "300px", mt: 3 }}
          >
            Login with Singpass
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

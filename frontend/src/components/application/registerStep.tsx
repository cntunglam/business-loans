import { CheckCircle } from "@mui/icons-material";
import { Button, FormControl, FormHelperText, Input, Link as JoyLink, Typography } from "@mui/joy";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/userContext";
import { CONSTANTS } from "../../data/constants";
import { useLogin } from "../../hooks/useLogin";
import { OTPModal } from "../authentication/OTPModal";
import { Flex } from "../shared/flex";

interface Props {
  onFinish: () => Promise<void>;
  setStep: Dispatch<SetStateAction<number>>;
}

export const RegisterStep: FC<Props> = ({ onFinish, setStep }) => {
  const { user } = useUserContext();
  const { t } = useTranslation("form");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  const { isLoading, handleLogin } = useLogin({
    onError: () => setEmailError(true),
    onSuccess: () => setIsOTPModalOpen(true),
  });

  return (
    <Flex y yc grow xc py={2} px={{ xs: 2, md: 0 }}>
      {isOTPModalOpen && (
        <OTPModal
          onSuccess={() => {
            onFinish();
            setIsOTPModalOpen(false);
          }}
          onClose={() => setIsOTPModalOpen(false)}
          email={email}
        />
      )}
      <Flex y sx={{ textAlign: "center" }} gap3 maxWidth="400px">
        <Typography level="title-lg" fontSize="1.8rem" textAlign="center" color="secondary">
          {t("finalStep.protecting")}
        </Typography>
        <>
          <Flex x yc xsb p={1} mx={3} sx={{ border: "1px solid #D9D9D9", borderRadius: 3 }}>
            <Flex x gap1 fontWeight={"700"}>
              <Typography color="primary">+84</Typography>
            </Flex>
            <Flex gap1>
              <Typography color="primary">VERIFIED</Typography>
              <CheckCircle color="primary" />
            </Flex>
          </Flex>

          {!user ? (
            <>
              <Flex y xc>
                <Typography level="h4" color="secondary">
                  {t("finalStep.almostThere")}
                </Typography>
                <Typography level="body-sm">{t("finalStep.addEmail")}</Typography>
              </Flex>
              <FormControl error={emailError} sx={{ width: "100%", px: { xs: 5 } }}>
                <Input
                  data-testid="email-input"
                  type="email"
                  placeholder="Email"
                  fullWidth
                  value={email}
                  onChange={(e) => {
                    setEmailError(false);
                    setEmail(e.target.value);
                  }}
                />
                {emailError && <FormHelperText>{t("finalStep.emailInput.error")}</FormHelperText>}
              </FormControl>
            </>
          ) : (
            <Flex x gap1 mx={3}>
              <Typography level="title-lg" textColor={"neutral.700"}>
                {t("finalStep.email_verified")}
              </Typography>
              <CheckCircle color="primary" />
            </Flex>
          )}
          <Flex fullwidth px={{ xs: 7, md: 9 }}>
            <Button
              fullWidth
              size="lg"
              onClick={() => (user ? onFinish() : handleLogin(email))}
              loading={isLoading}
              data-testid="launch-application-button"
            >
              {t("finalStep.launch")}
            </Button>
          </Flex>
          <JoyLink
            sx={{
              marginX: "auto",
            }}
            textColor={"neutral.400"}
            onClick={() => {
              setStep((step) => step - 1);
            }}
          >
            Back
          </JoyLink>

          <Typography>
            <Trans i18nKey="finalStep.agreement" t={t}>
              By registering you agree to ROSHI’s
              <JoyLink component={Link} to={CONSTANTS.PRIVACY_POLICY_URL} target="_blank" sx={{ display: "inline" }}>
                Privacy Policy
              </JoyLink>
              <JoyLink component={Link} to={CONSTANTS.TERMS_OF_USE_URL} target="_blank" sx={{ display: "inline" }}>
                Terms & Conditions
              </JoyLink>
              .
            </Trans>
          </Typography>
        </>
      </Flex>
    </Flex>
  );
};

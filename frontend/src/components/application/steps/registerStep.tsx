import { Button, FormControl, Link, Typography } from "@mui/material";
import { ApplicationStepsEnum } from "@roshi/shared";
import { useEffect, useRef, useState } from "react";
import { useSendOTP } from "../../../api/useAccountApi";
import { useCheckPhoneExistence } from "../../../api/useVisitorApi";
import { useUserContext } from "../../../context/userContext";
import { useVisitorContext } from "../../../context/visitorContext";
import { ASSETS } from "../../../data/assets";
import { CONSTANTS } from "../../../data/constants";
import { TEST_IDS } from "../../../utils/testUtils";
import { OTPModal } from "../../authentication/OTPModal";
import { WhatsappOTPModal } from "../../authentication/WhatsAppOTPModal";
import WarningIcon from "../../icons/warningIcon";
import { Flex } from "../../shared/flex";
import { NumericFormatAdapter } from "../../shared/numericFormatAdapter";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

interface Props {
  onSuccess: () => Promise<void>;
  isLoading: boolean;
}

export const RegisterStep = ({ onSuccess, isLoading }: Props) => {
  const { user, isLoading: userIsLoading } = useUserContext();
  const { visitor, goBack } = useVisitorContext();
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(!!user);
  const [emailValue, setEmailValue] = useState(user?.email || "");
  const [phoneValue, setPhoneValue] = useState("");
  const [error, setError] = useState("");
  const [isShowWhatsappOTPModal, setIsShowWhatsappOTPModal] = useState(false);
  const [isShowOTPModal, setIsShowOTPModal] = useState(false);
  const checkPhoneExistence = useCheckPhoneExistence();
  const sendOtp = useSendOTP();
  const isLoaded = useRef(false);

  useEffect(() => {
    if (userIsLoading) return;
    if (user) {
      setIsEmailValid(true);
      setEmailValue(user.email || "");
    }
  }, [user, userIsLoading]);

  useEffect(() => {
    if (visitor && !isPhoneValid && !isLoaded.current) {
      const data = visitor[ApplicationStepsEnum.phoneNumber]
      if (data) {
        const phone = (data as string).startsWith("65") ? (data as string).slice(2) : (data as string);
        setPhoneValue(phone);
        setIsPhoneValid(true);
        isLoaded.current = true;
      }
    }
  }, [isPhoneValid, visitor]);

  const handleCheckPhone = () => {
    if (!phoneValue) return;
    if (!visitor?.id) {
      console.error("Visitor id not found");
      return;
    }
    checkPhoneExistence.mutateAsync({ phone: `65${phoneValue}`, visitorId: visitor.id }).then((res) => {
      if (res.exists) {
        setIsShowWhatsappOTPModal(true);
      } else {
        setIsPhoneValid(true);
      }
    });
  };

  const handleCheckEmail = () => {
    if (!emailValue) {
      setError("Email is required");
      return;
    }

    sendOtp.mutateAsync({ email: emailValue }).then(() => {
      setIsShowOTPModal(true);
    });
  };

  const handleNext = () => {
    if (!isPhoneValid) {
      handleCheckPhone();
    } else if (!isEmailValid) {
      handleCheckEmail();
    } else {
      onSuccess();
    }
  };

  const handleBack = () => {
    if (!isPhoneValid) goBack();
    if (isPhoneValid) {
      setIsPhoneValid(false);
    } else if (isEmailValid && !user) {
      setIsEmailValid(false);
    } else if (isEmailValid && user) {
      setIsPhoneValid(false);
    }
  };

  return (
    <>
      {isShowWhatsappOTPModal && (
        <WhatsappOTPModal
          // Parent will handle the rest after we login here
          onSuccess={async () => {
            setIsShowWhatsappOTPModal(false);
            onSuccess();
          }}
          onClose={() => setIsShowWhatsappOTPModal(false)}
          phone={`65${phoneValue}`}
        />
      )}
      {isShowOTPModal && (
        <OTPModal
          onClose={() => setIsShowOTPModal(false)}
          onSuccess={() => {
            setIsShowOTPModal(false);
            onSuccess();
          }}
          email={emailValue}
          phone={`65${phoneValue}`}
        />
      )}
      <Flex y xc sx={{ textAlign: "center" }} gap3>
        <Flex y gap2 xc sx={{ maxWidth: "400px" }}>
          <FormControl error={!!error}>
            <ApplicationStyledInput
              data-testid={TEST_IDS.phoneNumberInput}
              disabled={isPhoneValid}
              fullWidth
              placeholder="Add your phone number"
              startDecorator={
                <Typography textColor="primary.500" level="title-lg">
                  +{CONSTANTS.PHONE_PREFIX}
                </Typography>
              }
              value={phoneValue}
              slotProps={{
                input: {
                  component: NumericFormatAdapter,
                  thousandSeparator: false,
                },
              }}
              sx={{ width: "300px" }}
              onChange={(e) => {
                setPhoneValue(e.target.value);
                setError("");
              }}
              endDecorator={isPhoneValid ? <img src={ASSETS.CHECKMARK} style={{ width: 20, height: 20 }} /> : undefined}
            />
          </FormControl>
          <FormControl error={!!error}>
            {isPhoneValid && (
              <ApplicationStyledInput
                data-testid={TEST_IDS.emailAddressInput}
                type="email"
                placeholder="Email"
                size="lg"
                fullWidth
                disabled={isEmailValid}
                value={emailValue}
                endDecorator={
                  isEmailValid ? <img src={ASSETS.CHECKMARK} style={{ width: 20, height: 20 }} /> : undefined
                }
                sx={{ width: "300px" }}
                onChange={(e) => {
                  setEmailValue(e.target.value);
                }}
              />
            )}
          </FormControl>
        </Flex>
        {error && (
          <Flex x xc mt={1} gap1>
            <WarningIcon color="danger" />
            <Typography textAlign={"center"} textColor="danger.500">
              {error}
            </Typography>
          </Flex>
        )}
      </Flex>

      <Flex y yst xc gap3 minHeight={"100px"}>
        <Button
          data-testid={TEST_IDS.nextStepButton}
          onClick={handleNext}
          loading={checkPhoneExistence.isPending || isLoading}
          sx={{
            width: 230,
            outline: "none !important",
          }}
          size="lg"
        >
          {isPhoneValid && isEmailValid ? "Submit" : "Next"}
        </Button>
        {!isLoading && !sendOtp.isPending && (
          <Link textColor={"neutral.400"} onClick={handleBack}>
            Back
          </Link>
        )}
      </Flex>
    </>
  );
};

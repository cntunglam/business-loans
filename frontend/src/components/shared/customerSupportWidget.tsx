import { ArrowForwardIos, WhatsApp } from "@mui/icons-material";
import { Avatar, Button, Tooltip, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../../data/assets";
import { CONSTANTS } from "../../data/constants";
import { generateWhatsappLinkForUser } from "../../utils/utils";
import { Flex } from "./flex";

const waAdminUrl = generateWhatsappLinkForUser(CONSTANTS.WA_PHONE_NUMBER);
const sessionKey = "hideTooltip";

export const CustomerSupportWidget = () => {
  const [isSupportTooltipOpen, setIsSupportTooltipOpen] = useState<boolean>(false);

  useEffect(() => {
    if (sessionStorage.getItem(sessionKey) === "true") return;
    setTimeout(() => {
      setIsSupportTooltipOpen(true);
    }, 5000);
  }, []);

  return (
    <Tooltip
      placement="bottom-end"
      open={isSupportTooltipOpen}
      sx={{ padding: 0, borderRadius: "8px", backgroundColor: "background.body" }}
      title={
        <Flex gap1 yc x sx={{ cursor: "pointer", p: 2 }} onClick={() => window.open(waAdminUrl, "_blank")}>
          <Avatar
            src={ASSETS.APRIL_AVATAR}
            sx={{ width: "62px", height: "62px", border: (theme) => "2px solid " + theme.palette.secondary[500] }}
          />
          <Flex y>
            <Flex x xsb>
              <Typography color="secondary" level="title-md">
                WhatsApp Support
              </Typography>
              <ArrowForwardIos
                onClick={(e) => {
                  setIsSupportTooltipOpen(false);
                  sessionStorage.setItem(sessionKey, "true");
                  e.preventDefault();
                  e.stopPropagation();
                }}
                sx={{ cursor: "pointer", transform: "rotate(90deg)", ":hover": { filter: "opacity(0.7)" } }}
              />
            </Flex>
            <Typography textColor="neutral.500" level="body-sm">
              Need assistance? I'm here to help!
            </Typography>
            <Typography level="body-sm">Steffanie (Loan Advisor)</Typography>
          </Flex>
        </Flex>
      }
    >
      <Button
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        component={Link}
        to={waAdminUrl}
        target="_blank"
        sx={{ position: "fixed", zIndex: 2, bottom: "20px", right: "20px", padding: 1, borderRadius: "50px" }}
      >
        <WhatsApp sx={{ fontSize: "2.5rem" }} />
      </Button>
    </Tooltip>
  );
};

import { CheckCircle } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  Divider,
  Grid,
  Link as JoyLink,
  List,
  ListItem,
  Typography,
} from "@mui/joy";
import { NonNullRT } from "@roshi/shared";
import { FC, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { useGetPartnerOffers } from "../../api/useLoanRequestApi";
import { extractTextFromHTML } from "../../utils/utils";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { Flex } from "../shared/flex";
import { FlexGrid } from "../shared/flexGrid";
import { RsModal } from "../shared/rsModal";
import { TitleAndValue } from "../shared/titleAndValue";

interface Props {
  offer?: NonNullRT<typeof useGetPartnerOffers>[0];
}

export const PartnerOfferCard: FC<Props> = ({ offer }) => {
  const { t } = useTranslation();
  const [isShowingDetails, setIsShowingDetails] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const keyFeatures = extractTextFromHTML(offer?.description || "");

  return (
    <Grid xs={12} sm={6} lg={4}>
      {isProceeding && (
        <RsModal onClose={() => setIsProceeding(false)} fullscreenOnMobile={false}>
          <FlexGrid container spacing={2}>
            <FlexGrid md={3}>
              <img src={offer?.company?.logo} style={{ objectFit: "contain", maxWidth: "200px" }} />
            </FlexGrid>
            <FlexGrid md={9}>
              <Typography level="body-sm">{offer?.company?.description}</Typography>
            </FlexGrid>
          </FlexGrid>
          <Typography p={2} mx={0.5} my={1} fontWeight={700}>
            {offer?.bankDescription}
          </Typography>
          <FlexGrid container spacing={4} sx={{ flexGrow: 1 }}>
            <TitleAndValue
              title="Apply for up to"
              value={formatApplicationData({ property: "amount", value: offer?.amount })}
            />
            <TitleAndValue
              title={"Annual Rate"}
              value={formatApplicationData({ property: "interestRate", value: offer?.interestRate })}
            />
            <TitleAndValue title="Tenure" value={formatApplicationData({ property: "term", value: offer?.term })} />
            <TitleAndValue title="Annual fee" value={formatApplicationData({ property: "amount", value: 0 })} />
            <TitleAndValue
              title="Processing fee"
              value={formatApplicationData({
                property: offer?.variableUpfrontFees ? "interestRate" : "amount",
                value: offer?.fixedUpfrontFees ? offer?.fixedUpfrontFees : offer?.variableUpfrontFees,
              })}
            />
          </FlexGrid>
          <Flex y xc gap2 mt={4}>
            <Button to={offer?.url || ""} component={Link} sx={{ width: "200px" }}>
              Apply
            </Button>
            <JoyLink color="neutral" onClick={() => setIsProceeding(false)}>
              Go Back
            </JoyLink>
          </Flex>
        </RsModal>
      )}
      <Flex
        y
        component={Card}
        sx={{
          boxShadow: "md",
          border: "none",
          borderRadius: "md",
        }}
      >
        <Flex x yc gap2>
          <img width="50px" src={offer?.company?.logo} />
          <Typography level="title-md">{offer?.company?.name}</Typography>
        </Flex>
        {/* <Typography level="title-md">{offer?.lender.name}</Typography> */}
        <Flex fullwidth x xsb>
          <Flex y xst>
            <Typography fontWeight="600" fontSize="xs" textColor="neutral.500">
                {t("form:offer-card.up-to")}
            </Typography>
            <Typography fontWeight={"600"} level="h4">
              {formatApplicationData({ property: "amount", value: offer?.amount })}
            </Typography>
          </Flex>
          <Flex y xst>
            <Typography fontWeight="600" fontSize="xs" textColor="neutral.500">
             {t("form:offer-card.monthly")}
            </Typography>
            <Typography level="h4" width="100%" textAlign={"end"} fontWeight={"600"}>
              {formatApplicationData({ property: "interestRate", value: offer?.interestRate })}
            </Typography>
          </Flex>
        </Flex>
        <Accordion onChange={(_, expanded) => setIsShowingDetails(expanded)} sx={{ mx: -2, mb: -1.5 }}>
          <AccordionSummary
            sx={{
              ".MuiAccordionSummary-button": {
                py: 1,
                alignItems: "center",
                justifyContent: "center",
                fontSize: (theme) => theme.typography["body-sm"].fontSize,
                color: (theme) => theme.palette.neutral[500],
              },
            }}
          >
            {isShowingDetails ? t("form:offer-card.show-less") : t("form:offer-card.show-more")}
          </AccordionSummary>
          <AccordionDetails>
            <Flex y gap1 px={2}>
              <Typography textColor="neutral.700" level="title-md">
                {t("form:offer-card.features")}
              </Typography>
              <Typography level="body-sm">
                <List>
                  {keyFeatures.map((feature, index) => (
                    <ListItem key={index} sx={{ display: "flex", alignItems: "start", px: 0 }}>
                      {" "}
                      <CheckCircle sx={{ color: "success.400", mt: 0.5 }} />
                      {feature}
                    </ListItem>
                  ))}
                </List>

                {/* <div dangerouslySetInnerHTML={{ __html: offer?.description || "" }} /> */}
              </Typography>
            </Flex>
          </AccordionDetails>
        </Accordion>
        <Divider inset="none" />
        <Flex fullwidth x xsb yc>
          <Typography textColor="#2F80ED" level="title-md">
             {t("form:offer-card.partner-offers")}
          </Typography>
          <Button onClick={() => setIsProceeding(true)}>{t("form:offer-card.proceed")}</Button>
        </Flex>
      </Flex>
    </Grid>
  );
};

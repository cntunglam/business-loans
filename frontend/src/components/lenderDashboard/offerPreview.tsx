import { Typography } from "@mui/joy";
import { LoanOffer } from "@roshi/shared";
import { format } from "date-fns";
import { FC } from "react";
import { formatToDisplayString } from "../../utils/utils";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
  offer?: LoanOffer;
  lenderName?: string;
  isClosedDeal?: boolean;
}

export const OfferPreview: FC<Props> = ({ onClose, offer, isClosedDeal, lenderName }) => {
  return (
    <RsModal title={isClosedDeal ? "Closed loan preview" : "Offer preview"} onClose={onClose}>
      {[
        ["Amount", `${formatToDisplayString(offer?.amount)}$`],
        ["Term", `${offer?.term} months`],
        ["Interest rate", `${offer?.monthlyInterestRate}%`],
        ["Fixed upfront fees", `${formatToDisplayString(offer?.fixedUpfrontFees)}$`],
        ["Variable upfront fee", `${formatToDisplayString(offer?.variableUpfrontFees)}%`],
        ["Offer made on", `${offer?.createdAt && format(offer?.createdAt, "yyyy-MM-dd HH:mm")}`],
        ["Lender", lenderName],
      ].map((item, index) => {
        return (
          <Flex
            x
            xsb
            style={{
              gap: 0,
              backgroundColor: index % 2 === 1 ? "#F7F7F7" : "transparent", // Light gray for odd items
              padding: "5px", // Optional for better spacing
              borderRadius: "4px", // Optional for rounded corners
            }}
          >
            <Typography fontWeight={"500"}>{item[0]}</Typography>
            <Typography>{item[1]}</Typography>
          </Flex>
        );
      })}
    </RsModal>
  );
};

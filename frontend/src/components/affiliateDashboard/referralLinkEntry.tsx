import { CopyAll, MoreHoriz, QrCode as QrCodeIcon } from "@mui/icons-material";
import { Dropdown, Link, Menu, MenuButton, MenuItem, Typography } from "@mui/joy";
import { format } from "date-fns";
import React, { FC, useCallback } from "react";

import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ReferralLink, useDeleteReferralLink } from "../../api/useAffiliateApi";
import { OpenDialog } from "../../context/DialogContainer";
import { Flex } from "../shared/flex";
import { RsEllipsis } from "../shared/rsEllipsis";
import { RsTooltip } from "../shared/rsTooltip";
import { LinkQrCodeModal } from "./linkQrCodeModal";

type ModalType = "qr";

export interface ReferralLinkEntryProps {
  referralLink: ReferralLink;
  refetch: () => void;
}

export const ReferralLinkEntry: FC<ReferralLinkEntryProps> = ({ referralLink, refetch }) => {
  const { mutateAsync: deleteReferralLink } = useDeleteReferralLink();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentModal = searchParams.get("id") === referralLink.id ? searchParams.get("modal") : undefined;

  const openModal = useCallback(
    (modalType: ModalType) =>
      setSearchParams((searchParams) => {
        searchParams.set("modal", modalType);
        searchParams.set("id", referralLink.id);
        return searchParams;
      }),
    [referralLink.id, setSearchParams]
  );

  const closeModal = useCallback(
    () =>
      setSearchParams((searchParams) => {
        searchParams.delete("modal");
        searchParams.delete("id");
        return searchParams;
      }),
    [setSearchParams]
  );

  const renderModal = useCallback(() => {
    if (currentModal === "qr") {
      return <LinkQrCodeModal id={referralLink.id} link={referralLink.link} onClose={closeModal} />;
    }
  }, [currentModal, closeModal, referralLink]);

  return (
    <React.Fragment key={referralLink.id}>
      {renderModal()}
      <td>
        <RsEllipsis text={referralLink.utmCampaign || ""} maxLines={2} />
      </td>
      <td>
        <Flex x yc gap1>
          
          <QrCodeIcon
            sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
            onClick={() => {
              openModal("qr");
            }}
          />

          <CopyAll
            sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
            onClick={() => {
              navigator.clipboard.writeText(referralLink.link);
              toast.success("Link copied to clipboard");
            }}
          />
          <Link
            color="neutral"
            component="a"
            href={referralLink.link}
            target="_blank"
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              display: "block",
            }}
          >
            {referralLink.link}
          </Link>
        </Flex>
      </td>
      <td>
        <Flex x yc gap1>
          <CopyAll
            sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
            onClick={() => {
              navigator.clipboard.writeText(referralLink.shortUrl?.url || "");
              toast.success("Link copied to clipboard");
            }}
          />
          <Link
            color="neutral"
            component="a"
            href={referralLink.shortUrl?.url || ""}
            target="_blank"
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              display: "block",
            }}
          >
            {referralLink.shortUrl?.url || ""}
          </Link>
        </Flex>
      </td>
      <td>{referralLink.visits}</td>
      <td>{referralLink.applications}</td>
      <td>{referralLink.closedLoanRequests}</td>
      <td>
        <RsTooltip title={format(referralLink.createdAt, "dd MMMM yyyy HH:mm")}>
          <Typography>{format(referralLink.createdAt, "dd MMMM yyyy HH:mm")}</Typography>
        </RsTooltip>
      </td>
      <td>
        <Dropdown>
          <MenuButton size="sm">
            <MoreHoriz />
          </MenuButton>
          <Menu>
            <MenuItem
              onClick={() =>
                OpenDialog({
                  type: "confirm",
                  title: "Delete referral link",
                  body: "Are you sure you want to delete this referral link?",
                  submit: () => {
                    deleteReferralLink(referralLink.id).then(() => {
                      toast.success("Referral link deleted successfully");
                      refetch();
                    });
                  },
                })
              }
            >
              Delete
            </MenuItem>
          </Menu>
        </Dropdown>
      </td>
    </React.Fragment>
  );
};

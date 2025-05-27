import { Button, Input, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateReferralLink } from "../../api/useAffiliateApi";
import { Flex } from "../shared/flex";
import { RsSelect } from "../shared/rsSelect";

const ROSHI_APP_PART = "https://app.roshi.sg";

const TARGET_URLS = [
  {
    label: "ROSHI Homepage",
    value: "https://www.roshi.sg/",
  },
  {
    label: "ROSHI Marketplace",
    value: "https://www.roshi.sg/marketplace/",
  },
  {
    label: "ROSHI Marketplace - Home Loans",
    value: "https://www.roshi.sg/marketplace/home-loans/property-looking-to-buy",
  },
  {
    label: "ROSHI Marketplace - Refinance Home Loans",
    value: "https://www.roshi.sg/marketplace/refinance-home-loans/property-looking-to-refinance",
  },
  {
    label: "ROSHI APP - Personal loan application form",
    value: "https://app.roshi.sg/apply",
  },
];

type Props = {
  onSuccess: () => void;
};

export const CreateReferralLink = ({ onSuccess }: Props) => {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const { mutateAsync: createReferralLink, isPending } = useCreateReferralLink();

  const handleCreateReferralLink = async () => {
    if (!name || !targetUrl) {
      return;
    }

    let url = TARGET_URLS.find((url) => url.label === targetUrl)?.value;

    // handle replace roshgi application form url with app.roshi.sg
    if (url!.includes(ROSHI_APP_PART)) {
      url = url!.replace(ROSHI_APP_PART, window.location.origin);
    }

    createReferralLink({ name, targetUrl: url! }).then(() => {
      toast.success("Referral link created successfully");
      onSuccess();
      setName("");
      setTargetUrl("");
    });
  };

  return (
    <Flex y py={6} px={2}>
      <Flex y>
        <Typography level="h4" fontWeight={"700"} color="secondary">
          Add Referral Link
        </Typography>
        <Flex y gap={4} mt={4} sx={{ width: "100%" }}>
          <Flex y>
            <label htmlFor="name">Name</label>
            <Input placeholder="Enter name of the link" value={name} onChange={(e) => setName(e.target.value)} />
          </Flex>

          <Flex y>
            <label htmlFor="targetUrl">Select target url</label>
            <RsSelect
              sx={{ width: "100%" }}
              placeholder="Target Url"
              value={targetUrl || null}
              values={TARGET_URLS.map((url) => url.label)}
              setValue={(val) => {
                setTargetUrl(val as string);
              }}
            />
          </Flex>

          <Button
            variant="solid"
            size="sm"
            sx={{ width: "fit-content" }}
            onClick={handleCreateReferralLink}
            disabled={isPending}
          >
            Create
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

import { CopyAll, Download } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import { Button } from "@mui/material";
import { FC } from "react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";

interface Props {
  link: string;
  id: string;
  onClose: () => void;
}

export const LinkQrCodeModal: FC<Props> = ({ id, link, onClose }) => {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-code:${id}`) as SVGElement | null;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-code-${id}.png`;
      link.click();
    };
    img.src = url;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <RsModal onClose={onClose} title="Generated QR Code" minWidth="sm">
      <Flex flexDirection={"column"} flex={1} justifyContent={"center"} alignItems={"center"}>
        <Typography level="body-lg" mb={2}>
          This QR code contains your referral link.
        </Typography>
        <QRCode value={link} size={256} viewBox={`0 0 256 256`} id={`qr-code:${id}`} />
      </Flex>
      <Flex justifyContent={"space-between"} alignItems={"center"} gap2 mt={3}>
        <Button onClick={handleDownload} sx={{ flex: 1, gap: 0.5 }}>
          <Download />
          Download QR
        </Button>
        <Button onClick={handleCopy} sx={{ flex: 1, gap: 0.5 }}>
          <CopyAll />
          Copy Link
        </Button>
      </Flex>
    </RsModal>
  );
};

import { Typography } from "@mui/joy";
import { FC } from "react";
import { FlexGrid } from "./flexGrid";

interface Props {
  title: string;
  value: string;
}

export const TitleAndValue: FC<Props> = ({ title, value }) => {
  return (
    <FlexGrid xs={6} sm={4} md={2.4} y xc sx={{ textTransform: "uppercase" }}>
      <Typography textColor="neutral.500" level="title-sm" fontSize={"xs"}>
        {title}
      </Typography>
      <Typography level="title-lg">{value}</Typography>
    </FlexGrid>
  );
};

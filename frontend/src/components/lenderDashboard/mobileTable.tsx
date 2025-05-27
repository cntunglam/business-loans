import { AccordionGroup, Box, Stack, Typography } from "@mui/joy";
import { useMemo } from "react";
import { ColumnConfig } from "../shared/rsTable";

interface Props<T> {
  data: T[] | undefined;
  columns: ColumnConfig<T>[];
  currentItem: number;
}

export function MobileTable<T extends { id: string }>({ data, columns, currentItem }: Props<T>) {
  const item = useMemo(() => data?.[currentItem - 1], [data, currentItem]);

  if (!item) return null;

  return (
    <AccordionGroup key={"row_" + item.id} sx={{ mb: 2, width: "100%", backgroundColor: "common.white" }}>
      <Typography p={1} level="body-sm" fontWeight={"700"} sx={{ color: "common.black" }}>
        Loan Information
      </Typography>
      <Stack>
        {columns.map((field, index) => (
          <Box
            key={`row_${item.id}_column_${field.key}`}
            sx={{
              p: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: index % 2 ? "common.white" : "neutral.greyLighter",
            }}
          >
            <Typography level="body-sm">{field.title}</Typography>
            {item && field.render(item)}
          </Box>
        ))}
      </Stack>
    </AccordionGroup>
  );
}

import { Box, Sheet, styled, Table, Typography } from "@mui/joy";
import React, { useMemo } from "react";
import { Flex } from "../flex";
import { Pagination } from "../pagination";
import "./style.css";

export interface ColumnConfig<T> {
  key: string;
  title: string;
  pinned?: "left" | "right" | "";
  width?: number;
  align?: "left" | "center" | "right";
  render: (record: T) => React.ReactNode;
}

interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

interface CommonTableProps<T> {
  data: T[] | undefined;
  columns: ColumnConfig<T>[];
  pagination?: PaginationConfig;
}

const StyledTHead = styled("th")<{ column: { width?: number; align?: string; pinned?: "left" | "right" | "" } }>`
  text-align: ${(props) => props.column.align || "center"};
  width: ${(props) => props.column.width || 100}px;
  min-width: ${(props) => props.column.width || 100}px;
  max-width: ${(props) => props.column.width || 100}px;
  border-right: 1px solid #dfdfdf;
  border-bottom: none;
  text-wrap: wrap;
  white-space: pre-wrap;
  vertical-align: middle;
  padding: 3;
  z-index: ${(props) => (props.column.pinned ? 2 : 0)};

  &:last-child {
    width: 100% !important;
    max-width: 100% !important;
  }
`;

export default function RCTable<T>({ data, columns, pagination }: CommonTableProps<T>) {
  const { leftPinned, rightPinned, unpinned } = useMemo(() => {
    const leftPinned = columns.filter((col) => col.pinned === "left");
    const rightPinned = columns.filter((col) => col.pinned === "right");
    const unpinned = columns.filter((col) => !col.pinned);

    return { leftPinned, unpinned, rightPinned };
  }, [columns]);

  return (
    <Box sx={{ my: 1 }}>
      <Sheet className="table-wrapper" sx={{ width: "100%", overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              {[...leftPinned, ...unpinned, ...rightPinned].map((column, index) => {
                return (
                  <StyledTHead
                    key={column.key}
                    column={column}
                    className={
                      column.pinned === "left"
                        ? "pin-left " + (index === leftPinned.length - 1 ? "pin-left-end" : "")
                        : column.pinned === "right"
                          ? "pin-right " + (index === 0 ? "pin-right-start" : "")
                          : ""
                    }
                    style={{
                      right:
                        column.pinned === "right"
                          ? rightPinned.slice(index + 1).reduce((total, curr) => {
                              total += curr?.width || 100;
                              return total;
                            }, 0)
                          : undefined,
                      left:
                        column.pinned === "left"
                          ? leftPinned.reduce((acc, curr, currIndex) => {
                              if (currIndex < index) {
                                return acc + (curr.width || 100);
                              }
                              return acc;
                            }, 0)
                          : undefined,
                    }}
                  >
                    {column.title}
                  </StyledTHead>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data?.map((record, rowIndex) => (
              <tr key={rowIndex}>
                {leftPinned.map((column, index) => (
                  <td
                    key={column.key}
                    className={"pin-left " + (index === leftPinned.length - 1 ? "pin-left-end" : "")}
                    style={{
                      textAlign: column.align || "left",
                      left: leftPinned.reduce((acc, curr, currIndex) => {
                        if (currIndex < index) {
                          return acc + (curr.width || 100);
                        }
                        return acc;
                      }, 0),
                      width: column.width || 100,
                      minWidth: column.width || 100,
                      maxWidth: column.width || 100,
                      zIndex: 2,
                    }}
                  >
                    {column.render(record)}
                  </td>
                ))}
                {unpinned.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      textAlign: column.align || "left",
                      width: column.width || 100,
                    }}
                  >
                    {column.render(record)}
                  </td>
                ))}
                {rightPinned.map((column, index) => (
                  <td
                    key={column.key}
                    className={"pin-right " + (index === 0 ? "pin-right-start" : "")}
                    style={{
                      textAlign: column.align || "left",
                      right: rightPinned.slice(index + 1).reduce((total, curr) => {
                        total += curr?.width || 100;
                        return total;
                      }, 0),
                      width: column.width || 100,
                      minWidth: column.width || 100,
                      maxWidth: column.width || 100,
                      zIndex: 2,
                    }}
                  >
                    {column.render(record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        {data?.length === 0 && (
          <Flex x yc xc py={2} sx={{ background: "white" }}>
            <Typography sx={{ fontSize: "14px", letterSpacing: "0.8px" }}>No results.</Typography>
          </Flex>
        )}
      </Sheet>
      {pagination && (
        <Flex
          x
          xsb
          yc
          sx={{
            p: 1,
            borderRadius: "0 0 8px 8px",
            boxShadow: " 3px 6px 4px 2px #00000014",
          }}
        >
          <Typography level="body-sm" textColor={"common.black"}>
            {pagination.totalItems} <Typography textColor={"neutral.500"}>items</Typography>
          </Typography>
          <Pagination
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            page={pagination.currentPage}
            onPageChange={pagination.onPageChange}
          />
        </Flex>
      )}
    </Box>
  );
}

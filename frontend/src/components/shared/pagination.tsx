import { Button, Typography } from "@mui/joy";
import ArrowRightIcon from '../icons/arrowRightIcon';
import { Flex } from "./flex";

export const Pagination = ({
  page,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  page: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getDisplayedPages = () => {
    if (totalPages <= 5) return pages;

    if (page <= 3) return [...pages.slice(0, 5), "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", ...pages.slice(totalPages - 5)];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const displayedPages = getDisplayedPages();
  return (
    <Flex x gap={1}>
      {totalPages > 0 && (
        <Button
          disabled={page === 1}
          variant="soft"
          color="neutral"
          onClick={() => onPageChange(page - 1)}
          sx={{
            py: "0.5rem",
            backgroundColor: 'white',
            // border: "1px solid",
            // borderRadius: "4px",
            // borderColor: "neutral.300",
            width: "32px",
            height: "32px",
          }}
        >
          <ArrowRightIcon sx={{ transform: "rotate(180deg)" }} />
        </Button>
      )}
      {displayedPages.map((p, index) =>
        typeof p === "number" ? (
          <Button
            key={index}
            variant="outlined"
            color={p === page ? "link" : "neutral"}
            onClick={() => typeof p === "number" && onPageChange(p)}
            sx={{
              py: "0.5rem",
              borderRadius: "4px",
              width: "20px",
              height: "20px",
            }}
          >
            {p}
          </Button>
        ) : (
          <Typography
            textColor={"neutral.400"}
            fontSize={"1.5rem"}
            textAlign={"center"}
            sx={{ display: "inline", width: "20px", height: "20px" }}
          >
            ...
          </Typography>
        )
      )}
      {totalPages > 0 && (
        <Button
          disabled={page === totalPages}
          variant="soft"
          color="neutral"
          onClick={() => onPageChange(page + 1)}
          sx={{
            py: "0.5rem",
            backgroundColor: 'white',
            // border: "1px solid",
            // borderRadius: "4px",
            // borderColor: "neutral.300",
            width: "32px",
            height: "32px",
          }}
        >
          <ArrowRightIcon />
          {/* <ArrowRight /> */}
        </Button>
      )}
    </Flex>
  );
};

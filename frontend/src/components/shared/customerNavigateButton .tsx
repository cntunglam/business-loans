import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { styled } from "@mui/joy/styles";

const CustomNavigateNext = styled(NavigateNext)(({ theme }) => ({
  position: "fixed",
  top: "50%",
  right: "20px",
  fontSize: 40,
  zIndex: 9,
  background: theme.palette.background.level1,
  borderRadius: 8,
  border: "1px solid var(--joy-palette-primary-400)",
  color: "var(--joy-palette-primary-400)",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    border: "1px solid var(--joy-palette-primary-600)",
    color: "var(--joy-palette-primary-600)",
  },
}));

const CustomNavigateBefore = styled(NavigateBefore)(({ theme }) => ({
  position: "fixed",
  top: "50%",
  left: "20px",
  fontSize: 40,
  zIndex: 9,
  background: theme.palette.background.level1,
  borderRadius: 8,
  border: "1px solid var(--joy-palette-primary-400)",
  color: "var(--joy-palette-primary-400)",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    border: "1px solid var(--joy-palette-primary-600)",
    color: "var(--joy-palette-primary-600)",
  },
}));

export { CustomNavigateBefore, CustomNavigateNext };

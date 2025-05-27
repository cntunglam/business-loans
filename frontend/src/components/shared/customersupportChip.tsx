import { Box, ColorPaletteProp, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { Chip } from "@mui/material";
import { hashStringToNumber, isAdmin } from "@roshi/shared";
import { FC } from "react";
import { useGetUsers } from "../../api/useAdminApi";
import { useAssignCustomerSupport } from "../../api/useLoanRequestApi";
import { useUserContext } from "../../context/userContext";

interface CustomerSupportChipProps {
  customerSupport?: {
    name: string | null;
    id: string;
  } | null;
  loanRequestId: string;
  callback?: () => void;
  className?: string;
}

const CUSTOMER_SERVICE_COLORS = ["primary", "success", "warning"];

export const CustomerSupportChip: FC<CustomerSupportChipProps> = ({
  customerSupport,
  loanRequestId,
  callback,
  className,
}) => {
  const { mutateAsync: assignCustomerSupport } = useAssignCustomerSupport(loanRequestId);
  const colorIndex = hashStringToNumber(customerSupport?.name || "", CUSTOMER_SERVICE_COLORS.length);
  const {
    query: { data: customerSupports },
  } = useGetUsers({ isAssignableToLoanRequest: true });
  const { user } = useUserContext();

  const handleAssignCustomerSupport = (user: { id: string; name: string | null }) => {
    assignCustomerSupport({ customerSupportId: user.id }).then(() => {
      callback && callback();
    });
  };

  return (
    <Box className={className} onClick={(e) => e.stopPropagation()}>
      <Dropdown>
        <MenuButton sx={{ border: "none", outline: "none", ":hover": { backgroundColor: "transparent" }, padding: 0 }}>
          <Chip
            variant="soft"
            color={customerSupport ? (CUSTOMER_SERVICE_COLORS[colorIndex] as ColorPaletteProp) : "neutral"}
            onClick={() => {}}
          >
            {customerSupport?.name || "Unassigned"}
          </Chip>
        </MenuButton>
        {isAdmin(user?.role) && (
          <Menu placement="bottom-end">
            {customerSupports?.map((user) => (
              <MenuItem key={user.id} onClick={() => handleAssignCustomerSupport(user)}>
                {user.name}
              </MenuItem>
            ))}
          </Menu>
        )}
      </Dropdown>
    </Box>
  );
};

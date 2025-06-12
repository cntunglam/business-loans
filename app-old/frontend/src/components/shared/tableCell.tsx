import { Box } from '@mui/joy';

export const TableCell = ({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
}) => {
  return (
    <Box
      component={'td'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      }}
      sx={{
        cursor: onClick ? 'pointer' : undefined,
        ':hover': onClick ? { backgroundColor: 'neutral.100' } : undefined
      }}
    >
      {children}
    </Box>
  );
};

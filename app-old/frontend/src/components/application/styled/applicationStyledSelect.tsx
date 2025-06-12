import { Select, SelectProps } from '@mui/joy';

//eslint-disable-next-line
export const ApplicationStyledSelect = <OptionValue extends {}, Multiple extends boolean = false>(
  props: SelectProps<OptionValue, Multiple> & { 'data-testid'?: string }
) => {
  const { sx, 'data-testid': dataTestid, ...rest } = props;
  return (
    <Select
      size="lg"
      sx={{ width: { sm: '400px', xs: '100%' }, ...sx }}
      data-testid={dataTestid}
      {...rest}
      slotProps={{
        listbox: {
          'data-testid': `${dataTestid}_listbox`
        }
      }}
    />
  );
};

import { Option, Select } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import _ from 'lodash';
import { Flex } from './flex';

type Props<T extends number | string> = {
  values: T[];
  value?: T | T[] | null;
  setValue: (value: T | T[] | (T | T[])[] | null | undefined) => void;
  placeholder?: string;
  sx?: SxProps;
  error?: boolean;
} & React.ComponentProps<typeof Select>;

export const RsSelect = <T extends number | string>({ values, value, setValue, placeholder, sx, error, ...rest }: Props<T>) => {
  return (
    <Flex
      x
      yc
      sx={{
        '.MuiSelect-variantOutlined > .MuiSelect-button': {
          opacity: _.isEmpty(value) && !error ? 'var(--Select-placeholderOpacity)' : 1,
          color: error ? 'var(--joy-palette-danger-400)' : ''
        },
        '.Mui-expanded.MuiSelect-variantOutlined:before': {
          border: error ? '2px solid var(--joy-palette-danger-500)' : '2px solid var(--joy-palette-primary-500)'
        },
        '.MuiSelect-variantOutlined': {
          border: error ? '1px solid var(--joy-palette-danger-300)' : ''
        },
        overflow: 'hidden'
      }}
    >
      <Select
        size="sm"
        variant="soft"
        placeholder={placeholder}
        value={value}
        onChange={(_, val) => setValue((val as T) || undefined)}
        sx={sx}
        {...rest}
      >
        {values.map((value) => (
          <Option key={value} value={value}>
            {value}
          </Option>
        ))}
      </Select>
    </Flex>
  );
};

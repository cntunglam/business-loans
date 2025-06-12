import { Check } from '@mui/icons-material';
import { Option, Select } from '@mui/joy';
import GlobalStyles from '@mui/material/GlobalStyles';
import _ from 'lodash';
import React from 'react';
import { Flex } from './flex';

type Props<T extends number | string> = React.ComponentProps<typeof Select> & {
  values: { label: string; value: T }[];
  setValue: (value?: T[]) => void;
  selectedItems?: T[];
  selectedIcon?: React.ReactNode;
  error?: boolean;
};

export const RsMultipleSelect = <T extends number | string>({
  values,
  setValue,
  error,
  selectedItems,
  selectedIcon,
  ...rest
}: Props<T>): JSX.Element => {
  return (
    <Flex
      x
      yc
      sx={{
        '.MuiSelect-variantOutlined > .MuiSelect-button': {
          opacity: _.isEmpty(rest?.value) && !error ? 'var(--Select-placeholderOpacity)' : 1,
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
      <GlobalStyles
        styles={{
          '.MuiOption-root': {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          },
          '.MuiOption-root.Mui-selected': {}
        }}
      />
      <Select multiple disabled={!values?.length} {...rest} onChange={(_, val) => setValue(val as T[])}>
        {values.map((item) => (
          <Option key={item.value} value={item.value}>
            {item.label}
            {selectedItems?.includes(item.value) ? selectedIcon ? selectedIcon : <Check color="success" /> : null}
          </Option>
        ))}
      </Select>
    </Flex>
  );
};

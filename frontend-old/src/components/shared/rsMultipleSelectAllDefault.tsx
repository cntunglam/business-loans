import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Option, Select } from '@mui/joy';
import GlobalStyles from '@mui/material/GlobalStyles';
import _ from 'lodash';
import { Flex } from './flex';

type Props<T extends number | string> = React.ComponentProps<typeof Select> & {
  values: { label: string; value: T }[];
  setValue: (value?: T[]) => void;
  selectedItems?: T[];
  error?: boolean;
};

export const RsMultipleSelectAllDefault = <T extends number | string>({
  values,
  setValue,
  error,
  selectedItems,
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
            {selectedItems && selectedItems?.length > 0 ? (
              selectedItems?.includes(item.value) ? (
                <CheckIcon color="success" />
              ) : (
                <CloseIcon style={{ color: '#c61c1c' }} />
              )
            ) : (
              <CheckIcon color="success" />
            )}
          </Option>
        ))}
      </Select>
    </Flex>
  );
};

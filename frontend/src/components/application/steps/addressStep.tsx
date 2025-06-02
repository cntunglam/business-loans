import { Option } from '@mui/joy';
import { ApplicationSteps } from '@roshi/backend/services/applicationSteps.service';
import { ApplicationStepsEnum } from '@roshi/shared';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useVisitorContext } from '../../../context/visitorContext';
import { districts, provinces } from '../../../data/addresses';
import { TEST_IDS } from '../../../utils/testUtils';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';
import { ApplicationStyledSelect } from '../styled/applicationStyledSelect';

interface AddressValue {
  province?: string;
  district?: string;
  detail: string;
}

export const AddressStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [value, setValue] = useState<AddressValue>({ detail: '' });
  const [filteredDistricts, setFilteredDistricts] = useState<{ name: string; districtId: string }[]>([]);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.currentAddress].validation(visitor[ApplicationStepsEnum.currentAddress]);
      const address = JSON.parse(stepData);
      if (address && Array.isArray(address) && address.length === 3) {
        const districtId = districts.find((d) => d.name === address[1])?.districtId;
        const provinceId = provinces.find((p) => p.name === address[2])?.provinceId;
        setValue({
          province: provinceId,
          district: districtId,
          detail: address[0]
        });
        const filtered = districts.filter((d) => d.provinceId === provinceId);
        setFilteredDistricts(filtered);
      }
    } catch (error) {
      setValue({ detail: '' });
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!value.province || !value.district || !value.detail) {
        setError('Vui lòng điền đầy đủ thông tin địa chỉ');
        return;
      }
      const district = districts.find((d) => d.districtId === value.district)?.name || '';
      const province = provinces.find((p) => p.provinceId === value.province)?.name || '';
      const address = [value.detail, district, province];
      return JSON.stringify(address);
    }
  }));

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledSelect
        data-testid={TEST_IDS.citySelect}
        placeholder="Chọn tỉnh/thành phố"
        value={value.province}
        onChange={(_, val) => {
          if (val === value.province) return;
          setError('');
          setValue((prev) => ({ ...prev, province: val as string, district: undefined }));
          const filtered = districts.filter((d) => d.provinceId === val);
          setFilteredDistricts(filtered);
        }}
      >
        {provinces.map((option) => (
          <Option key={option.provinceId} value={option.provinceId}>
            {option.name}
          </Option>
        ))}
      </ApplicationStyledSelect>

      <ApplicationStyledSelect
        data-testid={TEST_IDS.districtSelect}
        placeholder="Chọn quận/huyện"
        value={value.district}
        disabled={!value.province}
        onChange={(_, val) => {
          setError('');
          setValue((prev) => ({ ...prev, district: val as string }));
        }}
      >
        {filteredDistricts.map((option) => (
          <Option key={option.districtId} value={option.districtId}>
            {option.name}
          </Option>
        ))}
      </ApplicationStyledSelect>

      <ApplicationStyledInput
        data-testid={TEST_IDS.addressInput}
        value={value.detail}
        placeholder="Số nhà, tên đường, phường/xã"
        error={!!error}
        required
        sx={{ width: '100%', maxWidth: 400 }}
        onChange={(e) => {
          setValue((prev) => ({ ...prev, detail: e.target.value }));
          setError('');
        }}
      />
    </Flex>
  );
});

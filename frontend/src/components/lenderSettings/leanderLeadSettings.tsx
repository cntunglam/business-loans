import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Checkbox, Input, Typography } from "@mui/joy";
import {
  DocumentTypeEnum,
  DocumentTypeEnumLabels,
  employmentStatusesEnum,
  employmentStatusesLabels,
  EmploymentTimeEnum,
  employmentTimeLabels,
  LeadSettingsFormSchema,
  propertyOwnershipsEnum,
  propertyOwnershipsLabels,
  residencyStatusesEnum,
  residencyStatusesLabels,
} from "@roshi/shared";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { z } from "zod";
import { useGetCompanyLeadSettings, useUpdateCompanyLeadSettings } from "../../api/useCompanyApi";
import { ASSETS } from "../../data/assets";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { RsMultipleSelect } from "../shared/rsMultipleSelect";
import { RsMultipleSelectAllDefault } from "../shared/rsMultipleSelectAllDefault";
import { RsSelect } from "../shared/rsSelect";

const REQUIRED_DOCUMENT_TYPE = {
  NOT_REQUIRED: "Do not require any documents",
  DOC_COUNT: "Require at least x documents",
  DOC_TYPE: "Require at least the following documents",
} as const;

export const LenderFilterSettings: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<z.infer<typeof LeadSettingsFormSchema>>({
    resolver: zodResolver(LeadSettingsFormSchema),
  });

  const { data: leadSettings, refetch, isLoading } = useGetCompanyLeadSettings();

  const updateCompanyLeadSettings = useUpdateCompanyLeadSettings();

  const [requiredDocType, setRequiredDocType] = useState("");

  const onSubmit = async (data: z.infer<typeof LeadSettingsFormSchema>) => {
    await updateCompanyLeadSettings.mutateAsync(data).then(() => refetch());
  };

  useEffect(() => {
    if (leadSettings) {
      const leadingSettings = LeadSettingsFormSchema.parse(leadSettings);
      reset({ ...leadingSettings });
      if (leadingSettings?.documents && leadingSettings.documents?.length > 0) {
        setRequiredDocType(REQUIRED_DOCUMENT_TYPE.DOC_TYPE);
      } else if (leadingSettings?.documentCount) {
        setRequiredDocType(REQUIRED_DOCUMENT_TYPE.DOC_COUNT);
      }
    } else {
      reset({
        minMonthlyIncomeLocal: null,
        minMonthlyIncomeForeigner: null,
        minLoanAmount: null,
        maxDebtIncomeRatio: null,
        employmentStatus: [],
        employmentTime: [],
        residencyStatus: [],
        propertyOwnerships: [],
        documents: [],
        documentCount: null,
        isApprovedByRoshi: false,
      });
    }
  }, [leadSettings, reset]);

  return (
    <Flex width={{ md: 900 }} y gap1 sx={{ margin: "0px auto 100px" }}>
      <LoadingPage variant="overlay" isLoading={updateCompanyLeadSettings.isPending || isLoading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex x yc xsb>
          <Typography level="title-md">Customize which leads you want to receive</Typography>
          <Button loading={updateCompanyLeadSettings.isPending} sx={{ my: 1, width: "150px" }} type="submit">
            Save changes
          </Button>
        </Flex>
        <Flex y gap2>
          <Flex y gap1 growChildren>
            <Controller
              name="minMonthlyIncomeLocal"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  name={field.name}
                  value={field.value}
                  placeholder="Min Monthly Income For Local"
                  allowNegative={false}
                  thousandSeparator={true}
                  maxLength={15}
                  startDecorator={<Typography>$</Typography>}
                  size="lg"
                  error={!!errors.minMonthlyIncomeLocal}
                />
              )}
            />
            {errors.minMonthlyIncomeLocal && (
              <Typography textColor="danger.500">{errors.minMonthlyIncomeLocal.message}</Typography>
            )}
          </Flex>
          <Flex y gap1 growChildren>
            <Controller
              name="minMonthlyIncomeForeigner"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  name={field.name}
                  value={field.value}
                  placeholder="Min Monthly Income For Foreigner"
                  allowNegative={false}
                  thousandSeparator={true}
                  maxLength={15}
                  startDecorator={<Typography>$</Typography>}
                  size="lg"
                  error={!!errors.minMonthlyIncomeForeigner}
                />
              )}
            />
            {errors.minMonthlyIncomeForeigner && (
              <Typography textColor="danger.500">{errors.minMonthlyIncomeForeigner.message}</Typography>
            )}
          </Flex>
          <Flex y gap1 growChildren>
            <Controller
              name="minLoanAmount"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  name={field.name}
                  value={field.value}
                  placeholder="Min Loan Amount"
                  allowNegative={false}
                  thousandSeparator={true}
                  maxLength={15}
                  startDecorator={<Typography>$</Typography>}
                  size="lg"
                  error={!!errors.minLoanAmount}
                />
              )}
            />
            {errors.minLoanAmount && <Typography textColor="danger.500">{errors.minLoanAmount.message}</Typography>}
          </Flex>

          <Flex y growChildren>
            <Controller
              name="maxDebtIncomeRatio"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  name={field.name}
                  value={field.value}
                  placeholder="Max moneylender debt-to-income ratio"
                  allowNegative={false}
                  thousandSeparator={false}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  isAllowed={(values: NumberFormatValues) => {
                    let { floatValue } = values;
                    if (!floatValue) floatValue = 0;
                    return floatValue >= 0 && floatValue <= 100;
                  }}
                  size="lg"
                  error={!!errors.maxDebtIncomeRatio}
                />
              )}
            />
            <small style={{ color: "gray" }}>* Moneylender debt to income ratio. Unsecure bank debt excluded</small>
            {errors.maxDebtIncomeRatio && (
              <Typography textColor="danger.500">{errors.maxDebtIncomeRatio.message}</Typography>
            )}
          </Flex>
          <Flex y gap1 growChildren>
            <Controller
              name="employmentTime"
              control={control}
              render={({ field }) => {
                return (
                  <RsMultipleSelectAllDefault
                    values={Object.entries(EmploymentTimeEnum).map(([key, value]) => ({
                      label: employmentTimeLabels[key as EmploymentTimeEnum],
                      value: value,
                    }))}
                    placeholder="Employment time - Allow all"
                    sx={{ width: "100%" }}
                    size="lg"
                    setValue={field.onChange}
                    error={errors.employmentTime ? true : false}
                    selectedItems={field.value}
                    {...field}
                  />
                );
              }}
            />
            {errors.employmentTime && <Typography textColor="danger.500">{errors.employmentTime.message}</Typography>}
          </Flex>
          <Flex y gap1 growChildren>
            <Controller
              name="employmentStatus"
              control={control}
              render={({ field }) => {
                return (
                  <RsMultipleSelectAllDefault
                    values={Object.entries(employmentStatusesEnum).map(([key, value]) => ({
                      label: employmentStatusesLabels[key as employmentStatusesEnum],
                      value: value,
                    }))}
                    placeholder="Employment Status - Allow all"
                    sx={{ width: "100%" }}
                    size="lg"
                    error={errors.employmentStatus ? true : false}
                    setValue={field.onChange}
                    selectedItems={field.value}
                    {...field}
                  />
                );
              }}
            />
            {errors.employmentStatus && (
              <Typography textColor="danger.500">{errors.employmentStatus.message}</Typography>
            )}
          </Flex>
          <Flex y gap1 growChildren>
            <Controller
              name="residencyStatus"
              control={control}
              render={({ field }) => {
                return (
                  <RsMultipleSelectAllDefault
                    values={Object.entries(residencyStatusesEnum).map(([key, value]) => ({
                      label: residencyStatusesLabels[key as residencyStatusesEnum],
                      value: value,
                    }))}
                    placeholder="Residency Status - Allow all"
                    sx={{ width: "100%" }}
                    size="lg"
                    error={errors.residencyStatus ? true : false}
                    setValue={field.onChange}
                    selectedItems={field.value}
                    {...field}
                  />
                );
              }}
            />
            {errors.residencyStatus && <Typography textColor="danger.500">{errors.residencyStatus.message}</Typography>}
          </Flex>
          <Flex y gap1 growChildren>
            <Controller
              name="propertyOwnerships"
              control={control}
              render={({ field }) => {
                return (
                  <RsMultipleSelectAllDefault
                    values={Object.entries(propertyOwnershipsEnum).map(([key, value]) => ({
                      label: propertyOwnershipsLabels[key as propertyOwnershipsEnum],
                      value: value,
                    }))}
                    placeholder="Property Ownership - Allow all"
                    sx={{ width: "100%" }}
                    size="lg"
                    error={errors.propertyOwnerships ? true : false}
                    setValue={field.onChange}
                    selectedItems={field.value}
                    {...field}
                  />
                );
              }}
            />
            {errors.propertyOwnerships && (
              <Typography textColor="danger.500">{errors.propertyOwnerships.message}</Typography>
            )}
          </Flex>
          <Flex y gap1 growChildren>
            <RsSelect
              values={Object.values(REQUIRED_DOCUMENT_TYPE)}
              placeholder="Document requirements"
              sx={{ width: "100%" }}
              setValue={(val) => {
                setRequiredDocType(val as string);
                setValue("documentCount", null);
                setValue("documents", []);
              }}
              value={requiredDocType}
              size="lg"
              error={!!errors.documents}
            />
            {errors.documents && <Typography textColor="danger.500">{errors.documents.message}</Typography>}
          </Flex>
          {requiredDocType === REQUIRED_DOCUMENT_TYPE.DOC_TYPE && (
            <Flex y gap1 growChildren>
              <Controller
                name="documents"
                control={control}
                render={({ field }) => {
                  return (
                    <RsMultipleSelect
                      values={Object.entries(DocumentTypeEnum).map(([key, value]) => ({
                        label: DocumentTypeEnumLabels[key as DocumentTypeEnum],
                        value: value,
                      }))}
                      placeholder="Required documents"
                      sx={{ width: "100%" }}
                      size="lg"
                      error={errors.documents ? true : false}
                      setValue={field.onChange}
                      selectedItems={field.value}
                      selectedIcon={
                        <Box
                          sx={{
                            backgroundColor: "var(--joy-palette-danger-500)",
                            WebkitMask: `url('${ASSETS.ASTERISK}') no-repeat center`,
                            mask: `url('${ASSETS.ASTERISK}') no-repeat center`,
                            height: 14,
                            width: 14,
                          }}
                        ></Box>
                      }
                      {...field}
                    />
                  );
                }}
              />
              {errors.documents && <Typography textColor="danger.500">{errors.documents.message}</Typography>}
            </Flex>
          )}
          {requiredDocType === REQUIRED_DOCUMENT_TYPE.DOC_COUNT && (
            <Flex y gap1 growChildren>
              <Controller
                name="documentCount"
                control={control}
                render={({ field }) => {
                  return (
                    <NumericFormat
                      customInput={Input}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue ?? null);
                      }}
                      name={field.name}
                      value={field.value}
                      placeholder={`From 1 to ${Object.keys(DocumentTypeEnum).length}`}
                      startDecorator={<Typography>Document Count</Typography>}
                      size="lg"
                      error={!!errors.documentCount}
                      isAllowed={(values: NumberFormatValues) => {
                        let { floatValue } = values;
                        if (!floatValue) floatValue = 0;
                        return floatValue >= 0 && floatValue <= Object.keys(DocumentTypeEnum).length;
                      }}
                    />
                  );
                }}
              />
              {errors.documentCount && <Typography textColor="danger.500">{errors.documentCount.message}</Typography>}
            </Flex>
          )}
          <Flex y gap1 growChildren>
            <Typography textColor="neutral.500">
              ROSHI manually verifies leads using the documents provided by the borrower. The verification process can
              take several hours, and may not be completed if the applicant fails to submit the necessary documents.
              Check the box below to receive only leads that have been qualified by ROSHI.
            </Typography>
            <Checkbox
              name="isApprovedByRoshi"
              label="Leads qualified by ROSHI only"
              defaultChecked={leadSettings?.isApprovedByRoshi}
              onChange={(e) => setValue("isApprovedByRoshi", e.target.checked)}
            />
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
};

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Typography } from "@mui/joy";
import { LenderSettingsKeys, OfferPreferenceSettingsSchema } from "@roshi/shared";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { z } from "zod";
import { useGetOfferPreferenceSettings, useUpdateOfferPreferenceSettings } from "../../api/useCompanyApi";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";

export const LenderPreferenceSettings: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof OfferPreferenceSettingsSchema.shape.value>>({
    resolver: zodResolver(OfferPreferenceSettingsSchema.shape.value),
  });
  const {
    data: offerPreferenceSettings,
    isLoading,
    refetch,
  } = useGetOfferPreferenceSettings({ key: LenderSettingsKeys.DEFAULT_OFFER_VALUES });
  const updateOfferPreferenceSettings = useUpdateOfferPreferenceSettings();

  const onSubmit = async (data: z.infer<typeof OfferPreferenceSettingsSchema.shape.value>) => {
    await updateOfferPreferenceSettings
      .mutateAsync({ key: LenderSettingsKeys.DEFAULT_OFFER_VALUES, value: data })
      .then(() => refetch());
  };

  useEffect(() => {
    if (offerPreferenceSettings) {
      const offeringPreferenceSettings = OfferPreferenceSettingsSchema.shape.value.parse(offerPreferenceSettings.value);
      reset({ ...offeringPreferenceSettings });
    } else {
      reset({
        variableAdminFee: null,
        fixedAdminFee: null,
        interestRate: null,
      });
    }
  }, [offerPreferenceSettings, reset]);

  return (
    <Flex width={{ md: 900 }} y gap1 sx={{ margin: "0px auto 100px" }}>
      <LoadingPage variant="overlay" isLoading={updateOfferPreferenceSettings.isPending || isLoading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex x yc xsb>
          <Typography level="title-md">Customize your fee preferences</Typography>
          <Button loading={updateOfferPreferenceSettings.isPending} sx={{ my: 1, width: "150px" }} type="submit">
            Save changes
          </Button>
        </Flex>
        <Flex y gap2>
          <Flex y gap1 growChildren>
            <Controller
              name="variableAdminFee"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  name={field.name}
                  value={field.value}
                  placeholder="Variable admin fee"
                  allowNegative={false}
                  thousandSeparator={true}
                  maxLength={3}
                  startDecorator={<Typography>%</Typography>}
                  size="lg"
                  decimalScale={2}
                  fixedDecimalScale
                  error={!!errors.variableAdminFee}
                />
              )}
            />
            {errors.variableAdminFee && (
              <Typography textColor="danger.500">{errors.variableAdminFee.message}</Typography>
            )}
          </Flex>
          <Flex y gap2>
            <Flex y gap1 growChildren>
              <Controller
                name="fixedAdminFee"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={Input}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue ?? null);
                    }}
                    name={field.name}
                    value={field.value}
                    placeholder="Fixed admin fee"
                    allowNegative={false}
                    thousandSeparator={true}
                    maxLength={15}
                    startDecorator={<Typography>$</Typography>}
                    size="lg"
                    error={!!errors.fixedAdminFee}
                  />
                )}
              />
              {errors.fixedAdminFee && <Typography textColor="danger.500">{errors.fixedAdminFee.message}</Typography>}
            </Flex>
          </Flex>
          <Flex y gap2>
            <Flex y gap1 growChildren>
              <Controller
                name="interestRate"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={Input}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue ?? null);
                    }}
                    name={field.name}
                    value={field.value}
                    placeholder="Monthly interest rate"
                    allowNegative={false}
                    thousandSeparator={true}
                    maxLength={3}
                    startDecorator={<Typography>%</Typography>}
                    size="lg"
                    decimalScale={2}
                    fixedDecimalScale
                    error={!!errors.interestRate}
                  />
                )}
              />
              {errors.interestRate && <Typography textColor="danger.500">{errors.interestRate.message}</Typography>}
            </Flex>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
};

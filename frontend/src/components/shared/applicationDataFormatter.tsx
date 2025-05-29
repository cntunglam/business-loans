import {
  employmentTypeEnum,
  employmentTypeLabels,
  loanPurposesEnum,
  loanPurposesLabels,
  residencyStatusesEnum,
  residencyStatusesLabels,
  SgManualFormSchemaKeys
} from "@roshi/shared";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';
import { formatToDisplayString, getDifference } from "../../utils/utils";

interface Props {
  property:
    | (typeof SgManualFormSchemaKeys)[number]
    | "purpose"
    | "amount"
    | "term"
    | "createdAt"
    | "updatedAt"
    | "interestRate";
  value: string | number | Date | null | undefined;
}

export const formatApplicationData = ({ property, value }: Props) => {
  const { t } = useTranslation();
  switch (property) {
    case "residencyStatus":
      return residencyStatusesLabels[value as residencyStatusesEnum];
    case "employmentType":
      return `${value}` in employmentTypeLabels ? employmentTypeLabels[value as employmentTypeEnum] : `${value}`;
    case "purpose":
      return (value as string) in loanPurposesLabels
        ? loanPurposesLabels[value as loanPurposesEnum]
        : (value as string);
    case "createdAt":
    case "updatedAt":
      return `${format(value as Date, "dd MMM yy HH:mm")} (${getDifference(value as Date)} ago)`;
    case "term":
      return `${value} ${t("month")}`;
    case "amount":
    case "monthlyIncome":
      return value === undefined || value === null ? "" : `${formatToDisplayString(value as number, 2)}₫`;
    case "interestRate":
      return `${value}%`;
    default:
      return value === undefined || value === null ? "" : typeof value === "string" ? value : value.toString();
  }
};

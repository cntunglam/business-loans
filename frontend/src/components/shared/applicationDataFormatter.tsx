import {
  employmentStatusesEnum,
  employmentStatusesLabels,
  EmploymentTimeEnum,
  employmentTimeLabels,
  loanPurposesEnum,
  loanPurposesLabels,
  propertyOwnershipsEnum,
  propertyOwnershipsLabels,
  residencyStatusesEnum,
  residencyStatusesLabels,
  SgManualFormSchemaKeys,
} from "@roshi/shared";
import { format } from "date-fns";
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
  switch (property) {
    case "employmentStatus":
      return employmentStatusesLabels[value as employmentStatusesEnum];
    case "propertyOwnership":
      return propertyOwnershipsLabels[value as propertyOwnershipsEnum];
    case "residencyStatus":
      return residencyStatusesLabels[value as residencyStatusesEnum];
    case "purpose":
      return (value as string) in loanPurposesLabels
        ? loanPurposesLabels[value as loanPurposesEnum]
        : (value as string);
    case "createdAt":
    case "updatedAt":
      return `${format(value as Date, "dd MMM yy HH:mm")} (${getDifference(value as Date)} ago)`;
    case "currentEmploymentTime":
    case "previousEmploymentTime":
      return employmentTimeLabels[value as EmploymentTimeEnum];
    case "term":
      return `${value} months`;
    case "amount":
    case "monthlyIncome":
    case "lenderDebt":
    case "bankDebt":
      return value === undefined || value === null ? "" : `$${formatToDisplayString(value as number, 2)}`;
    case "interestRate":
      return `${value}%`;
    case "mlcbRatio":
      return value === undefined || value === null ? "" : `${formatToDisplayString(value as number, 2)}`;
    default:
      return value === undefined || value === null ? "" : typeof value === "string" ? value : value.toString();
  }
};

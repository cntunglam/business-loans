import { format } from "date-fns";
import { residencyStatusesEnum } from "../data/applicationData";
import { SingpassData } from "../models/singpass.model";

export const formatWithoutTz = (date: Date, form: string) => {
  return format(date.getTime() + new Date().getTimezoneOffset() * 60 * 1000, form);
};

export const birthDateToAge = (birthDate: Date) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function calculateEMI(loanAmount: number, monthlyInterestRate: number, loanTenureMonths: number): number {
  if (monthlyInterestRate === 0) {
    return loanAmount / loanTenureMonths;
  }
  return (
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenureMonths)) /
    (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1)
  );
}

export const shortId = (uuid: string) => {
  return `${uuid.split("-").at(-1)}`;
};

export function getResidencyStatusFromSingpassData(singpassData: SingpassData) {
  //PR OR SC
  if (singpassData.uinfin?.value.startsWith("S") || singpassData.uinfin?.value.startsWith("T")) {
    if (singpassData.nationality?.code === "SG") {
      return residencyStatusesEnum.SINGAPOREAN;
    }
    return residencyStatusesEnum.PERMANANT_RESIDENT;
  }
  return undefined;
}

//Not working. Disable for now

// export function getPropertyOwnershipFromSingpassData(singpassData: SingpassData) {
//   if (singpassData?.ownerprivate?.value === true) {
//     return propertyOwnershipsEnum.PRIVATE_PROPERTY;
//   }
//   if (singpassData.hdbtype?.code !== undefined) {
//     return propertyOwnershipsEnum.HDB;
//   }
//   return undefined;
// }

export function hashStringToNumber(str: string, max: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i)) % max;
  }
  return hash;
}

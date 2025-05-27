import { z } from 'zod';

enum ServiceEnum {
  GETMLCBR = 'GETMLCBR',
}

enum ActionEnum {
  A = 'A',
}

enum StatusEnum {
  OK = 'OK',
}

enum ObligationEnum {
  M = 'M',
}

enum EmploymentStatusEnum {
  EMP = 'EMP',
}

enum IncomeDocTypeEnum {
  OTHERS = 'OTHERS',
}

enum LoanApplicationStatusEnum {
  Pending = 'Pending',
}

enum ReportTypeEnum {
  S = 'S',
}

enum ApplicantTypeEnum {
  NRIC = 'NRIC',
}

enum NationalityEnum {
  SGP = 'SGP',
}

enum ApplicationTypeEnum {
  S = 'S',
  M = 'M',
}

interface Header {
  CLIENT_ID: string;
  USER_ID: string;
  RUN_NO: string;
  TOT_ITEMS: string;
  ERR_ITEMS: Record<string, unknown>;
}

interface Applicant {
  PROVIDED: {
    APPOBL: ObligationEnum;
    P_IDTYP: ApplicantTypeEnum;
    P_IDNO: string;
    P_NAM: string;
    P_NAT: NationalityEnum;
    P_DOB_DOR: string;
  };
  AVAILABLE: {
    A_IDS: {
      A_ID: {
        A_IDTYP: ApplicantTypeEnum;
        A_IDNO: string;
      };
    };
    A_NAMS: {
      A_NAM: Array<{
        NAM: string;
      }>;
    };
    A_NAT: NationalityEnum;
    A_DOB_DOR: string;
  };
  EMPTYP_INCM: {
    EMPSTA: EmploymentStatusEnum;
    CUREMP: string;
    INCMON: string;
    INCMON2: string;
    INCMON3: string;
    INCMONAVG: string;
    INCANN: string;
    DOCTYPS: {
      DOCTYP: {
        INCDOCTYP: IncomeDocTypeEnum;
        LASTUPDDAT: string;
      };
    };
  };
  AGGCAPCMP: {
    MAXUSCLON: string;
    BALQALWJL: string;
    USCLAMTREQ: string;
    APPTYP: ApplicationTypeEnum;
    SOLTBOPA: string;
    SOLRESSUM: string;
    JNTTBOPA: string;
    JNTRESSUM: string;
    GRTTBOPA: string;
    GRTRESSUM: string;
    SOJTTBOPA: string;
    SOJTRESSUM: string;
    BALLONQALL: string;
    LONAPPSTS: LoanApplicationStatusEnum;
    STSDESC: string;
  };
  LOANTYPE: {
    USCTPAMAIN: string;
    USCTPAJNTG: string;
    SCRTPAMAIN: string;
    SCRTPAJNTG: string;
    USCTBOPAMAIN: string;
    USCTBOPAJNTG: string;
    SCRTBOPAMAIN: string;
    SCRTBOPAJNTG: string;
    USCRSVSUMMAIN: string;
    USCRSVSUMJNTG: string;
    SCRRSVSUMMAIN: string;
    SCRRSVSUMJNTG: string;
    USCLONSUM: string;
    SCRLONSUM: string;
    GRT_SUR: Record<string, unknown>;
  };
  PAYMENTSTS: {
    LOAN: Array<{
      LOANSEQNO: string;
      DCLFLAG: string;
      OBLIGATION: ObligationEnum;
      TOTPAYAMT: string;
      LOANDATE: string;
      CYCLE: Array<{
        MONTH: string;
        YEAR: string;
        STATUS: string;
      }>;
    }>;
  };
}

interface MLCBReport {
  REPORTTYP: ReportTypeEnum;
  APPDATE: string;
  APPTIME: string;
  APPREFNO: string;
  APPSUBMNO: string;
  CLIENT_ID: string;
  ORDID: string;
  APPTYP: ApplicationTypeEnum;
  APPLICANT: Applicant;
}

interface ReportResponse {
  SERVICE: ServiceEnum;
  ACTION: ActionEnum;
  STATUS: StatusEnum;
  HEADER: Header;
  MESSAGE: { ITEM: { MLCB_REPORT: MLCBReport } };
  app_sub_no: string;
}

export interface MLCBReportApiResponse {
  [key: string]: any;
  ref_no: string;
  status: string;
  mlcb_loan_active: number;
  response_report: ReportResponse;
  response_quantum: {
    ACTION: string;
    HEADER: {
      RUN_NO: string;
      USER_ID: string;
      CLIENT_ID: string;
      ERR_ITEMS: Record<string, never>;
      TOT_ITEMS: string;
    };
    STATUS: string;
    MESSAGE: {
      ITEM: {
        APPREFNO: string;
        APPSUBMNO: string;
        ALQ_CALCULATIONS: {
          P_NAM: string;
          APPOBL: string;
          P_IDNO: string;
          APPDATE: string;
          APPTIME: string;
          P_IDTYP: string;
          STSDESC: string;
          BALLONQALL: string;
        };
      };
    };
    SERVICE: string;
  };
  mlcb_loan_balance: Record<string, string>;
}

export const MLCBLoanSchema = z.object({
  LOANDATE: z.string(),
  TOTPAYAMT: z.coerce.number(),
  CYCLE: z.array(
    z.object({
      MONTH: z.coerce.number(),
      YEAR: z.coerce.number(),
      STATUS: z.enum(['OK', 'BD', '30', '60', '90', '120', '120+']).or(z.record(z.never())),
    }),
  ),
});

//Fields that matter to us
export const MLCBReportSchema = z.object({
  response_report: z.object({
    MESSAGE: z.object({
      ITEM: z.object({
        MLCB_REPORT: z.object({
          APPLICANT: z.object({
            PAYMENTSTS: z
              .object({
                LOAN: z.array(MLCBLoanSchema).or(MLCBLoanSchema),
              })
              .optional(),
          }),
        }),
      }),
    }),
  }),
});

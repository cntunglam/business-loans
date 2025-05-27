interface BaseSingpassItem {
  lastupdated: string;
  source: "1" | "2" | "3" | "4";
  classification: string;
}

interface ValueItem extends BaseSingpassItem {
  value: string;
}

interface CodeDescItem extends BaseSingpassItem {
  code: string;
  desc: string;
}

export interface SingpassData {
  uinfin?: ValueItem;
  name?: ValueItem;
  sex?: CodeDescItem;
  race?: CodeDescItem;
  nationality?: CodeDescItem;
  dob?: ValueItem;
  email?: ValueItem;
  mobileno?: BaseSingpassItem & {
    areacode?: { value: string };
    nbr?: { value: string };
  };
  regadd?: BaseSingpassItem & {
    type?: "SG";
    //When type is SG
    country?: { code: string; desc: string };
    unit?: { value: string };
    street?: { value: string };
    block?: { value: string };
    postal?: { value: string };
    floor?: { value: string };
    building?: { value: string };
    //When type is UNFORMATTED
    line1?: { value: string };
    line2?: { value: string };
  };
  occupation?: ValueItem;
  housingtype?: CodeDescItem;
  hdbtype?: CodeDescItem;
  marital?: CodeDescItem;
  ownerprivate?: BaseSingpassItem & {
    value: boolean;
  };
  employment?: ValueItem;
  cpfcontributions?: BaseSingpassItem & {
    unavailable?: boolean;
    history?: Array<{
      date?: { value: string };
      employer?: { value: string };
      amount?: { value: number };
      month?: { value: string };
    }>;
  };
}

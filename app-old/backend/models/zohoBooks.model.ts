export interface ZohoInvoice {
  customer_id: string;
  currency_id?: string;
  contact_persons?: string[];
  invoice_number?: string; // Max-length [100]
  /** 🇮🇳 , GCC only
   * Place where the goods/services are supplied to.
   * Supported codes for UAE emirates are:
   *   Abu Dhabi - AB, Ajman - AJ, Dubai - DU, Fujairah - FU, Ras al-Khaimah - RA, Sharjah - SH, Umm al-Quwain - UM
   * Supported codes for the GCC countries are:
   *   United Arab Emirates - AE, Saudi Arabia - SA, Bahrain - BH, Kuwait - KW, Oman - OM, Qatar - QA.
   */
  place_of_supply?: string;
  /** 🇬🇧 only
   * VAT treatment for the invoices.
   * Allowed values: 'uk', 'eu_vat_registered', 'overseas'.
   */
  vat_treatment?: string;
  /** GCC, 🇲🇽, 🇰🇪, 🇿🇦 only
   * VAT treatment for the invoice.
   * Allowed values:
   *   'vat_registered', 'vat_not_registered', 'gcc_vat_not_registered', 'gcc_vat_registered', 'non_gcc',
   *   'dz_vat_registered', 'dz_vat_not_registered', 'home_country_mexico', 'border_region_mexico', 'non_mexico',
   *   'non_kenya', 'overseas', 'non_south_africa'.
   */
  tax_treatment?: string;
  /** 🇿🇦 only
   * (Required if customer tax treatment is 'vat_registered')
   * Used to specify whether the transaction is applicable for Domestic Reverse Charge (DRC) or not.
   */
  is_reverse_charge_applied?: boolean;
  /** 🇮🇳 only
   * GST treatment.
   * Allowed values: 'business_gst', 'business_none', 'overseas', 'consumer'.
   */
  gst_treatment?: string;
  /** 🇮🇳 only
   * 15-digit GST identification number of the customer.
   */
  gst_no?: string;
  /** 🇲🇽 only
   * CFDI Usage.
   * Allowed values:
   * 'acquisition_of_merchandise', 'return_discount_bonus', 'general_expense', 'buildings', 'furniture_office_equipment',
   * 'transport_equipment', 'computer_equipmentdye_molds_tools', 'telephone_communication', 'satellite_communication',
   * 'other_machinery_equipment', 'hospital_expense', 'medical_expense_disability', 'funeral_expense', 'donation',
   * 'interest_mortage_loans', 'contribution_sar', 'medical_expense_insurance_pormium', 'school_transportation_expense',
   * 'deposit_saving_account', 'payment_educational_service', 'no_tax_effect', 'payment', 'payroll'.
   */
  cfdi_usage?: string;
  reference_number?: string;
  template_id?: string;
  date?: string; // Format: 'yyyy-mm-dd'
  payment_terms?: number;
  payment_terms_label?: string; // Max-length [100]
  due_date?: string; // Format: 'yyyy-mm-dd'
  discount?: number;
  is_discount_before_tax?: boolean;
  /** How the discount is specified.
   * Allowed values: 'entity_level', 'item_level'.
   */
  discount_type?: 'entity_level' | 'item_level';
  is_inclusive_tax?: boolean;
  exchange_rate?: number;
  recurring_invoice_id?: string;
  invoiced_estimate_id?: string;
  salesperson_name?: string; // Max-length [200]
  custom_fields?: ZohoInvoiceCustomField[];
  line_items: ZohoInvoiceLineItem[];
  payment_options?: ZohoInvoicePaymentOptions;
  custom_body?: string;
  custom_subject?: string;
  notes?: string;
  terms?: string;
  shipping_charge?: string;
  adjustment?: number;
  adjustment_description?: string;
  reason?: string;
  /** 🇺🇸 only
   * ID of the tax authority.
   */
  tax_authority_id?: string;
  /** 🇮🇳, 🇺🇸 only
   * ID of the tax exemption.
   */
  tax_exemption_id?: string;
  billing_address_id?: string;
  shipping_address_id?: string;
  /** Avalara Integration only
   * Used to group like customers for exemption purposes.
   * Max-length [25]
   */
  avatax_use_code?: string;
  /** Avalara Integration only
   * Exemption certificate number of the customer.
   * Max-length [25]
   */
  avatax_exempt_no?: string;
  tax_id?: string;
  expense_id?: string;
  salesorder_item_id?: string;
  /** Avalara Integration only
   * A tax code is a unique label used to group Items.
   * Max-length [25]
   */
  avatax_tax_code?: string;
  time_entry_ids?: string[];
}

export interface ZohoInvoiceCustomField {
  customfield_id: number;
  value: string;
}

export interface ZohoInvoiceLineItem {
  item_id?: string;
  project_id?: string;
  time_entry_ids?: string[];
  /** Enter 'goods' or 'services'.
   * For South Africa Edition: 'service', 'goods', 'capital_service', 'capital_goods'.
   */
  product_type?: string;
  /** 🇮🇳, 🇰🇪, 🇿🇦 only
   * Add HSN/SAC code for your goods/services.
   */
  hsn_or_sac?: string;
  /** 🇲🇽 only
   * Add SAT Item Key Code for your goods/services.
   */
  sat_item_key_code?: string;
  /** 🇲🇽 only
   * Add SAT Unit Key Code for your goods/services.
   */
  unitkey_code?: string;
  warehouse_id?: string;
  expense_id?: string;
  bill_id?: string;
  bill_item_id?: string;
  expense_receipt_name?: string;
  name?: string; // Max-length [100]
  description?: string; // Max-length [2000]
  item_order?: number;
  bcy_rate?: number;
  rate?: number;
  quantity?: number;
  unit?: string; // Max-length [100]
  discount_amount?: number;
  discount?: number;
  tags?: string[]; // Tags associated with the line item
  tax_id?: string;
  /** 🇲🇽 only
   * ID of the TDS tax.
   */
  tds_tax_id?: string;
  tax_name?: string;
  tax_type?: string;
  tax_percentage?: number;
  /** GCC only
   * Specify reason for using out of scope.
   * Supported values for UAE, Bahrain, and Saudi Arabia.
   */
  tax_treatment_code?: string;
  header_name?: string;
  salesorder_item_id?: string;
  /** Avalara Integration only
   * Tax code for the line item.
   * Max-length [25]
   */
  avatax_tax_code?: string;
}

export interface ZohoInvoicePaymentOptions {
  /** Boolean to check if partial payments are allowed for the contact */
  allow_partial_payments?: boolean;
  // Other properties for payment options can be added here
}

export interface ZohoBaseApiResponse {
  //Zoho Books error code. This will be zero for a success response and non-zero in case of an error.
  code: number;
  message: string;
}

export interface Invoice {
  invoice_id: number;
  ach_payment_initiated: boolean;
  invoice_number: string;
  is_pre_gst: boolean;
  place_of_supply: string;
  gst_no: string;
  gst_treatment: string;
  cfdi_usage: string;
  cfdi_reference_type: string;
  reference_invoice_id: string;
  vat_treatment: string;
  tax_treatment: string;
  is_reverse_charge_applied: boolean;
  vat_reg_no: string;
  date: string; // Format: "YYYY-MM-DD"
  status: string;
  payment_terms: number;
  payment_terms_label: string;
  due_date: string; // Format: "YYYY-MM-DD"
  payment_expected_date: string;
  last_payment_date: string;
  reference_number: string;
  customer_id: number;
  customer_name: string;
  //contact_persons: string[];
  currency_id: number;
  currency_code: string;
  exchange_rate: number;
  discount: number;
  is_discount_before_tax: boolean;
  discount_type: string;
  is_inclusive_tax: boolean;
  recurring_invoice_id: string;
  is_viewed_by_client: boolean;
  has_attachment: boolean;
  client_viewed_time: string;
  //line_items: LineItem[];
  shipping_charge: number;
  adjustment: number;
  adjustment_description: string;
  sub_total: number;
  tax_total: number;
  total: number;
  //taxes: Tax[];
  payment_reminder_enabled: boolean;
  payment_made: number;
  credits_applied: number;
  tax_amount_withheld: number;
  balance: number;
  write_off_amount: number;
  allow_partial_payments: boolean;
  price_precision: number;
  //payment_options: PaymentOptions;
  is_emailed: boolean;
  reminders_sent: number;
  last_reminder_sent_date: string;
  //billing_address: Address;
  //shipping_address: Address;
  notes: string;
  terms: string;
  //custom_fields: CustomField[];
  template_id: number;
  template_name: string;
  created_time: string; // Format: ISO 8601
  last_modified_time: string; // Format: ISO 8601
  attachment_name: string;
  can_send_in_mail: boolean;
  salesperson_id: string;
  salesperson_name: string;
  invoice_url: string;
}

export interface ZohoInvoiceApiResponse extends ZohoBaseApiResponse {
  invoice: Invoice;
}

export interface ZohoInvoiceGetManyApiResponse extends ZohoBaseApiResponse {
  invoices: Invoice[];
}

// School-side Mobile Money merchant details shown to parents before they pay
// externally and submit the transaction reference for verification.
export const momoMerchant = {
  network: "MTN Mobile Money",
  merchantName: "Divine International School",
  merchantNumber: "0540 597 042",
  steps: [
    "Dial *170# (or open the MTN MoMo app) and choose Pay Bill / Merchant Payment.",
    "Enter the merchant number above and the exact amount.",
    "Complete the payment and copy the transaction reference from the confirmation SMS.",
    "Submit the reference below so the school can verify it against the MoMo statement.",
  ],
} as const;

export const bankDepositAccount = {
  bankName: "Ecobank Ghana",
  accountName: "Divine International School",
  accountNumber: "1441 000 123 456",
  branch: "Accra Main",
  steps: [
    "Deposit the exact fee amount into the school's Ecobank account above.",
    "Keep the deposit/teller slip — you can attach a photo of it below.",
    "Submit the deposit details so the school can verify it against the bank statement.",
  ],
} as const;

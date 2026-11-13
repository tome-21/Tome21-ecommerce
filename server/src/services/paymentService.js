import { veritas } from "../utils/veritas.js";

const EXPECTED_CBE_ACCOUNT = process.env.CBE_MERCHANT_ACCOUNT_SUFFIX; 
const EXPECTED_TELEBIRR_ACCOUNT = process.env.TELEBIRR_MERCHANT_ACCOUNT_NO; 

if (!EXPECTED_CBE_ACCOUNT || !EXPECTED_TELEBIRR_ACCOUNT) {
  throw new Error ("provide merchant cbe and telebirr account")
}


export async function verifyPayment({ method, reference, accountSuffix }) {
  
  if (!reference?.trim()) {
    throw new Error("Payment reference is required");
  }

  
  if (method === "cbe") {
    
    if (!accountSuffix?.trim()) {
      throw new Error("CBE account suffix is required");
    }

    
    const response = await veritas("/verify-cbe", {
      method: "POST",
      body: JSON.stringify({
        reference: reference.trim(),
        accountSuffix: accountSuffix.trim(),
      }),
    });

    

    const receiverAcc = String(response.receiverAccount || "");
    
    if (!receiverAcc.endsWith(EXPECTED_CBE_ACCOUNT)) {
      throw new Error(
        "Payment receiver mismatch. This payment was not deposited to our account.",
      );
    }

    
    const verifiedAmount = Number(response.amount);

    return {
      reference: response.reference,
      verifiedAmount,
      payerName: response.payer,
    };
  }

  
  if (method === "telebirr") {
    const response = await veritas("/verify-telebirr", {
      method: "POST",
      body: JSON.stringify({
        reference: reference.trim(),
      }),
    });

    const data = response.data;

    
    const creditedAccount = String(data.creditedPartyAccountNo || "");
    if (
      EXPECTED_TELEBIRR_ACCOUNT &&
      creditedAccount !== EXPECTED_TELEBIRR_ACCOUNT
    ) {
      throw new Error(
        "Payment receiver mismatch. This payment was not deposited to our Telebirr account.",
      );
    }

    
    const amountStr = data.settledAmount.replace(/[^0-9.]/g, "");
    const verifiedAmount = parseFloat(amountStr);

    return {
      reference: data.receiptNo,
      verifiedAmount,
      payerName: data.payerName,
    };
  }

  throw new Error("Unsupported payment method");
}

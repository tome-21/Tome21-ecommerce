import { veritas } from "../utils/veritas.js";

function getExpectedAccounts() {
  const cbeSuffix = process.env.CBE_MERCHANT_ACCOUNT_SUFFIX?.trim();
  const telebirrAccount = process.env.TELEBIRR_MERCHANT_ACCOUNT_NO?.trim();

  if (!cbeSuffix || !telebirrAccount) {
    throw new Error("Provide merchant CBE and Telebirr account configuration");
  }

  return { cbeSuffix, telebirrAccount };
}

function parsePositiveAmount(rawValue, provider) {
  if (rawValue === null || rawValue === undefined) {
    throw new Error(`Missing amount in ${provider} verification response`);
  }

  const cleaned =
    typeof rawValue === "number"
      ? String(rawValue)
      : String(rawValue).replace(/[^0-9.]/g, "");

  const amount = Number.parseFloat(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid amount in ${provider} verification response`);
  }

  return amount;
}

export async function verifyPayment({ method, reference, accountSuffix }) {
  const cleanRef = reference?.trim();
  if (!cleanRef) {
    throw new Error("Payment reference is required");
  }

  const normalizedMethod = String(method || "").trim().toLowerCase();
  const { cbeSuffix, telebirrAccount } = getExpectedAccounts();

  if (normalizedMethod === "cbe") {
    const cleanSuffix = accountSuffix?.trim();
    if (!cleanSuffix) {
      throw new Error("CBE account suffix is required");
    }

    const response = await veritas("/verify-cbe", {
      method: "POST",
      body: JSON.stringify({
        reference: cleanRef,
        accountSuffix: cleanSuffix,
      }),
    });

    const receiverAcc = String(response?.receiverAccount ?? "").trim();
    if (!receiverAcc || !receiverAcc.endsWith(cbeSuffix)) {
      throw new Error(
        "Payment receiver mismatch. This payment was not deposited to our account.",
      );
    }

    return {
      reference: response.reference ?? cleanRef,
      verifiedAmount: parsePositiveAmount(response.amount, "CBE"),
      payerName: response.payer ?? null,
    };
  }

  if (normalizedMethod === "telebirr") {
  const response = await veritas("/verify-telebirr", {
    method: "POST",
    body: JSON.stringify({
      reference: cleanRef,
    }),
  });

  if (response?.success === false) {
    throw new Error(response.error || "Telebirr payment verification failed");
  }

  const data = response?.data;
  if (!data) {
    throw new Error("Invalid Telebirr verification response");
  }

  const status = String(data.transactionStatus ?? "").trim().toLowerCase();
  if (status !== "completed") {
    throw new Error(
      `Telebirr transaction is not completed (status: ${data.transactionStatus || "unknown"})`,
    );
  }

  const creditedAccount = String(data.creditedPartyAccountNo ?? "").trim();
  if (!creditedAccount || creditedAccount !== telebirrAccount) {
    throw new Error(
      "Payment receiver mismatch. This payment was not deposited to our Telebirr account.",
    );
  }

  return {
    reference: data.receiptNo ?? cleanRef,
    verifiedAmount: parsePositiveAmount(data.settledAmount, "Telebirr"),
    payerName: data.payerName ?? null,
  };
}

  throw new Error("Unsupported payment method");
}
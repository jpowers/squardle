type PaymentButtonProps = {
  paymentLink: string;
  amount?: string;
  amountCents?: number;
  className?: string;
};

function getPaymentLabel(url: string) {
  if (url.includes("venmo")) return "Pay with Venmo";
  if (url.includes("paypal")) return "Pay with PayPal";
  if (url.includes("cash.app")) return "Pay with Cash App";
  return "Pay Now";
}

function buildPaymentUrl(baseUrl: string, amountCents?: number): string {
  if (!amountCents) return baseUrl;

  const dollars = (amountCents / 100).toFixed(2);

  // Venmo: venmo.com/u/username?txn=pay&amount=10.00
  if (baseUrl.includes("venmo.com")) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}txn=pay&amount=${dollars}`;
  }

  // PayPal.me: paypal.me/username/10.00
  if (baseUrl.includes("paypal.me")) {
    const cleanUrl = baseUrl.replace(/\/+$/, "");
    return `${cleanUrl}/${dollars}`;
  }

  // Cash App: cash.app/$cashtag/10.00
  if (baseUrl.includes("cash.app")) {
    const cleanUrl = baseUrl.replace(/\/+$/, "");
    return `${cleanUrl}/${dollars}`;
  }

  return baseUrl;
}

export function PaymentButton({ paymentLink, amount, amountCents, className }: PaymentButtonProps) {
  const label = getPaymentLabel(paymentLink);
  const href = buildPaymentUrl(paymentLink, amountCents);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-success gap-2 ${className ?? ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
        <path
          fillRule="evenodd"
          d="M6 10a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm5 1a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z"
          clipRule="evenodd"
        />
      </svg>
      {label}
      {amount && ` (${amount})`}
    </a>
  );
}

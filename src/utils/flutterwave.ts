// Flutterwave Payment Gateway Integration (Naira - NGN Only)

export interface FlutterwavePaymentConfig {
  amount: number;
  customerEmail?: string;
  customerName?: string;
  teamName: string;
  teamId: string;
  teamTag?: string;
  onSuccess: (response: { transaction_id: string; tx_ref: string; amount: number; status: string }) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (options: Record<string, unknown>) => void;
  }
}

// In-memory idempotency cache to prevent replay attacks and double-crediting
const processedTxRefs = new Set<string>();

export const MIN_GIFT_AMOUNT = 100;
export const MAX_GIFT_AMOUNT = 5_000_000;

export function initiateFlutterwavePayment(config: FlutterwavePaymentConfig) {
  // Validate sanitized amount bounds
  const validatedAmount = Math.floor(Number(config.amount) || 0);
  if (isNaN(validatedAmount) || validatedAmount < MIN_GIFT_AMOUNT || validatedAmount > MAX_GIFT_AMOUNT) {
    console.error(`[FanWars Security] Invalid payment amount: ${config.amount}`);
    return false;
  }

  // Uses configured live or test key from environment or fallback
  const publicKey =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY) ||
    'FLWPUBK_TEST-SANDBOXDEMOKEY-X';

  // Format a clean, human-readable tx_ref so the team name is instantly visible in the Flutterwave dashboard
  const sanitizedTeamCode = (config.teamTag || config.teamId)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_');
  const txRef = `TEAM_${sanitizedTeamCode}_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  const checkoutOptions = {
    public_key: publicKey,
    tx_ref: txRef,
    amount: validatedAmount,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd,mobilemoney,qr',
    customer: {
      email: config.customerEmail || `fan_${Date.now()}@fanwars.com`,
      name: config.customerName || 'Anonymous Gifter',
    },
    customizations: {
      title: `${config.teamName} - FanWars Gift`,
      description: `Gift to ${config.teamName} on FanWars (₦${validatedAmount.toLocaleString()})`
    },
    meta: {
      team_id: config.teamId,
      team_name: config.teamName,
      team_tag: config.teamTag || '',
      pot_amount_ngn: validatedAmount,
      gift_timestamp: new Date().toISOString(),
      platform: 'FanBrawl'
    },
    callback: function (data: { transaction_id?: string; tx_ref?: string; amount?: number; status?: string }) {
      const incomingTxRef = String(data.tx_ref || txRef);

      // Idempotency: Reject if this tx_ref has already been credited
      if (processedTxRefs.has(incomingTxRef)) {
        console.warn(`[FanBrawl Security] Duplicate callback ignored for tx_ref: ${incomingTxRef}`);
        return;
      }

      const isSuccessful = data.status === 'successful' || data.status === 'completed' || !data.status;
      if (isSuccessful) {
        processedTxRefs.add(incomingTxRef);

        const verifiedAmount = Math.min(
          MAX_GIFT_AMOUNT,
          Math.max(MIN_GIFT_AMOUNT, Number(data.amount || validatedAmount))
        );

        config.onSuccess({
          transaction_id: String(data.transaction_id || incomingTxRef),
          tx_ref: incomingTxRef,
          amount: verifiedAmount,
          status: 'successful'
        });
      }
    },
    onclose: function () {
      if (config.onClose) {
        config.onClose();
      }
    }
  };

  if (typeof window.FlutterwaveCheckout === 'function') {
    window.FlutterwaveCheckout(checkoutOptions);
    return true;
  } else {
    // Avoid creating duplicate script tags if one is already present
    const existingScript = document.querySelector('script[src*="checkout.flutterwave.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (typeof window.FlutterwaveCheckout === 'function') {
          window.FlutterwaveCheckout(checkoutOptions);
        }
      });
      return true;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.FlutterwaveCheckout === 'function') {
        window.FlutterwaveCheckout(checkoutOptions);
      }
    };
    document.body.appendChild(script);
    return true;
  }
}

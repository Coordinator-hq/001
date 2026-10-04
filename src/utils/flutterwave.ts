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

export function initiateFlutterwavePayment(config: FlutterwavePaymentConfig) {
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
    amount: config.amount,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd,mobilemoney,qr',
    customer: {
      email: config.customerEmail || `fan_${Date.now()}@apexleaderboard.com`,
      name: config.customerName || 'Anonymous Contributor',
    },
    customizations: {
      title: `${config.teamName} - Pot Contribution`,
      description: `Contribution to ${config.teamName} Leaderboard Pot (₦${config.amount.toLocaleString()})`
    },
    meta: {
      team_id: config.teamId,
      team_name: config.teamName,
      team_tag: config.teamTag || '',
      pot_amount_ngn: config.amount,
      contribution_timestamp: new Date().toISOString(),
      platform: '001 Championship'
    },
    callback: function (data: { transaction_id?: string; tx_ref?: string; amount?: number; status?: string }) {
      if (data.status === 'successful' || data.status === 'completed' || !data.status) {
        config.onSuccess({
          transaction_id: String(data.transaction_id || txRef),
          tx_ref: String(data.tx_ref || txRef),
          amount: Number(data.amount || config.amount),
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
  } else {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.FlutterwaveCheckout === 'function') {
        window.FlutterwaveCheckout(checkoutOptions);
      }
    };
    document.body.appendChild(script);
  }
}

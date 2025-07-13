import axios from 'axios';
import nacl from 'tweetnacl';

export const RPC = import.meta.env.VITE_WALLET_RPC || 'https://octra.network';
export const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS || '';
export const PRIVATE_KEY = import.meta.env.VITE_WALLET_PRIVATE_KEY || '';

const IS_BROWSER = typeof window !== 'undefined';

/**
 * Build final RPC URL, lewat proxy jika di browser + production
 */
function buildUrl(endpoint: string, method: 'GET' | 'POST' = 'GET') {
  const useProxy = IS_BROWSER && import.meta.env.MODE === 'production';
  return useProxy
    ? `/api/proxy?path=${encodeURIComponent(endpoint)}`
    : `${RPC}/${endpoint}`;
}

/**
 * Format validator untuk Octra address
 */
export function validateAddress(address: string): boolean {
  return /^oct[a-zA-Z0-9]{44}$/.test(address);
}

/**
 * Decode base64 ke Uint8Array
 */
function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Ambil public key dari private key base64
 */
function getPublicKey(): string {
  const seed = base64ToUint8Array(PRIVATE_KEY);
  const keyPair = nacl.sign.keyPair.fromSeed(seed);
  return btoa(String.fromCharCode(...keyPair.publicKey));
}

/**
 * Ambil nonce terbaru dari address
 */
export async function getNonce(): Promise<number> {
  try {
    const res = await axios.get(buildUrl(`balance/${ADDRESS}`, 'GET'));
    return parseInt(res.data?.nonce || '0');
  } catch (err) {
    console.error('Error getting nonce:', err);
    return 0;
  }
}

/**
 * Tanda tangan payload transaksi sesuai CLI mk()
 */
function signTransactionPayload(payload: any): string {
  const seed = base64ToUint8Array(PRIVATE_KEY);
  const keyPair = nacl.sign.keyPair.fromSeed(seed);

  const canonical = JSON.stringify({
    from: payload.from,
    to_: payload.to_,
    amount: payload.amount,
    nonce: payload.nonce,
    ou: payload.ou,
    timestamp: payload.timestamp
  });

  const message = new TextEncoder().encode(canonical);
  const signature = nacl.sign.detached(message, keyPair.secretKey);
  return btoa(String.fromCharCode(...signature)); // base64
}

/**
 * Dapatkan saldo wallet
 */
export async function getBalance(): Promise<number> {
  try {
    const res = await axios.get(buildUrl(`balance/${ADDRESS}`, 'GET'));
    return parseFloat(res.data.balance || '0');
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
}

/**
 * Ambil riwayat transaksi wallet
 */
export async function getTransactionHistory(): Promise<any[]> {
  try {
    const res = await axios.get(buildUrl(`address/${ADDRESS}`, 'GET'));
    const raw = res.data?.recent_transactions || [];

    return raw.map((tx: any) => ({
      hash: tx.hash,
      epoch: tx.epoch,
      url: tx.url,
    }));
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Kirim satu transaksi sesuai CLI
 */
export async function sendTransaction(to: string, amount: string, message = ''): Promise<any> {
  if (!validateAddress(to)) throw new Error('Alamat tujuan tidak valid');

  const nonce = await getNonce();
  const amountFloat = parseFloat(amount);
  const rawAmount = Math.floor(amountFloat * 1_000_000);
  const ou = amountFloat < 1000 ? "1" : "3";

  const tx = {
    from: ADDRESS,
    to_: to,
    amount: rawAmount.toString(),
    nonce: nonce + 1,
    ou,
    timestamp: Date.now() / 1000,
    message,
    public_key: getPublicKey()
  };

  tx.signature = signTransactionPayload(tx);

  try {
    const res = await axios.post(buildUrl('send-tx', 'POST'), tx);
    if (!res.data || (!res.data.tx_hash && !res.data.status)) {
      throw new Error(res.data?.error || 'Transaksi gagal diproses');
    }
    return res.data;
  } catch (error: any) {
    console.error('sendTransaction error:', error);
    throw new Error(error?.response?.data?.error || 'Gagal mengirim transaksi');
  }
}

/**
 * Kirim banyak transaksi (input: "to:amount" per baris)
 */
export async function sendMultiTransactions(rawInput: string): Promise<{ success: any[]; failed: any[] }> {
  const lines = rawInput.trim().split('\n');
  const success: any[] = [];
  const failed: any[] = [];
  let nonce = await getNonce();
  const publicKey = getPublicKey();

  for (const line of lines) {
    const [to, amtStr] = line.split(':').map(x => x.trim());
    const amount = parseFloat(amtStr);

    try {
      if (!validateAddress(to) || isNaN(amount) || amount <= 0) {
        throw new Error('Format tidak valid');
      }

      const rawAmount = Math.floor(amount * 1_000_000);
      const ou = amount < 1000 ? "1" : "3";
      const timestamp = Date.now() / 1000;

      const tx = {
        from: ADDRESS,
        to_: to,
        amount: rawAmount.toString(),
        nonce: ++nonce,
        ou,
        timestamp,
        public_key: publicKey
      };

      tx.signature = signTransactionPayload(tx);

      const res = await axios.post(buildUrl('send-tx', 'POST'), tx);
      if (res.data?.status !== 'accepted') throw new Error(res.data?.error || 'Gagal');

      success.push({ to, amount, result: res.data });
    } catch (err) {
      failed.push({ to, amount, error: (err as Error).message });
    }
  }

  return { success, failed };
}

/**
 * Ekspor data wallet
 */
export function exportWallet(format: 'privatekey' | 'wallet' = 'wallet'): string {
  if (format === 'privatekey') return PRIVATE_KEY;
  return JSON.stringify({ addr: ADDRESS, priv: PRIVATE_KEY, rpc: RPC }, null, 2);
}

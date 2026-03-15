import nacl from "tweetnacl";
import bs58 from "bs58";

export interface SignedPayload {
  account: string;
  signature: string;
  timestamp: number;
  expiry_window?: number;
  agent_wallet?: string;
  [key: string]: unknown;
}

export interface SignerConfig {
  privateKey: string;
  account: string;
  agentPrivateKey?: string;
  agentWallet?: string;
}

function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

function prepareMessage(
  type: string,
  timestamp: number,
  expiryWindow: number,
  data: Record<string, unknown>
): string {
  const header = {
    type,
    timestamp,
    expiry_window: expiryWindow,
  };

  const message = sortJsonKeys({ ...header, data });
  return JSON.stringify(message, null, 0).replace(/\n/g, "");
}

function getKeypairFromPrivateKey(privateKeyBase58: string): nacl.SignKeyPair {
  const secretKey = bs58.decode(privateKeyBase58);
  if (secretKey.length === 64) {
    return { publicKey: secretKey.slice(32), secretKey };
  }
  return nacl.sign.keyPair.fromSecretKey(secretKey);
}

export function signPayload(
  config: SignerConfig,
  type: string,
  data: Record<string, unknown>,
  expiryWindow: number = 60000
): SignedPayload {
  const timestamp = Date.now();
  const message = prepareMessage(type, timestamp, expiryWindow, data);
  const messageBytes = new TextEncoder().encode(message);

  // Use agent key if available, otherwise use main private key
  const signingKey = config.agentPrivateKey || config.privateKey;
  const keypair = getKeypairFromPrivateKey(signingKey);
  const signatureBytes = nacl.sign.detached(messageBytes, keypair.secretKey);
  const signature = bs58.encode(signatureBytes);

  const payload: SignedPayload = {
    account: config.account,
    signature,
    timestamp,
    expiry_window: expiryWindow,
    ...data,
  };

  if (config.agentWallet) {
    payload.agent_wallet = config.agentWallet;
  }

  return payload;
}

export function getPublicKeyFromPrivate(privateKeyBase58: string): string {
  const keypair = getKeypairFromPrivateKey(privateKeyBase58);
  return bs58.encode(keypair.publicKey);
}

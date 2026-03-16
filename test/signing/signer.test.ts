import nacl from "tweetnacl";
import bs58 from "bs58";
import { signPayload, getPublicKeyFromPrivate } from "../../src/signing/signer";

// Generate a deterministic test keypair
const testKeypair = nacl.sign.keyPair.fromSeed(
  new Uint8Array(32).fill(1) // deterministic seed for testing
);
const testPrivateKey = bs58.encode(testKeypair.secretKey);
const testPublicKey = bs58.encode(testKeypair.publicKey);

describe("getPublicKeyFromPrivate", () => {
  it("derives correct public key from private key", () => {
    const pubkey = getPublicKeyFromPrivate(testPrivateKey);
    expect(pubkey).toBe(testPublicKey);
  });
});

describe("signPayload", () => {
  it("produces a valid signed payload", () => {
    const config = {
      privateKey: testPrivateKey,
      account: testPublicKey,
    };

    const result = signPayload(config, "test_type", { foo: "bar" });

    expect(result.account).toBe(testPublicKey);
    expect(result.signature).toBeTruthy();
    expect(typeof result.timestamp).toBe("number");
    expect(result.foo).toBe("bar");
  });

  it("signature is verifiable", () => {
    const config = {
      privateKey: testPrivateKey,
      account: testPublicKey,
    };

    const result = signPayload(config, "test_type", { data: "value" });
    const signatureBytes = bs58.decode(result.signature);

    // Reconstruct the message that was signed
    const { account, signature, ...rest } = result;
    const header = {
      type: "test_type",
      timestamp: rest.timestamp,
      expiry_window: rest.expiry_window,
    };
    const sortedMsg = JSON.stringify(
      sortKeys({ ...header, data: { data: "value" } })
    );
    const msgBytes = new TextEncoder().encode(sortedMsg);

    const valid = nacl.sign.detached.verify(
      msgBytes,
      signatureBytes,
      testKeypair.publicKey
    );
    expect(valid).toBe(true);
  });
});

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

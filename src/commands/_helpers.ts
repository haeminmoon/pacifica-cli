import { PacificaApiClient } from "../client/api-client";
import { getEffectiveConfig } from "../config/store";
import { ActionableError } from "../output/error";
import { SignerConfig } from "../signing/signer";

export interface AuthContext {
  client: PacificaApiClient;
  account: string;
}

export function createPublicClient(): PacificaApiClient {
  const config = getEffectiveConfig();
  return new PacificaApiClient(config.env);
}

export function createAuthClient(): { client: PacificaApiClient; account: string } | null {
  const config = getEffectiveConfig();
  if (!config.privateKey || !config.account) return null;
  const signerConfig: SignerConfig = {
    privateKey: config.privateKey,
    account: config.account,
  };
  return { client: new PacificaApiClient(config.env, signerConfig), account: config.account };
}

export function withAuth(): AuthContext {
  const config = getEffectiveConfig();

  if (!config.privateKey || !config.account) {
    throw new ActionableError(
      "Not configured. Please set up your private key and account address.",
      "pacifica-cli config init"
    );
  }

  const signerConfig: SignerConfig = {
    privateKey: config.privateKey,
    account: config.account,
  };

  const client = new PacificaApiClient(config.env, signerConfig);
  return { client, account: config.account };
}

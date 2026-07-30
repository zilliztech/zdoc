export type InkeepCredentials = {
  apiKey?: string;
  integrationId?: string;
  organizationId?: string;
};

export function hasInkeepCredentials(credentials: InkeepCredentials): boolean {
  return [credentials.apiKey, credentials.integrationId, credentials.organizationId]
    .every(value => typeof value === 'string' && value.trim().length > 0);
}

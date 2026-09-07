import { type WpData } from './types.ts';

// Thrown when the API answers a request with a status code >= 400
export class DemetraError extends Error {
  public readonly response: WpData;

  constructor(response: WpData) {
    super(`[Demetra] ${response.status.code} - ${response.status.message}`);
    this.name = 'DemetraError';
    this.response = response;
  }
}

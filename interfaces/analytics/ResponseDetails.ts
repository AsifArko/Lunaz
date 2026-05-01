export interface ResponseDetails {
  headers?: Record<string, string>;
  contentType?: string;
  contentLength?: number;
  cached?: boolean;
  compressed?: boolean;
}

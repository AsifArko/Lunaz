export interface RequestDetails {
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  contentType?: string;
  contentLength?: number;
  cookies?: string[];
  authorization?: string;
}

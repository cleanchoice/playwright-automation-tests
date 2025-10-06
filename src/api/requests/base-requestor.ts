import { Page, APIRequestContext } from '@playwright/test';
import { Serializable } from 'playwright-core/types/structs';

export abstract class BaseRequestor {
  protected apiContext: APIRequestContext;
  protected page?: Page;

  private readonly retryStatusCodes = [503, 504, 502, 400, 403, 422, 409, 429];

  constructor(input: Page | APIRequestContext) {
    if ('request' in input) {
      this.page = input;
      this.apiContext = input.request;
    } else {
      this.apiContext = input;
    }
  }

  protected async makeRequest(
    options: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      url: string;
      params?: Record<string, string>;
      headers?: Record<string, string>;
      data?: string | Buffer | Serializable;
      responseType?: 'json' | 'text';
    },
    retries: number = 3,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    data: string | Serializable | null;
  }> {
    let lastStatus: number | undefined;
    let lastHeaders: Record<string, string> | undefined;
    let lastRawBody: string | undefined;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const response = await this.apiContext.fetch(options.url, {
        method: options.method,
        headers: options.headers,
        params: options.params,
        data: options.data,
      });

      const status = response.status();
      const headers = response.headers();
      lastStatus = status;
      lastHeaders = headers;
      let textBody = '';
      try {
        textBody = await response.text();
      } catch {
        textBody = '';
      }
      lastRawBody = textBody;

      if (this.retryStatusCodes.includes(status)) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        continue;
      }

      const isJson = options.responseType === 'json';
      let data: string | Serializable | null = null;

      try {
        if (isJson) {
          data = textBody ? JSON.parse(textBody) : null;
        } else {
          data = textBody;
        }
      } catch (err) {
        console.warn(`⚠️ Failed to parse response as ${options.responseType}:`, err);
        data = null;
      }
      return {
        status,
        headers,
        data,
      };
    }

    const bodySnippet = (lastRawBody ?? '').slice(0, 1000);
    throw new Error(
      `Request failed after ${retries} attempts.` +
        (lastStatus ? ` Last status: ${lastStatus}.` : '') +
        (lastHeaders?.['content-type'] ? ` Content-Type: ${lastHeaders['content-type']}.` : '') +
        (bodySnippet ? ` Last body: ${bodySnippet}` : ''),
    );
  }

  protected async getRequest(options: {
    url: string;
    params?: Record<string, string>;
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
  }) {
    return await this.makeRequest({
      method: 'GET',
      url: options.url,
      params: options.params,
      headers: options.headers,
      responseType: options.responseType ?? 'json',
    });
  }

  protected async postRequest(options: {
    url: string;
    headers?: Record<string, string>;
    data?: string | Buffer | Serializable;
    responseType?: 'json' | 'text';
  }) {
    return await this.makeRequest({
      method: 'POST',
      url: options.url,
      headers: options.headers,
      data: options.data,
      responseType: options.responseType || 'json',
    });
  }

  protected async putRequest(options: {
    url: string;
    headers?: Record<string, string>;
    data?: string | Buffer | Serializable;
    responseType?: 'json' | 'text';
  }) {
    return await this.makeRequest({
      method: 'PUT',
      url: options.url,
      headers: options.headers,
      data: options.data,
      responseType: options.responseType || 'json',
    });
  }

  protected async patchRequest(options: {
    url: string;
    headers?: Record<string, string>;
    data?: string | Buffer | Serializable;
    responseType?: 'json' | 'text';
  }) {
    return await this.makeRequest({
      method: 'PATCH',
      url: options.url,
      headers: options.headers,
      data: options.data,
      responseType: options.responseType || 'json',
    });
  }
}

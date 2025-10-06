import { BaseRequestor } from '../base-requestor';

export interface SignInRequest {
  email: string;
  password: string;
  redirect: string;
  csrfToken: string;
  callbackUrl: string;
  json: string;
}

export interface CommonResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
}

export class SignInApi extends BaseRequestor {
  private static authEndpoint = '/api/auth/callback/credentials';
  private static csrfEndpoint = '/api/auth/csrf';

  public async getCsrfToken(): Promise<string> {
    const response = await this.getRequest({
      url: SignInApi.csrfEndpoint,
      responseType: 'json'
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected 200 status code, but got ${response.status}`);
    }
    
    return (response.data as { csrfToken: string }).csrfToken;
  }

  public async signIn(request: SignInRequest): Promise<CommonResponse> {
    const formData = new URLSearchParams({
      username: request.email,
      password: request.password,
      redirect: request.redirect,
      csrfToken: request.csrfToken,
      callbackUrl: request.callbackUrl || `${process.env.BASE_URL}/v2/auth`,
      json: request.json
    });

    const response = await this.postRequest({
      url: SignInApi.authEndpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(),
      responseType: 'json'
    });
    
    return response;
  }
}

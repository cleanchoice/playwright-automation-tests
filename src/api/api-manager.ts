import { Page } from 'playwright';
import { SignInApi } from './requests/auth/sign-in';

export class ApiManager {
  private _signInApi?: SignInApi;

  constructor(protected page: Page) {}

  get signIn() {
    return (this._signInApi ??= new SignInApi(this.page));
  }
}

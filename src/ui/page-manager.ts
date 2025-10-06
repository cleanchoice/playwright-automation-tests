// user-page-manager.ts
import { Page } from '@playwright/test';
import { wrapPageWithSmartSteps } from '../utils/page-wraper';
import { SignInPage } from './page-objects/sign-in-page';
import { SignUpPage } from './page-objects/sign-up-page';
import { TextFieldComponent } from './components/text-field.component';

export class PageManager {
  private _signInPage?: SignInPage;
  private _signUpPage?: SignUpPage;
  private _textFieldComponent?: TextFieldComponent;

  private page: Page;

  constructor(page: Page) {
    this.page = wrapPageWithSmartSteps(page);
  }

  get signInPage() {
    return (this._signInPage ??= new SignInPage(this.page));
  }
  get signUpPage() {
    return (this._signUpPage ??= new SignUpPage(this.page));
  }
  get textFieldComponent() {
    return (this._textFieldComponent ??= new TextFieldComponent(this.page));
  }
}

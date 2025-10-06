# 🚀 Playwright Automation Project

A modern end-to-end testing framework using **Playwright**, designed with custom logging, wrappers, and scalable architecture.

## 📦 Installation

Go to - https://github.com/cleanchoiceenergy/playwright-automation-tests
Clone the project

then run - npm install (it will install all needed dependencies)
also run - npx playwringt install - to install playwright browsers

## 🔐 Gmail Token

For tests interacting with Gmail (e.g., reading activation emails):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project "Gmail for Clean Choice Automation"
3. Go to credentials
4. Download credentials and save as:
   credentials.json in the root of project
5. Run:
`node node_modules/gmail-tester/init.js credentials.json token.json qa_automation@cleanchoice.com`

This generates `token.json` automatically and places it to your project root.

## ⚙️ Local Setup

Create a `.env` file in the root and populate it with env variables.
The `.env` is your main point of controlling the envs and project you're running your tests against.
Set the `PROJECT` and `ENVIRONMENT` directly in the `.env` for local test development.
Ask alexzavg for this information.

```env
ADMIN_PASSWORD= password for admin account
PASSWORD=universal password that used for base test users
PLATFORM=desktop
...other env variables...
```

## 🧪 Running Tests

comands for terminal

### All tests:

npx playwright test

### Specific test file by relative path:

npx playwright test tests/llc_attourney/auth/login.spec.ts

### Specific project:

npx playwright test --project=llc_attourney

### With UI (debug mode): (recomended to use for your local runs)

npx playwright test --ui

- pass a relative path to a specific spec or the whole dir if you need to run or debug specific tests scope

npx playwright test --ui tests/llc_attourney/ui/auth

## 🏗️ Project Structure

```bash

├── src/
│   ├── api/                # Api objects
    |-- test-data
│   ├── UI/                      # Locators and page objects
|   |   |- locators
|   |   |- page-objects
|   |   |- page-manager.ts  # general setup for page creation
│   ├── utils/
│   │   ├── global-setup.ts       # Allows to prepare user tokens before tests
│   │   ├── tear-down.ts         # Cleanup for auth files after tests
│   │   ├── wrap-page.ts         # Custom page wrapper
│   │   ├── wrapped-expect.ts    # Custom expect
│   │   └── gmail-methods        # Gmail helpers
│   │   ├── common-browser-actions.ts    # Technical actions not focused on specific page or test
│   │   ├── locator-maker.ts    # allows to add name for locators (needed for test steps)
│   ├── tests                    # all spec files here
│   │   └── llc_attourney/     # tests for llc_attourney project
├── .env
├── package.json                # configuration file for dependency management, contains npm scripts for test execution
├── playwright.config.ts        # Global config
```

---

## ✅ Logging with Wrappers

### 🔍 Page Wrapper (`wrapPageWithSmartSteps`)

Automatically logs readable test steps:

```
STEP: Click on "Login Button"
STEP: Expect visible: "Email Field"
```

To use:

```ts
this.page = wrapPageWithSmartSteps(page);
```

### 🔍 Expect Wrapper (`wrapped-expect.ts`)

Import custom `expect`:

```ts
import { expect } from '../../../utils/wrapped-expect';
```

Now all `.toBeVisible()`, `.toBeHidden()`, etc. are logged.

---

## 🔧 Main Fixture Usage

Using custom fixtures (e.g., `main-fixture`) allows you to:
- Authenticate users
- API utilities
- Environment setup per test run

```ts
import { test } from '../../fixtures/main-fixture';

// Usage
test.use({ userEmail: email }); - need to call it at the top of your spec
```

user - A logged-in user initialized via API call.
api - API manager instance for performing direct API calls.
userEmail - Required email for logging in the user. Passed using test.use(...).

---

## 🐌 Slow Down Tests (Optional Debug Mode)

Add in your config or specific test:

```ts
await page.waitForTimeout(500); // slow down between actions
```

Or globally via Playwright’s `launchOptions.slowMo`.

---

## 🛠 Helpful Commands

- `npx playwright test` - Run tests
- `npx playwright show-report` - View HTML test report
- `npx playwright codegen` - Generate selectors
- `npm run prettier` - prettier for code style edit
- `npm run eslint` - helps to find unused code or mistakes

---

## 💬 Need Help?

Ask your friendly QA team lead 😉 or check the docs: [Playwright Docs](https://playwright.dev/)

---

Happy testing! 🎯

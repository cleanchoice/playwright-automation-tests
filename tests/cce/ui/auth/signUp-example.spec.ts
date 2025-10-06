import { test } from '../../../../src/fixtures/main-fixture';
import { signUpTestData } from '../../../../src/test-data/sign-up-test-data';
import { tags } from '../../../../src/test-data/test-tags';

test.describe(`Sign Up test group`, () => {
  test(`Sign Up test`,
    {
      tag: [tags.cce, tags.e2e],
    },
    async ({ anonUser }) => {
      await anonUser.signUpPage.open();
      await anonUser.signUpPage.signUp({
        firstName: signUpTestData.firstName(),
        lastName: signUpTestData.lastName(),
        email: signUpTestData.email(),
        password: signUpTestData.password,
        confirmPassword: signUpTestData.confirmPassword
      });
    },
  );
});

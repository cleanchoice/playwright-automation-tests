import { test } from '../../../../src/fixtures/main-fixture';
import { tags } from '../../../../src/test-data/test-tags';
import { validUserDetails } from '../../../../src/test-data/sign-in-test-data';

test.describe(`Sign In test group`, () => {
  test(`Sign In test`,
    {
      tag: [tags.cce, tags.e2e],
    },
    async ({ anonUser }) => {
      await anonUser.signInPage.open();
      await anonUser.signInPage.signIn(validUserDetails.validEmail, validUserDetails.universalPassword);
    },
  );
});

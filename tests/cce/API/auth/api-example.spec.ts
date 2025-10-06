import { test } from '../../../../src/fixtures/main-fixture';
import { expect } from '../../../../src/utils/wrapped-expect';
import { tags } from '../../../../src/test-data/test-tags';
import { validUserDetails } from '../../../../src/test-data/sign-in-test-data';

test.describe('Sign In API tests group', () => {
  test(`Sign In API test`,
    {
      tag: [tags.cce, tags.api],
    },
    async ({ api }) => {
      const csrfToken = await api.signIn.getCsrfToken();
      const signInResponse = await api.signIn.signIn({
        email: validUserDetails.validEmail,
        password: validUserDetails.universalPassword,
        redirect: 'false',
        csrfToken: csrfToken,
        callbackUrl: `${process.env.BASE_URL}/v2/auth`,
        json: 'true',
      });
      expect(signInResponse.status).toBe(200);
    },
  );
});

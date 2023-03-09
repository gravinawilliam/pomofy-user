import { FacebookAccount } from '@models/facebook-account.model';
import { GoogleAccount } from '@models/google-account.model';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';
import { Password } from '@value-objects/password.value-object';

export type User = {
  id: Id;
  email: Email;
  password: Password;
  isEmailValidated: boolean;
  facebookAccount?: Pick<FacebookAccount, 'id'>;
  googleAccount?: Pick<GoogleAccount, 'id'>;
};

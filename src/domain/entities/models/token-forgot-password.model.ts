import { User } from '@models/user.model';

export type TokenForgotPassword = {
  value: string;
  expirationDate: Date;
  user: Pick<User, 'id'>;
};

import { faker } from '@faker-js/faker';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';
import { Password } from '@value-objects/password.value-object';

export const password = (): Password => new Password({ password: faker.internet.password() });
export const email = (): Email => new Email({ email: faker.internet.email() });
export const fullName = (): string => faker.name.fullName();
export const id = (): Id => new Id({ id: faker.datatype.uuid() });

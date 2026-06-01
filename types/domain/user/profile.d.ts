import { UserProfile } from '@prisma/client';

export type WithUserProfile<T> = T & {
  profile: UserProfile;
};

export type WithOptionalUserProfile<T> = T & {
  profile?: UserProfile;
};

import { UserJobPreferences } from '@prisma/client';

export type WithUserJobPreferences<T> = T & {
  jobPreferences: UserJobPreferences;
};

export type WithOptionalUserJobPreferences<T> = T & {
  jobPreferences?: UserJobPreferences;
};

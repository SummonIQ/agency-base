'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { User, UserProfile } from '@prisma/client';
// import { User } from 'better-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MONTHS } from '@/constants/dates';
import { US_STATES } from '@/constants/locales';

import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';

export const userDetailsFormSchema = z.object({
  city: z.string().optional().or(z.literal('')),
  educationDegree: z.string().optional().or(z.literal('')),
  educationEndMonth: z.number().min(0).max(11).optional(),
  educationEndYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  educationInstitution: z.string().optional().or(z.literal('')),
  educationInstitutionLocation: z.string().optional().or(z.literal('')),
  educationStartMonth: z.number().min(0).max(11).optional(),
  educationStartYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  emailAddress: z.string().email().optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  streetAddress: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
});

export function UserDetailsForm({
  action,
  user,
  userProfile,
}: {
  action: (values: z.infer<typeof userDetailsFormSchema>) => Promise<void>;
  user: User;
  userProfile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof userDetailsFormSchema>>({
    defaultValues: {
      city: userProfile.city ?? '',
      educationDegree: userProfile.educationDegree ?? '',
      educationEndMonth: userProfile.educationEndMonth ?? undefined,
      educationEndYear: userProfile.educationEndYear ?? undefined,
      educationInstitution: userProfile.educationInstitution ?? '',
      educationInstitutionLocation:
        userProfile.educationInstitutionLocation ?? '',
      educationStartMonth: userProfile.educationStartMonth ?? undefined,
      educationStartYear: userProfile.educationStartYear ?? undefined,
      emailAddress: userProfile.emailAddress ?? user?.email ?? '',
      firstName: userProfile.firstName ?? user?.firstName ?? '',
      githubUrl: userProfile.githubUrl ?? '',
      lastName: userProfile.lastName ?? user?.lastName ?? '',
      linkedinUrl: userProfile.linkedinUrl ?? '',
      phoneNumber: userProfile.phoneNumber ?? '',
      state: userProfile.state ?? '',
      streetAddress: userProfile.streetAddress ?? '',
      websiteUrl: userProfile.websiteUrl ?? '',
      zipCode: userProfile.zipCode ?? '',
    },
    resolver: zodResolver(userDetailsFormSchema),
  });
  const [isSaving, setIsSaving] = useState(false);
  const onSubmit = async (values: z.infer<typeof userDetailsFormSchema>) => {
    setIsSaving(true);
    await action(values);
    setIsSaving(false);
    router.refresh();
    window.scrollTo(0, 0);
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-base font-semibold">Personal Information</h3>

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input className="max-w-64" disabled={isSaving} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input className="max-w-64" disabled={isSaving} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  className="max-w-64"
                  disabled={isSaving}
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  className="max-w-64"
                  disabled={isSaving}
                  type="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input className="max-w-64" disabled={isSaving} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input className="max-w-64" disabled={isSaving} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <SelectTrigger className="min-w-36">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(US_STATES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input className="max-w-28" disabled={isSaving} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <h3 className="text-base font-semibold">Social Media</h3>

        <FormField
          control={form.control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input
                  className="max-w-96"
                  disabled={isSaving}
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input
                  className="max-w-96"
                  disabled={isSaving}
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub URL</FormLabel>
              <FormControl>
                <Input
                  className="max-w-96"
                  disabled={isSaving}
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <h3 className="text-base font-semibold">Education</h3>

        <FormField
          control={form.control}
          name="educationInstitution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl>
                <Input className="max-w-64" disabled={isSaving} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="educationInstitutionLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution Location</FormLabel>
              <FormControl>
                <Input className="max-w-64" disabled={isSaving} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="educationDegree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <FormControl>
                <Input className="max-w-64" disabled={isSaving} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="educationStartMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Month</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSaving}
                    {...field}
                    onValueChange={value => {
                      field.onChange(Number.parseInt(value));
                    }}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="min-w-36 max-w-36">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="educationStartYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSaving}
                    {...field}
                    onValueChange={value => {
                      field.onChange(Number.parseInt(value));
                    }}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="min-w-36 max-w-36">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Show years in reverse order from current year to 1920 */}
                      {Array.from(
                        { length: new Date().getFullYear() - 1920 },
                        (_, i) => (
                          <SelectItem
                            key={(new Date().getFullYear() - i).toString()}
                            value={(new Date().getFullYear() - i).toString()}
                          >
                            {new Date().getFullYear() - i}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="educationEndMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Month</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSaving}
                    {...field}
                    onValueChange={value => {
                      field.onChange(Number.parseInt(value));
                    }}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="min-w-36 max-w-36">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="educationEndYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Year</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSaving}
                    {...field}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="min-w-36 max-w-36">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: new Date().getFullYear() - 1920 },
                        (_, i) => (
                          <SelectItem
                            key={(new Date().getFullYear() - i).toString()}
                            value={(new Date().getFullYear() - i).toString()}
                          >
                            {new Date().getFullYear() - i}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="flex">
          <Button disabled={isSaving} inProgress={isSaving} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

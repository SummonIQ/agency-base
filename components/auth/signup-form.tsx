'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { ProgressIndicator } from '../progress/progress-indicator';
// import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/css';

import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const signupFormSchema = z.object({
  emailAddress: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

export function SignupForm({
  emailAddress,
  className,
  redirectUrl,
  // onSignup,
  // isLoggedIn,
}: {
  className?: string;
  emailAddress?: string;
  isLoggedIn?: boolean;
  // onSignup: (data: {
  //   emailAddress: string;
  //   firstName: string;
  //   lastName: string;
  //   password: string;
  // }) => Promise<{
  //   emailAddress: string;
  //   firstName: string;
  //   id: string;
  //   lastName: string;
  // }>;
  redirectUrl?: string;
}) {
  const form = useForm<z.infer<typeof signupFormSchema>>({
    defaultValues: {
      emailAddress: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    resolver: zodResolver(signupFormSchema),
  });
  const [error, setError] = useState<string | undefined>();
  const [inProgress, setInProgress] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     router.push(redirectUrl ?? '/dashboard');
  //   }
  // }, [isLoggedIn, redirectUrl, router]);
  const getErrorMessage = ({
    code,
    message,
  }: {
    code?: string | undefined;
    message?: string | undefined;
    status: number;
    statusText: string;
  }) => {
    if (code === 'USER_ALREADY_EXISTS') {
      return 'Email already exists';
    }
    return message;
  };

  async function onSubmit({
    emailAddress,
    firstName,
    lastName,
    password,
  }: z.infer<typeof signupFormSchema>) {
    setError(undefined);
    setInProgress(true);

    const { data, error } = await authClient.signUp.email({
      email: emailAddress,
      firstName,
      image: '/images/avatar.png',
      lastName,
      password,
    });

    if (error) {
      setError(getErrorMessage(error));
      setInProgress(false);
    } else {
      // Set flag to trigger onboarding flow after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('isNewUser', 'true');
        console.log('[Signup] Set isNewUser flag for onboarding');
      }
      router.push(redirectUrl ?? '/login');
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('gap-y-6', className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-5 flex flex-col space-y-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="firstName">First name</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    autoComplete="given-name"
                    id="firstName"
                    name="firstName"
                    required
                    type="text"
                    // variant="brand"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="lastName">Last name</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    autoComplete="family-name"
                    id="lastName"
                    name="lastName"
                    required
                    type="text"
                    // variant="brand"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="emailAddress">Email address</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    autoComplete="email"
                    defaultValue={emailAddress}
                    disabled={Boolean(emailAddress)}
                    id="emailAddress"
                    name="emailAddress"
                    required
                    type="email"
                    // variant="brand"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Password</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    autoComplete="new-password"
                    id="password"
                    name="password"
                    required
                    type="password"
                    // variant="brand"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          className="flex w-full justify-center py-6 text-base md:py-4 md:text-sm"
          disabled={inProgress}
          type="submit"
        >
          {inProgress ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </Form>
  );
}

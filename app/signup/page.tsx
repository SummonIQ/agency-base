import Link from 'next/link';

import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SignupPage(props: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const searchParams = await props.searchParams;
  // const session = await auth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 md:items-center lg:px-8">
      <Card className="w-full max-w-96 rounded-lg sm:w-3/6 md:w-2/5 lg:w-1/3 xl:w-1/4">
        <CardHeader className="flex w-full flex-col items-center justify-center space-y-2 text-center">
          <span className="rounded-full border border-border/50 bg-accent/30 px-4 py-2">
            AgencyBase
          </span>

          <CardTitle className="items-center justify-center text-center">
            Sign up for an account
          </CardTitle>
        </CardHeader>

        <CardContent className="bg-secondary/20">
          <SignupForm
            // isLoggedIn={!!session && !!session.user}
            // onSignup={async data => {
            //   'use server';

            //   const result = await signUp(data);

            //   return result;
            // }}
            redirectUrl={searchParams.redirect_url}
          />
        </CardContent>

        <CardFooter className="flex items-center justify-center border-t border-t-border p-3">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{'  '}
            <Link
              className="font-semibold text-primary no-underline underline-offset-4 hover:underline"
              href="/login"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

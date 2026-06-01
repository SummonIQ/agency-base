import Link from 'next/link';
import { redirect } from 'next/navigation';

import LoginForm from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCurrentUser } from '@/lib/user';

export default async function LoginPage(props: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const user = await getCurrentUser();
  const searchParams = await props.searchParams;

  if (user) {
    return redirect(searchParams.redirect_url ?? '/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12 md:items-center lg:px-8">
      <Card className="w-full max-w-96 rounded-lg sm:w-3/6 md:w-2/5 lg:w-1/3 xl:w-1/4 2xl:w-1/5 my-auto">
        <CardHeader className="flex w-full flex-col items-center justify-center space-y-2 text-center">
          <span className="rounded-full border border-border/50 bg-accent/30 px-4 py-2">
            AgencyBase
          </span>

          <CardTitle className="items-center justify-center text-center">
            Login to your account
          </CardTitle>
        </CardHeader>

        <CardContent className="bg-secondary/20">
          <LoginForm
            isLoggedIn={!!user}
            redirectUrl={searchParams.redirect_url ?? '/dashboard'}
            // signIn={async ({ email, password }) => {
            //   'use server';

            //   const result = await signIn('credentials', {
            //     email,
            //     password,
            //     redirect: false,
            //   });

            //   return result;
            // }}
          />
        </CardContent>
        <CardFooter className="flex items-center justify-center border-t border-t-border p-3">
          <p className="text-center text-sm text-muted-foreground">
            Not a member?{' '}
            <Link
              className="font-semibold text-primary no-underline underline-offset-4 hover:underline"
              href="/signup"
            >
              Sign up now!
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Update Password Page
 *
 * This page is reached AFTER verification through /verify route
 * The user should have an active session at this point
 */
export default async function Page() {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // If no session, user needs to go through forgot password flow again
  if (sessionError || !session) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Session Expired</CardTitle>
              <CardDescription>Your password reset session has expired</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Please request a new password reset link. Reset links are valid for a limited time.
              </p>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request New Reset Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User has active session - show the password update form
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

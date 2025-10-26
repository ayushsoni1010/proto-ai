"use client";

import { cn } from "@/lib/utils";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [state?.success, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {state?.success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Password Updated!</CardTitle>
            <CardDescription>Your password has been successfully reset</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              You can now sign in with your new password.
            </p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>Please enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="New password"
                    required
                    disabled={isPending}
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    required
                    disabled={isPending}
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Saving..." : "Save new password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

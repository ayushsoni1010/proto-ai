"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schemas
const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Types for action results
type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Sign up a new user
 */
export async function signUp(
  prevState: ActionResult<{ requiresConfirmation?: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ requiresConfirmation?: boolean }>> {
  try {
    // Validate input
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedData = signUpSchema.parse(rawData);

    const supabase = await createClient();

    const origin = process.env.NEXT_PUBLIC_APP_URL;
    const callbackUrl = `${origin}/verify`;

    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email.trim().toLowerCase(),
      password: validatedData.password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("User already registered")
      ) {
        return {
          success: false,
          error: "This email is already registered. Please sign in instead.",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (data.user && !data.session) {
      return {
        success: true,
        data: { requiresConfirmation: true },
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate input
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = signInSchema.parse(rawData);

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email.trim().toLowerCase(),
      password: validatedData.password,
    });

    if (error) {
      // Handle specific errors
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Invalid email or password")
      ) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }
      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error:
            "Please confirm your email before signing in. Check your inbox for the confirmation link.",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: "Could not create session. Please try again.",
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Sign out error:", error);
  }
  redirect("/login");
}

/**
 * Send password reset email
 */
export async function forgotPassword(
  prevState: ActionResult<{ message?: string }> | null,
  formData: FormData
): Promise<ActionResult<{ message?: string }>> {
  try {
    const rawData = {
      email: formData.get("email") as string,
    };

    const validatedData = forgotPasswordSchema.parse(rawData);

    const supabase = await createClient();

    const origin = process.env.NEXT_PUBLIC_APP_URL;
    const redirectTo = `${origin}/verify?next=/update-password&type=password_reset`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email.trim().toLowerCase(),
      {
        redirectTo,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
      data: {
        message:
          "If an account exists with this email, you will receive a password reset link.",
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Reset password with new password
 */
export async function resetPassword(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate input
    const rawData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedData = resetPasswordSchema.parse(rawData);

    const supabase = await createClient();

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return {
        success: false,
        error:
          "Your session has expired. Please request a new password reset link.",
      };
    }

    if (!session) {
      return {
        success: false,
        error:
          "No active session found. Please click the reset link in your email again.",
      };
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes("New password should be different")) {
        return {
          success: false,
          error: "New password must be different from your current password.",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Get the current user (server-side)
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Get user error:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

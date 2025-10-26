import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Universal Auth Verification Handler
 *
 * Handles:
 * - OAuth code exchange (Google, GitHub, etc.)
 * - Email OTP verification (signup, magic link, password reset)
 * - Password reset flow
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type"); // Get as string first
  const next = searchParams.get("next") || "/";
  const code = searchParams.get("code");

  const supabase = await createClient();

  // ============================================
  // Code Exchange (OAuth or Password Reset)
  // ============================================
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Code exchange error:", error);
      return NextResponse.redirect(`${origin}/error?message=${encodeURIComponent(error.message)}`);
    }

    // Check if this is a password reset (we set type=password_reset in forgotPassword action)
    if (typeParam === "password_reset" || next === "/update-password") {
      return NextResponse.redirect(`${origin}/update-password`);
    }

    // OAuth or other code exchange - redirect to intended destination
    return NextResponse.redirect(`${origin}${next}`);
  }

  // ============================================
  // Email OTP Verification
  // ============================================
  if (token_hash && typeParam) {
    const type = typeParam as EmailOtpType;

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("OTP verification error:", error);
      return NextResponse.redirect(`${origin}/error?message=${encodeURIComponent(error.message)}`);
    }

    // Route based on verification type
    switch (type) {
      case "recovery":
        // Password reset - redirect to update password page
        return NextResponse.redirect(`${origin}/update-password`);

      case "email_change":
        // Email change - redirect to update password (they might want to update password too)
        return NextResponse.redirect(`${origin}/update-password`);

      case "signup":
        // Signup confirmation - redirect to app
        return NextResponse.redirect(`${origin}${next}`);

      case "magiclink":
        // Magic link login - redirect to app
        return NextResponse.redirect(`${origin}${next}`);

      default:
        // Unknown type - redirect to app
        return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/error?message=${encodeURIComponent("Invalid verification link")}`
  );
}

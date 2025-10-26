import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Proto AI",
  description: "Sign in or create an account to access your Proto AI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-[40%] right-[10%] h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[40%] h-96 w-96 rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      {/* Logo/Brand header */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label="Artist Palette">🎨</span>
            <span className="text-xl font-bold text-white">Proto AI</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative">{children}</main>

      {/* Footer */}
      <footer className="relative mt-8 border-t border-gray-800 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Proto AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

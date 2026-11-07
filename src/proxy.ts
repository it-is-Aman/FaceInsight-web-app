import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages that need an account. API routes do their own auth checks and return JSON errors.
const isProtectedPage = createRouteMatcher(["/history(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

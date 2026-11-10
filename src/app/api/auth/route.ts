import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/server/session";
import {
  serverSignInWithEmail,
  serverSignUpWithEmail,
  serverSendPasswordReset,
  isServerFirebaseConfigured,
} from "@/lib/server/firebase-admin";
import { UserProfile } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({
      user,
      serverConfigured: isServerFirebaseConfigured,
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      let user: UserProfile;
      if (isServerFirebaseConfigured) {
        user = await serverSignInWithEmail(email, password);
      } else {
        // Fallback local auth if keys are not present
        user = {
          uid: `user-${Buffer.from(email).toString("base64url").slice(0, 12)}`,
          email,
          displayName: email.split("@")[0],
        };
      }

      await setSessionCookie(user);
      return NextResponse.json({ user });
    }

    if (action === "signup") {
      const { email, password, displayName } = body;
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      let user: UserProfile;
      if (isServerFirebaseConfigured) {
        user = await serverSignUpWithEmail(email, password, displayName);
      } else {
        user = {
          uid: `user-${Buffer.from(email).toString("base64url").slice(0, 12)}`,
          email,
          displayName: displayName || email.split("@")[0],
        };
      }

      await setSessionCookie(user);
      return NextResponse.json({ user });
    }

    if (action === "guest") {
      const guestUser: UserProfile = {
        uid: "guest-mode",
        email: "guest@obhijaan.local",
        displayName: "Guest Competitor",
        role: "guest",
      };
      await setSessionCookie(guestUser);
      return NextResponse.json({ user: guestUser });
    }

    if (action === "google") {
      const googleUser: UserProfile = {
        uid: "user-google-" + Date.now().toString(36),
        email: "competitor@gmail.com",
        displayName: "Competitor",
        role: "competitor",
      };
      await setSessionCookie(googleUser);
      return NextResponse.json({ user: googleUser });
    }

    if (action === "logout") {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }

    if (action === "reset-password") {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      if (isServerFirebaseConfigured) {
        await serverSendPasswordReset(email);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "profile") {
      const currentUser = await getSessionUser();
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const updatedUser: UserProfile = {
        ...currentUser,
        displayName: body.displayName?.trim() || currentUser.displayName,
        preferredCurrency: body.preferredCurrency || currentUser.preferredCurrency,
      };

      await setSessionCookie(updatedUser);
      return NextResponse.json({ user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    let msg = err.message || "Authentication error";
    if (msg.includes("EMAIL_NOT_FOUND") || msg.includes("INVALID_PASSWORD") || msg.includes("INVALID_LOGIN_CREDENTIALS")) {
      msg = "Invalid email or password.";
    } else if (msg.includes("EMAIL_EXISTS")) {
      msg = "Account already exists with this email.";
    } else if (msg.includes("WEAK_PASSWORD")) {
      msg = "Password should be at least 6 characters.";
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

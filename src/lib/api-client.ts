import { UserProfile } from "@/types";

/**
 * OBHIJAAN Client-Side API Bridge
 * Communicates ONLY with Next.js Server API routes.
 * Zero credentials, API keys, or project secrets are exposed to the browser.
 */

export const apiClient = {
  auth: {
    async getMe(): Promise<{ user: UserProfile | null; serverConfigured: boolean }> {
      try {
        const res = await fetch("/api/auth", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return { user: null, serverConfigured: false };
        return await res.json();
      } catch (err) {
        return { user: null, serverConfigured: false };
      }
    },

    async login(email: string, password: string): Promise<UserProfile> {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      return data.user;
    },

    async signup(email: string, password: string, displayName?: string): Promise<UserProfile> {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "signup", email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }
      return data.user;
    },

    async guestLogin(): Promise<UserProfile> {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "guest" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Guest login failed");
      }
      return data.user;
    },

    async googleLogin(): Promise<UserProfile> {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "google" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google sign-in failed");
      }
      return data.user;
    },

    async logout(): Promise<void> {
      try {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "logout" }),
        });
      } catch (err) {
        // Safe fire-and-forget
      }
    },

    async resetPassword(email: string): Promise<void> {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset-password", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset failed");
      }
    },

    async updateProfile(displayName: string, preferredCurrency?: string): Promise<UserProfile> {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "profile", displayName, preferredCurrency }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Profile update failed");
      }
      return data.user;
    },
  },

  sync: {
    async fetchUserData(): Promise<any> {
      try {
        const res = await fetch("/api/sync", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        console.warn("Failed to fetch server sync:", err);
        return null;
      }
    },

    async saveDoc(collection: string, id: string, data: any): Promise<void> {
      try {
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ collection, id, data }),
        });
      } catch (err) {
        console.warn(`Sync save failed for ${collection}/${id}:`, err);
      }
    },

    async deleteDoc(collection: string, id: string): Promise<void> {
      try {
        await fetch(
          `/api/sync?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
      } catch (err) {
        console.warn(`Sync delete failed for ${collection}/${id}:`, err);
      }
    },
  },

  files: {
    async upload(
      file: File,
      category: string = "vault"
    ): Promise<{ url: string; name: string; size: number; type: string }> {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/files", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed");
      }
      return data;
    },
  },
};

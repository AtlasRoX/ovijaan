import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import {
  serverUploadFileToStorage,
  isServerFirebaseConfigured,
} from "@/lib/server/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "vault";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isServerFirebaseConfigured) {
      try {
        const folder = `users/${user.uid}/${category.toLowerCase()}`;
        const uploaded = await serverUploadFileToStorage(
          buffer,
          file.name,
          file.type,
          folder
        );
        return NextResponse.json(uploaded);
      } catch (storageErr) {
        console.warn("[Files API] Cloud Storage upload fallback to base64:", storageErr);
      }
    }

    // Fallback: create base64 data URL if storage bucket is not active or errored
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type || "application/octet-stream"};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import {
  serverSaveFirestoreDoc,
  serverDeleteFirestoreDoc,
  serverGetFirestoreDoc,
  serverFetchUserDocs,
  isServerFirebaseConfigured,
} from "@/lib/server/firebase-admin";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.uid === "guest-mode" || !isServerFirebaseConfigured) {
      return NextResponse.json({
        competitions: [],
        projects: [],
        competitionProjectLinks: [],
        submissions: [],
        tasks: [],
        teammates: [],
        teams: [],
        results: [],
        files: [],
      });
    }

    const fetchSafe = (coll: string) =>
      serverFetchUserDocs(coll, user.uid).catch((err) => {
        console.warn(`[Sync] fetch error for ${coll}:`, err);
        return [];
      });

    const [
      competitions,
      projects,
      competitionProjectLinks,
      submissions,
      tasks,
      teammates,
      teams,
      results,
      files,
    ] = await Promise.all([
      fetchSafe("competitions"),
      fetchSafe("projects"),
      fetchSafe("competition_projects"),
      fetchSafe("submissions"),
      fetchSafe("tasks"),
      fetchSafe("teammates"),
      fetchSafe("teams"),
      fetchSafe("results"),
      fetchSafe("files"),
    ]);

    return NextResponse.json({
      competitions,
      projects,
      competitionProjectLinks,
      submissions,
      tasks,
      teammates,
      teams,
      results,
      files,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { collection, id, data } = body;

    if (!collection || !id || !data) {
      return NextResponse.json(
        { error: "Missing collection, id, or data" },
        { status: 400 }
      );
    }

    if (user.uid === "guest-mode" || !isServerFirebaseConfigured) {
      return NextResponse.json({ ok: true, offline: true });
    }

    // Enforce data ownership
    const securedData = {
      ...data,
      userId: user.uid,
    };

    await serverSaveFirestoreDoc(collection, id, securedData);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");
    const id = searchParams.get("id");

    if (!collection || !id) {
      return NextResponse.json(
        { error: "Missing collection or id" },
        { status: 400 }
      );
    }

    if (user.uid === "guest-mode" || !isServerFirebaseConfigured) {
      return NextResponse.json({ ok: true, offline: true });
    }

    // Verify ownership before deleting — prevent cross-user IDOR
    const existing = await serverGetFirestoreDoc(collection, id);
    if (existing && existing.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await serverDeleteFirestoreDoc(collection, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

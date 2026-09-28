import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDigestById } from "@/lib/intelligence-data";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const digest = await getDigestById(params.id);
  if (!digest?.email_html) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(digest.email_html, { headers: { "Content-Type": "text/html" } });
}

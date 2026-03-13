import { NextResponse } from "next/server";
import { normalizeOperationResult, resolveResultStatus } from "@/lib/api-response";
import { handleIceBoxArchiveUpload } from "@/lib/ice-box-upload.server";
import { localizeOperationResult } from "@/lib/server-translations";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; uploadId: string }> },
) {
  const { id, uploadId } = await params;
  const result = await handleIceBoxArchiveUpload(request, id, uploadId);

  return NextResponse.json(normalizeOperationResult(await localizeOperationResult(result, request)), {
    status: resolveResultStatus(result),
  });
}

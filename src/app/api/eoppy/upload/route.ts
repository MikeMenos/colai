import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return new NextResponse("Missing file", { status: 400 });
    }

    // Demo endpoint: in a real app you would
    // - upload to S3 / server storage
    // - trigger OCR/AI processing
    // - return parsed fields

    return NextResponse.json({ ok: true, filename: file.name });
  } catch {
    return new NextResponse("Upload failed", { status: 500 });
  }
}

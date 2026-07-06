import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

async function getGitBranchName(): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["branch", "--show-current"],
    { cwd: process.cwd() },
  );
  const branchName = stdout.trim();
  if (branchName) return branchName;

  const fallback = await execFileAsync(
    "git",
    ["rev-parse", "--short", "HEAD"],
    { cwd: process.cwd() },
  );
  return `detached-${fallback.stdout.trim()}`;
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );
  }

  try {
    const branchName = await getGitBranchName();
    return NextResponse.json(
      { branchName },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Could not read git branch." },
      { status: 500 },
    );
  }
}

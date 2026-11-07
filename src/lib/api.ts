import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNSUPPORTED_TYPE"
  | "FILE_TOO_LARGE"
  | "SIGN_IN_REQUIRED"
  | "NO_CREDITS"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "NO_FACE"
  | "INVALID_IMAGE"
  | "ML_UNAVAILABLE"
  | "ML_ERROR"
  | "AI_UNAVAILABLE"
  | "INTERNAL";

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string };
}

export function apiError(status: number, code: ApiErrorCode, message: string) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message } }, { status });
}

/** Client helper: turn a failed fetch Response into a typed error. */
export async function readApiError(res: Response): Promise<ApiErrorBody["error"]> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error ?? { code: "INTERNAL", message: `Request failed (${res.status})` };
}

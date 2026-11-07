import { describe, expect, it } from "vitest";
import { MlError, readGradioComplete } from "@/lib/ml";

describe("readGradioComplete", () => {
  it("returns the first item of the complete event", () => {
    const sse = 'event: generating\ndata: null\n\nevent: complete\ndata: [{"predictions": [], "x": 1}]\n\n';
    expect(readGradioComplete(sse)).toEqual({ predictions: [], x: 1 });
  });

  it("passes through service errors for the caller to map", () => {
    const sse = 'event: complete\ndata: [{"error": {"code": "NO_FACE", "message": "no face"}}]\n\n';
    expect(readGradioComplete(sse)).toEqual({ error: { code: "NO_FACE", message: "no face" } });
  });

  it("throws on gradio error events and on garbage", () => {
    expect(() => readGradioComplete("event: error\ndata: null\n\n")).toThrow(MlError);
    expect(() => readGradioComplete("<html>Space is building</html>")).toThrow(MlError);
  });
});

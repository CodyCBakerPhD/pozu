import { describe, expect, it, vi } from "vitest";
import { buildPayload } from "../../src/payload.ts";
import { LABEL_ANNOTATION_API_URL, submitLabelPayload } from "../../src/label-api.ts";

const payload = buildPayload({
    videoUrl: "https://example.com/video.mp4",
    frameIndex: 7,
    videoMeta: { totalFrames: 100, fps: 30, width: 640, height: 480 },
    placed: new Map(),
    now: () => "2024-01-02T03:04:05.000Z",
});

describe("submitLabelPayload", () => {
    it("posts JSON to the labels annotation endpoint", async () => {
        const fetchMock = vi.fn(async () => new Response("", { status: 202 }));

        await submitLabelPayload(payload, fetchMock as unknown as typeof fetch);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(LABEL_ANNOTATION_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });
    });

    it("throws with response detail when the server rejects the payload", async () => {
        const fetchMock = vi.fn(
            async () => new Response("bad payload", { status: 400, statusText: "Bad Request" })
        );

        await expect(
            submitLabelPayload(payload, fetchMock as unknown as typeof fetch)
        ).rejects.toThrow("Server rejected submission (400 Bad Request): bad payload");
    });
});

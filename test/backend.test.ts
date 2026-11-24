import { describe, expect, it } from "vitest";
import { ResultAsync } from "neverthrow";
import { defaultResultBackend, SdkResultAsync } from "@openapi-sdk-tools/core";
import {
  NeverthrowResult,
  neverthrowPlugin,
  neverthrowResultBackend,
  toResultAsync,
} from "../src";

describe("neverthrowResultBackend", () => {
  it("creates ok results", async () => {
    const result = neverthrowResultBackend.ok(7);

    expect(result).toBeInstanceOf(NeverthrowResult);
    expect(result.native).toBeInstanceOf(ResultAsync);
    await expect(result.match((v) => v, () => -1)).resolves.toBe(7);
  });

  it("creates err results", async () => {
    const result = neverthrowResultBackend.err<never, string>("boom");

    await expect(result.match(() => "ok", (e) => e)).resolves.toBe("boom");
  });

  it("wraps promises and maps rejections", async () => {
    const result = neverthrowResultBackend.fromPromise(
      Promise.reject(new Error("network")),
      (error) => (error as Error).message,
    );

    await expect(result.match(() => "ok", (e) => e)).resolves.toBe("network");
  });

  it("chains through the native ResultAsync", async () => {
    const result = neverthrowResultBackend
      .ok(2)
      .map((v) => v * 3)
      .andThen((v) => neverthrowResultBackend.ok(v + 1))
      .mapErr((e) => String(e));

    await expect(result.match((v) => v, () => -1)).resolves.toBe(7);
  });

  it("exposes the neverthrow plugin descriptor", () => {
    const plugin = neverthrowPlugin();

    expect(plugin.name).toBe("neverthrow");
    expect(plugin.result).toBe(neverthrowResultBackend);
  });
});

describe("toResultAsync", () => {
  it("converts a default-backend SdkResultAsync", async () => {
    const result = new SdkResultAsync(
      defaultResultBackend.ok<number, string>(5),
    );

    const native = toResultAsync(result);

    expect(native).toBeInstanceOf(ResultAsync);
    await expect(native.match((v) => v, () => -1)).resolves.toBe(5);
  });

  it("returns the native result unchanged for neverthrow-backed values", () => {
    const backendResult = neverthrowResultBackend.ok<number, string>(5);
    const result = new SdkResultAsync(backendResult);

    expect(toResultAsync(result)).toBe(backendResult.native);
  });

  it("preserves errors when converting", async () => {
    const result = new SdkResultAsync(
      defaultResultBackend.err<number, string>("boom"),
    );

    await expect(
      toResultAsync(result).match(
        () => "ok",
        (error) => error,
      ),
    ).resolves.toBe("boom");
  });
});

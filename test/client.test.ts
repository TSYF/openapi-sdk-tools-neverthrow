import { describe, expect, it } from "vitest";
import { ResultAsync } from "neverthrow";
import { defaultResultBackend, SdkResultAsync } from "@openapi-sdk-tools/core";
import { neverthrowClient, toResultAsync } from "../src";

class FakeClient {
  readonly nested: { getOther: () => SdkResultAsync<number, "NOT_FOUND", string> };

  constructor(private readonly prefix: string) {
    this.nested = {
      getOther: () =>
        new SdkResultAsync(
          defaultResultBackend.ok<number, string>(2),
        ) as SdkResultAsync<number, "NOT_FOUND", string>,
    };
  }

  getValue(): SdkResultAsync<string, "NOT_FOUND", string> {
    return new SdkResultAsync(
      defaultResultBackend.ok<string, string>(`${this.prefix}-value`),
    );
  }

  plain(): string {
    return `${this.prefix}-plain`;
  }
}

describe("neverthrowClient", () => {
  it("converts top-level method results to ResultAsync", async () => {
    const client = neverthrowClient(new FakeClient("api"));

    const result = client.getValue();

    expect(result).toBeInstanceOf(ResultAsync);
    await expect(result.match((v) => v, () => "error")).resolves.toBe(
      "api-value",
    );
  });

  it("recurses into nested sub-clients", async () => {
    const client = neverthrowClient(new FakeClient("api"));

    await expect(
      client.nested.getOther().match((v) => v, () => -1),
    ).resolves.toBe(2);
  });

  it("keeps the receiver bound to the original client", () => {
    const client = neverthrowClient(new FakeClient("bound"));

    expect(client.plain()).toBe("bound-plain");
  });

  it("leaves non-result methods untouched", () => {
    const client = neverthrowClient(new FakeClient("api"));
    const value = client.plain();

    expect(value).toBe("api-plain");
  });

  it("agrees with toResultAsync on plain SdkResultAsync values", async () => {
    const original = new SdkResultAsync(
      defaultResultBackend.ok<number, string>(3),
    );

    await expect(
      toResultAsync(original).match(
        (v) => v,
        () => -1,
      ),
    ).resolves.toBe(3);
  });
});

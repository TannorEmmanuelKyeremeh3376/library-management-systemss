import { beforeEach, describe, expect, it, vi } from "vitest";

describe("createContext", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.OAUTH_SERVER_URL;
    delete process.env.JWT_SECRET;
    delete process.env.VITE_APP_ID;
    delete process.env.NODE_ENV;
  });

  it("returns a demo user when OAuth is not configured", async () => {
    const { createContext } = await import("./context");

    const ctx = await createContext({
      req: {
        headers: {},
      },
      res: {},
    } as any);

    expect(ctx.user?.openId).toBe("demo-user");
    expect(ctx.user?.role).toBe("admin");
  });
});

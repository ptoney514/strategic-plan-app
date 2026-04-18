import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import { account, session, user, verification } from "../auth";

describe("auth schema", () => {
  it("includes updated_at on the verification table", () => {
    const config = getTableConfig(verification);
    const columnNames = config.columns.map((column) => column.name);

    expect(config.name).toBe("verification");
    expect(columnNames).toEqual(
      expect.arrayContaining([
        "id",
        "identifier",
        "value",
        "expires_at",
        "created_at",
        "updated_at",
      ]),
    );

    const updatedAt = config.columns.find((column) => column.name === "updated_at");
    expect(updatedAt).toBeDefined();
    expect(updatedAt?.hasDefault).toBe(true);
    expect(updatedAt?.dataType).toBe("date");
  });

  it("keeps password-bearing account tables wired for email auth", () => {
    const accountConfig = getTableConfig(account);
    const sessionConfig = getTableConfig(session);
    const userConfig = getTableConfig(user);

    expect(accountConfig.columns.map((column) => column.name)).toContain("password");
    expect(sessionConfig.columns.map((column) => column.name)).toContain("user_id");
    expect(userConfig.columns.map((column) => column.name)).toContain("email");
  });
});

import { describe, it, expect } from "vitest";
import { organizations } from "../organizations";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("organizations schema", () => {
  const config = getTableConfig(organizations);

  it("has the correct table name", () => {
    expect(config.name).toBe("organizations");
  });

  it("has all expected columns", () => {
    const columnNames = config.columns.map((c) => c.name);
    const expected = [
      "id",
      "name",
      "slug",
      "entity_type",
      "entity_label",
      "logo_url",
      "primary_color",
      "secondary_color",
      "settings",
      "admin_email",
      "tagline",
      "dashboard_template",
      "dashboard_config",
      "is_public",
      "is_active",
      "onboarding_completed",
      "template_mode",
      "created_by",
      "created_at",
      "updated_at",
    ];

    for (const col of expected) {
      expect(columnNames).toContain(col);
    }
  });

  it("has UUID primary key with default", () => {
    const idCol = config.columns.find((c) => c.name === "id")!;
    expect(idCol).toBeDefined();
    expect(idCol.dataType).toBe("string"); // UUID maps to string dataType in Drizzle
    expect(idCol.hasDefault).toBe(true);
    expect(idCol.primary).toBe(true);
  });

  it("has slug column that is unique and not nullable", () => {
    const slugCol = config.columns.find((c) => c.name === "slug")!;
    expect(slugCol).toBeDefined();
    expect(slugCol.notNull).toBe(true);
    expect(slugCol.isUnique).toBe(true);
  });

  it("has created_at with default value", () => {
    const createdAt = config.columns.find((c) => c.name === "created_at")!;
    expect(createdAt).toBeDefined();
    expect(createdAt.hasDefault).toBe(true);
  });

  it("has entity_type column that is not nullable", () => {
    const entityType = config.columns.find((c) => c.name === "entity_type")!;
    expect(entityType).toBeDefined();
    expect(entityType.notNull).toBe(true);
  });

  it("has onboarding and appearance columns", () => {
    const onboardingCompleted = config.columns.find(
      (c) => c.name === "onboarding_completed"
    )!;
    expect(onboardingCompleted).toBeDefined();
    expect(onboardingCompleted.hasDefault).toBe(true);

    const primaryColor = config.columns.find(
      (c) => c.name === "primary_color"
    )!;
    expect(primaryColor).toBeDefined();
    expect(primaryColor.hasDefault).toBe(true);

    const secondaryColor = config.columns.find(
      (c) => c.name === "secondary_color"
    )!;
    expect(secondaryColor).toBeDefined();
    expect(secondaryColor.hasDefault).toBe(true);
  });

  it("has correct column types", () => {
    const colTypes: Record<string, string> = {};
    for (const col of config.columns) {
      colTypes[col.name] = col.dataType;
    }

    expect(colTypes["id"]).toBe("string"); // uuid
    expect(colTypes["name"]).toBe("string"); // varchar
    expect(colTypes["slug"]).toBe("string"); // varchar
    expect(colTypes["entity_type"]).toBe("string"); // varchar
    expect(colTypes["is_public"]).toBe("boolean");
    expect(colTypes["is_active"]).toBe("boolean");
    expect(colTypes["onboarding_completed"]).toBe("boolean");
    expect(colTypes["settings"]).toBe("json"); // jsonb
    expect(colTypes["tagline"]).toBe("string"); // text
    expect(colTypes["created_at"]).toBe("date"); // timestamp
    expect(colTypes["updated_at"]).toBe("date"); // timestamp
  });
});

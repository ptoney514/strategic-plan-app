import { describe, it, expect } from "vitest";
import { plans } from "../plans";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("plans schema", () => {
  const config = getTableConfig(plans);

  it("has the correct table name", () => {
    expect(config.name).toBe("plans");
  });

  it("has all expected columns", () => {
    const columnNames = config.columns.map((c) => c.name);
    const expected = [
      "id",
      "organization_id",
      "name",
      "slug",
      "type_label",
      "description",
      "cover_image_url",
      "is_public",
      "is_active",
      "start_date",
      "end_date",
      "order_position",
      "public_template",
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
    expect(idCol.dataType).toBe("string"); // UUID maps to string
    expect(idCol.hasDefault).toBe(true);
    expect(idCol.primary).toBe(true);
  });

  it("has organization_id that is not nullable with foreign key", () => {
    const orgIdCol = config.columns.find(
      (c) => c.name === "organization_id"
    )!;
    expect(orgIdCol).toBeDefined();
    expect(orgIdCol.notNull).toBe(true);

    // Check foreign key exists to organizations table
    expect(config.foreignKeys.length).toBeGreaterThan(0);
    const orgFk = config.foreignKeys.find((fk) => {
      const ref = fk.reference();
      return ref.columns.some((c) => c.name === "organization_id");
    });
    expect(orgFk).toBeDefined();
  });

  it("has created_at and updated_at with defaults", () => {
    const createdAt = config.columns.find((c) => c.name === "created_at")!;
    expect(createdAt).toBeDefined();
    expect(createdAt.hasDefault).toBe(true);

    const updatedAt = config.columns.find((c) => c.name === "updated_at")!;
    expect(updatedAt).toBeDefined();
    expect(updatedAt.hasDefault).toBe(true);
  });

  it("has name column that is not nullable", () => {
    const nameCol = config.columns.find((c) => c.name === "name")!;
    expect(nameCol).toBeDefined();
    expect(nameCol.notNull).toBe(true);
  });

  it("has correct default values for optional columns", () => {
    const isPublic = config.columns.find((c) => c.name === "is_public")!;
    expect(isPublic.hasDefault).toBe(true);

    const isActive = config.columns.find((c) => c.name === "is_active")!;
    expect(isActive.hasDefault).toBe(true);

    const orderPosition = config.columns.find(
      (c) => c.name === "order_position"
    )!;
    expect(orderPosition.hasDefault).toBe(true);

    const typeLabel = config.columns.find((c) => c.name === "type_label")!;
    expect(typeLabel.hasDefault).toBe(true);
  });

  it("has public_template column that is notNull with default", () => {
    const publicTemplate = config.columns.find(
      (c) => c.name === "public_template",
    )!;
    expect(publicTemplate).toBeDefined();
    expect(publicTemplate.notNull).toBe(true);
    expect(publicTemplate.hasDefault).toBe(true);
  });
});

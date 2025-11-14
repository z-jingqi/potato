import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Collections table (数据集合/项目)
export const collections = sqliteTable(
  "collections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("collections_userId_idx").on(table.userId),
  })
);

// Records table (数据记录)
export const records = sqliteTable(
  "records",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    collectionId: text("collectionId")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    recordDate: integer("recordDate", { mode: "timestamp" }).notNull(),
    data: text("data").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    collectionIdIdx: index("records_collectionId_idx").on(table.collectionId),
    recordDateIdx: index("records_recordDate_idx").on(table.recordDate),
  })
);

// AI Analysis table (AI 分析)
export const aiAnalysis = sqliteTable(
  "ai_analysis",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    collectionIds: text("collectionIds").notNull(), // JSON array of collection IDs
    query: text("query").notNull(),
    response: text("response").notNull(),
    context: text("context"),
    analysisType: text("analysisType"),
    model: text("model").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("ai_analysis_userId_idx").on(table.userId),
    collectionIdsIdx: index("ai_analysis_collectionIds_idx").on(table.collectionIds),
  })
);

// Relations
export const collectionsRelations = relations(collections, ({ many }) => ({
  records: many(records),
}));

export const recordsRelations = relations(records, ({ one }) => ({
  collection: one(collections, {
    fields: [records.collectionId],
    references: [collections.id],
  }),
}));

// Type exports for TypeScript
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type Record = typeof records.$inferSelect;
export type NewRecord = typeof records.$inferInsert;

export type AIAnalysis = typeof aiAnalysis.$inferSelect;
export type NewAIAnalysis = typeof aiAnalysis.$inferInsert;

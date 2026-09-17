import { pgTable, serial, timestamp, varchar, text, uuid, index, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    nickname: varchar("nickname", { length: 100 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

export const tags = pgTable(
  "tags",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    board: varchar("board", { length: 20 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    normalized_name: varchar("normalized_name", { length: 200 }).notNull(),
    created_by: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tags_board_idx").on(table.board),
    uniqueIndex("tags_board_normalized_idx").on(table.board, table.normalized_name),
    index("tags_created_by_idx").on(table.created_by),
  ]
);

export const tagVotes = pgTable(
  "tag_votes",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    tag_id: varchar("tag_id", { length: 36 }).notNull().references(() => tags.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tag_votes_tag_user_idx").on(table.tag_id, table.user_id),
    index("tag_votes_user_id_idx").on(table.user_id),
  ]
);

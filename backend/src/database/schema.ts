import {pgTable, text, timestamp, uuid, boolean, varchar} from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    }).defaultNow().$onUpdateFn(() => sql`now()`),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  revoked: boolean("revoked").default(false).notNull(),
});



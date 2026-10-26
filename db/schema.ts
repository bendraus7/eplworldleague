import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const playerProfiles = sqliteTable('player_profiles', {
  playerId: text('player_id').primaryKey(),
  bio: text('bio').notNull().default(''),
  version: integer('version').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
  updatedBy: text('updated_by').notNull(),
});
export const playerIdentities = sqliteTable('player_identities', {
  playerId: text('player_id').primaryKey(),
  duprCode: text('dupr_code').notNull(),
  profileId: text('profile_id').notNull(),
  updatedAt: text('updated_at').notNull(),
  updatedBy: text('updated_by').notNull(),
});
export const sourceCache = sqliteTable('source_cache', {
  key: text('cache_key').primaryKey(),
  payload: text('payload').notNull(),
  fetchedAt: text('fetched_at').notNull(),
});

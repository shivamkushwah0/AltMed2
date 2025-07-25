import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medications table
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandName: varchar("brand_name").notNull(),
  genericName: varchar("generic_name"),
  category: varchar("category").notNull(), // prescription, otc
  description: text("description").notNull(),
  uses: text("uses").notNull(),
  dosage: text("dosage").notNull(),
  precautions: text("precautions").notNull(),
  interactions: text("interactions").notNull(),
  sideEffects: text("side_effects").notNull(),
  imageUrl: varchar("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Symptoms table
export const symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  iconName: varchar("icon_name"), // Font Awesome icon name
  isCommon: boolean("is_common").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication-Symptom relationships
export const medicationSymptoms = pgTable("medication_symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  symptomId: varchar("symptom_id").notNull().references(() => symptoms.id),
  effectiveness: integer("effectiveness").notNull(), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
});

// Pharmacies table
export const pharmacies = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  phone: varchar("phone"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pharmacy stock table
export const pharmacyStock = pgTable("pharmacy_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pharmacyId: varchar("pharmacy_id").notNull().references(() => pharmacies.id),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  stockLevel: varchar("stock_level").notNull(), // in_stock, low_stock, out_of_stock
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// User favorites
export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Search history
export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  searchQuery: text("search_query").notNull(),
  symptomIds: text("symptom_ids").array(), // Array of symptom IDs
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const medicationRelations = relations(medications, ({ many }) => ({
  symptoms: many(medicationSymptoms),
  pharmacyStock: many(pharmacyStock),
  favorites: many(userFavorites),
}));

export const symptomRelations = relations(symptoms, ({ many }) => ({
  medications: many(medicationSymptoms),
}));

export const medicationSymptomRelations = relations(medicationSymptoms, ({ one }) => ({
  medication: one(medications, {
    fields: [medicationSymptoms.medicationId],
    references: [medications.id],
  }),
  symptom: one(symptoms, {
    fields: [medicationSymptoms.symptomId],
    references: [symptoms.id],
  }),
}));

export const pharmacyRelations = relations(pharmacies, ({ many }) => ({
  stock: many(pharmacyStock),
}));

export const pharmacyStockRelations = relations(pharmacyStock, ({ one }) => ({
  pharmacy: one(pharmacies, {
    fields: [pharmacyStock.pharmacyId],
    references: [pharmacies.id],
  }),
  medication: one(medications, {
    fields: [pharmacyStock.medicationId],
    references: [medications.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  favorites: many(userFavorites),
  searchHistory: many(searchHistory),
}));

export const userFavoriteRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  medication: one(medications, {
    fields: [userFavorites.medicationId],
    references: [medications.id],
  }),
}));

// Insert schemas
export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  createdAt: true,
});

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type PharmacyStock = typeof pharmacyStock.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

// Extended types with relations
export type MedicationWithDetails = Medication & {
  symptoms?: (typeof medicationSymptoms.$inferSelect & {
    symptom: Symptom;
  })[];
  pharmacyStock?: (PharmacyStock & {
    pharmacy: Pharmacy;
  })[];
};

export type PharmacyWithStock = Pharmacy & {
  stock?: (PharmacyStock & {
    medication: Medication;
  })[];
};

import {
  users,
  medications,
  symptoms,
  medicationSymptoms,
  pharmacies,
  pharmacyStock,
  userFavorites,
  searchHistory,
  type User,
  type UpsertUser,
  type Medication,
  type InsertMedication,
  type Symptom,
  type InsertSymptom,
  type Pharmacy,
  type InsertPharmacy,
  type PharmacyStock,
  type UserFavorite,
  type InsertUserFavorite,
  type SearchHistory,
  type InsertSearchHistory,
  type MedicationWithDetails,
  type PharmacyWithStock,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, sql, desc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Medication operations
  getMedications(): Promise<Medication[]>;
  getMedicationById(id: string): Promise<MedicationWithDetails | undefined>;
  getMedicationsBySymptom(symptomIds: string[]): Promise<MedicationWithDetails[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  
  // Symptom operations
  getSymptoms(): Promise<Symptom[]>;
  getCommonSymptoms(): Promise<Symptom[]>;
  getSymptomByName(name: string): Promise<Symptom | undefined>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  
  // Pharmacy operations
  getPharmacies(): Promise<Pharmacy[]>;
  getNearbyPharmacies(lat: number, lng: number, radius: number): Promise<PharmacyWithStock[]>;
  getPharmacyStock(pharmacyId: string, medicationId: string): Promise<PharmacyStock | undefined>;
  
  // User favorites
  getUserFavorites(userId: string): Promise<MedicationWithDetails[]>;
  addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFavorite(userId: string, medicationId: string): Promise<void>;
  
  // Search history
  getUserSearchHistory(userId: string): Promise<SearchHistory[]>;
  addSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Medication operations
  async getMedications(): Promise<Medication[]> {
    return await db.select().from(medications).where(eq(medications.isActive, true));
  }

  async getMedicationById(id: string): Promise<MedicationWithDetails | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, id), eq(medications.isActive, true)));
    
    if (!medication) return undefined;

    const symptomData = await db
      .select({
        medicationSymptom: medicationSymptoms,
        symptom: symptoms,
      })
      .from(medicationSymptoms)
      .innerJoin(symptoms, eq(medicationSymptoms.symptomId, symptoms.id))
      .where(eq(medicationSymptoms.medicationId, id));

    return {
      ...medication,
      symptoms: symptomData.map(item => ({
        ...item.medicationSymptom,
        symptom: item.symptom,
      })),
    };
  }

  async getMedicationsBySymptom(symptomIds: string[]): Promise<MedicationWithDetails[]> {
    if (symptomIds.length === 0) return [];

    const medicationData = await db
      .select({
        medication: medications,
        medicationSymptom: medicationSymptoms,
        symptom: symptoms,
      })
      .from(medications)
      .innerJoin(medicationSymptoms, eq(medications.id, medicationSymptoms.medicationId))
      .innerJoin(symptoms, eq(medicationSymptoms.symptomId, symptoms.id))
      .where(
        and(
          eq(medications.isActive, true),
          inArray(symptoms.id, symptomIds)
        )
      )
      .orderBy(desc(medicationSymptoms.effectiveness));

    // Group by medication
    const medicationMap = new Map<string, MedicationWithDetails>();
    
    medicationData.forEach(item => {
      const med = item.medication;
      if (!medicationMap.has(med.id)) {
        medicationMap.set(med.id, {
          ...med,
          symptoms: [],
        });
      }
      
      const existingMed = medicationMap.get(med.id)!;
      existingMed.symptoms!.push({
        ...item.medicationSymptom,
        symptom: item.symptom,
      });
    });

    return Array.from(medicationMap.values());
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db
      .insert(medications)
      .values(medication)
      .returning();
    return newMedication;
  }

  // Symptom operations
  async getSymptoms(): Promise<Symptom[]> {
    return await db.select().from(symptoms);
  }

  async getCommonSymptoms(): Promise<Symptom[]> {
    return await db.select().from(symptoms).where(eq(symptoms.isCommon, true));
  }

  async getSymptomByName(name: string): Promise<Symptom | undefined> {
    const [symptom] = await db
      .select()
      .from(symptoms)
      .where(ilike(symptoms.name, `%${name}%`));
    return symptom;
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const [newSymptom] = await db
      .insert(symptoms)
      .values(symptom)
      .returning();
    return newSymptom;
  }

  // Pharmacy operations
  async getPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies).where(eq(pharmacies.isActive, true));
  }

  async getNearbyPharmacies(lat: number, lng: number, radius: number): Promise<PharmacyWithStock[]> {
    // Using Haversine formula for distance calculation
    const pharmacyData = await db
      .select({
        pharmacy: pharmacies,
        distance: sql<number>`
          (6371 * acos(
            cos(radians(${lat})) * cos(radians(${pharmacies.latitude})) *
            cos(radians(${pharmacies.longitude}) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(${pharmacies.latitude}))
          ))
        `.as('distance'),
      })
      .from(pharmacies)
      .where(
        and(
          eq(pharmacies.isActive, true),
          sql`(6371 * acos(
            cos(radians(${lat})) * cos(radians(${pharmacies.latitude})) *
            cos(radians(${pharmacies.longitude}) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(${pharmacies.latitude}))
          )) <= ${radius}`
        )
      )
      .orderBy(sql`distance`);

    // For each pharmacy, get stock information
    const result: PharmacyWithStock[] = [];
    for (const item of pharmacyData) {
      const stock = await db
        .select({
          pharmacyStock: pharmacyStock,
          medication: medications,
        })
        .from(pharmacyStock)
        .innerJoin(medications, eq(pharmacyStock.medicationId, medications.id))
        .where(eq(pharmacyStock.pharmacyId, item.pharmacy.id));

      result.push({
        ...item.pharmacy,
        stock: stock.map(s => ({
          ...s.pharmacyStock,
          medication: s.medication,
        })),
      });
    }

    return result;
  }

  async getPharmacyStock(pharmacyId: string, medicationId: string): Promise<PharmacyStock | undefined> {
    const [stock] = await db
      .select()
      .from(pharmacyStock)
      .where(
        and(
          eq(pharmacyStock.pharmacyId, pharmacyId),
          eq(pharmacyStock.medicationId, medicationId)
        )
      );
    return stock;
  }

  // User favorites
  async getUserFavorites(userId: string): Promise<MedicationWithDetails[]> {
    const favorites = await db
      .select({
        medication: medications,
      })
      .from(userFavorites)
      .innerJoin(medications, eq(userFavorites.medicationId, medications.id))
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(medications.isActive, true)
        )
      );

    const result: MedicationWithDetails[] = [];
    for (const item of favorites) {
      const medicationWithDetails = await this.getMedicationById(item.medication.id);
      if (medicationWithDetails) {
        result.push(medicationWithDetails);
      }
    }

    return result;
  }

  async addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const [newFavorite] = await db
      .insert(userFavorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, medicationId: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.medicationId, medicationId)
        )
      );
  }

  // Search history
  async getUserSearchHistory(userId: string): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(10);
  }

  async addSearchHistory(search: InsertSearchHistory): Promise<SearchHistory> {
    const [newSearch] = await db
      .insert(searchHistory)
      .values(search)
      .returning();
    return newSearch;
  }
}

export const storage = new DatabaseStorage();

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
} from "../shared/schema.ts";
import { db } from "./db.ts";


// Switch behavior solely via NODE_ENV
const isDevelopment = process.env.NODE_ENV === 'development';
let memoryStore: { [key: string]: any[] } = {};

if (isDevelopment) {
  // Initialize with sample data for local development
  memoryStore = {
    users: [
      {
        id: "dev-user-123",
        email: "dev@example.com",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    symptoms: [
      { id: "symptom-1", name: "Headache", description: "Pain in the head or upper neck", severity: "moderate" },
      { id: "symptom-2", name: "Fever", description: "Elevated body temperature", severity: "moderate" },
      { id: "symptom-3", name: "Cough", description: "Sudden expulsion of air from lungs", severity: "mild" },
      { id: "symptom-4", name: "Nausea", description: "Feeling of sickness with inclination to vomit", severity: "mild" },
      { id: "symptom-5", name: "Fatigue", description: "Extreme tiredness or lack of energy", severity: "mild" },
      { id: "symptom-6", name: "Chest Pain", description: "Pain or discomfort in the chest area", severity: "severe" }
    ],
    medications: [
      {
        id: "med-1",
        brandName: "Tylenol",
        genericName: "Acetaminophen",
        description: "Pain reliever and fever reducer",
        dosage: "500mg tablets",
        sideEffects: ["Nausea", "Stomach upset"],
        warnings: ["Do not exceed 4000mg per day"],
        price: 8.99,
        category: "Pain Relief"
      },
      {
        id: "med-2",
        brandName: "Advil",
        genericName: "Ibuprofen",
        description: "Non-steroidal anti-inflammatory drug (NSAID)",
        dosage: "200mg tablets",
        sideEffects: ["Stomach irritation", "Dizziness"],
        warnings: ["Take with food", "May increase bleeding risk"],
        price: 7.49,
        category: "Pain Relief"
      }
    ],
    pharmacies: [
      {
        id: "pharmacy-1",
        name: "Local Pharmacy",
        address: "123 Main St, City, State 12345",
        latitude: 40.7128,
        longitude: -74.0060,
        phone: "(555) 123-4567",
        hours: "Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-6PM"
      }
      ],
      userFavorites: [],
  };
}
import { eq, and, ilike, sql, desc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: { firstName: string; lastName: string }): Promise<User>;

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
  
  // Medication-Symptom relationships
  createMedicationSymptom(relationship: { medicationId: string; symptomId: string; effectiveness: number }): Promise<any>;
  
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async createMedicationSymptom(relationship: { medicationId: string; symptomId: string; effectiveness: number }) {
    const [result] = await db
      .insert(medicationSymptoms)
      .values(relationship)
      .returning();
    return result;
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

  async updateUserProfile(userId: string, updates: { firstName: string; lastName: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName: updates.firstName,
        lastName: updates.lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
}

// Create a memory storage class for local development
class MemoryStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    if (!memoryStore.users) return undefined;
    return memoryStore.users.find((user: User) => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!memoryStore.users) return undefined;
    return memoryStore.users.find((user: any) => user.email === email);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!memoryStore.users) memoryStore.users = [];
    const existing = memoryStore.users.findIndex((u: any) => u.id === userData.id);
    const user = { ...userData, createdAt: new Date(), updatedAt: new Date() };
    
    if (existing >= 0) {
      memoryStore.users[existing] = user;
    } else {
      memoryStore.users.push(user);
    }
    return user as User;
  }

  // Medication operations
  async getMedications(): Promise<Medication[]> {
    return memoryStore.medications || [];
  }

  async getMedicationById(id: string): Promise<MedicationWithDetails | undefined> {
    const medication = memoryStore.medications?.find((m: any) => m.id === id);
    if (!medication) return undefined;
    return { ...medication, symptoms: [] };
  }

  async getMedicationsBySymptom(symptomIds: string[]): Promise<MedicationWithDetails[]> {
    return (memoryStore.medications || []).map((m: any) => ({ ...m, symptoms: [] }));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const newMed = { ...medication, id: `med-${Date.now()}`, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    if (!memoryStore.medications) memoryStore.medications = [];
    memoryStore.medications.push(newMed);
    return newMed as Medication;
  }

  // Symptom operations
  async getSymptoms(): Promise<Symptom[]> {
    return memoryStore.symptoms || [];
  }

  async getCommonSymptoms(): Promise<Symptom[]> {
    return memoryStore.symptoms || [];
  }

  async getSymptomByName(name: string): Promise<Symptom | undefined> {
    return memoryStore.symptoms?.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const newSymptom = { ...symptom, id: `symptom-${Date.now()}` };
    if (!memoryStore.symptoms) memoryStore.symptoms = [];
    memoryStore.symptoms.push(newSymptom);
    return newSymptom as Symptom;
  }

  async createMedicationSymptom(relationship: { medicationId: string; symptomId: string; effectiveness: number }): Promise<any> {
    // For memory storage, we'll just return the relationship as is
    return {
      ...relationship,
      id: `medsym-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Pharmacy operations
  async getPharmacies(): Promise<Pharmacy[]> {
    return memoryStore.pharmacies || [];
  }

  async getNearbyPharmacies(lat: number, lng: number, radius: number): Promise<PharmacyWithStock[]> {
    return (memoryStore.pharmacies || []).map((p: any) => ({ ...p, medications: [] }));
  }

  async getPharmacyStock(pharmacyId: string, medicationId: string): Promise<PharmacyStock | undefined> {
    return { 
      id: `stock-${pharmacyId}-${medicationId}`,
      pharmacyId, 
      medicationId, 
      stockLevel: "in-stock",
      lastUpdated: new Date() 
    } as PharmacyStock;
  }

  // User favorites
  async getUserFavorites(userId: string): Promise<MedicationWithDetails[]> {
    const favs = (memoryStore.userFavorites || []).filter((f: any) => f.userId === userId);
    const meds = memoryStore.medications || [];
    const result: MedicationWithDetails[] = favs
      .map((f: any) => meds.find((m: any) => m.id === f.medicationId))
      .filter(Boolean)
      .map((m: any) => ({ ...m, symptoms: [] }));
    return result;
  }

  async addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    if (!memoryStore.userFavorites) memoryStore.userFavorites = [];
    const exists = memoryStore.userFavorites.find(
      (f: any) => f.userId === favorite.userId && f.medicationId === favorite.medicationId,
    );
    if (exists) return exists as UserFavorite;
    const newFav = { ...favorite, id: `fav-${Date.now()}`, createdAt: new Date() } as UserFavorite;
    memoryStore.userFavorites.push(newFav);
    return newFav;
  }

  async removeFavorite(userId: string, medicationId: string): Promise<void> {
    if (!memoryStore.userFavorites) return;
    memoryStore.userFavorites = memoryStore.userFavorites.filter(
      (f: any) => !(f.userId === userId && f.medicationId === medicationId),
    );
  }

  // Search history
  async getUserSearchHistory(userId: string): Promise<SearchHistory[]> {
    return [];
  }

  async addSearchHistory(search: InsertSearchHistory): Promise<SearchHistory> {
    return { ...search, id: `search-${Date.now()}`, createdAt: new Date() } as SearchHistory;
  }

  async updateUserProfile(userId: string, updates: { firstName: string; lastName: string }): Promise<User> {
    if (!memoryStore.users) throw new Error("User not found");
    
    const userIndex = memoryStore.users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    const updatedUser = {
      ...memoryStore.users[userIndex],
      firstName: updates.firstName,
      lastName: updates.lastName,
      updatedAt: new Date(),
    };
    
    memoryStore.users[userIndex] = updatedUser;
    return updatedUser as User;
  }
}

// Use memory storage for development without database, otherwise use database storage
export const storage = isDevelopment ? new MemoryStorage() : new DatabaseStorage();

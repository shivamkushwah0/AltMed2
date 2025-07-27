import { db } from "../server/db";
import { symptoms, medications, medicationSymptoms, pharmacies, pharmacyStock } from "../shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    await db.delete(pharmacyStock);
    await db.delete(medicationSymptoms);
    await db.delete(medications);
    await db.delete(symptoms);
    await db.delete(pharmacies);

    // Insert symptoms
    await db.insert(symptoms).values([
      {
        id: 'symptom-1',
        name: 'Headache',
        description: 'Pain or ache in the head',
        iconName: 'head',
        isCommon: true,
      },
      {
        id: 'symptom-2',
        name: 'Fever',
        description: 'Elevated body temperature',
        iconName: 'thermometer',
        isCommon: true,
      },
      {
        id: 'symptom-3',
        name: 'Cough',
        description: 'Forceful expulsion of air from lungs',
        iconName: 'user-sound',
        isCommon: true,
      },
      {
        id: 'symptom-4',
        name: 'Nausea',
        description: 'Feeling of sickness in stomach',
        iconName: 'stomach',
        isCommon: true,
      },
      {
        id: 'symptom-5',
        name: 'Sore Throat',
        description: 'Pain or irritation in throat',
        iconName: 'mouth',
        isCommon: true,
      }
    ]);

    // Insert medications
    await db.insert(medications).values([
      {
        id: 'med-1',
        brandName: 'Tylenol',
        genericName: 'Acetaminophen',
        category: 'otc',
        description: 'Pain reliever and fever reducer',
        uses: 'Treats headaches, muscle aches, backaches, toothaches, and fevers',
        dosage: 'Adults: 500-1000mg every 4-6 hours, not to exceed 3000mg in 24 hours',
        precautions: 'Do not exceed recommended dose. Consult doctor if symptoms persist.',
        interactions: 'May interact with warfarin and other blood thinners',
        sideEffects: 'Rare: liver damage with overdose',
        price: '12.99',
      },
      {
        id: 'med-2',
        brandName: 'Advil',
        genericName: 'Ibuprofen',
        category: 'otc',
        description: 'Nonsteroidal anti-inflammatory drug (NSAID)',
        uses: 'Reduces inflammation, pain, and fever',
        dosage: 'Adults: 200-400mg every 4-6 hours, not to exceed 1200mg in 24 hours',
        precautions: 'Take with food to reduce stomach irritation. Not for those with kidney problems.',
        interactions: 'May interact with blood thinners, ACE inhibitors',
        sideEffects: 'Stomach upset, dizziness, heartburn',
        price: '14.50',
      },
      {
        id: 'med-3',
        brandName: 'Robitussin',
        genericName: 'Dextromethorphan',
        category: 'otc',
        description: 'Cough suppressant',
        uses: 'Suppresses dry, hacking cough',
        dosage: 'Adults: 15-30mg every 4 hours, not to exceed 120mg in 24 hours',
        precautions: 'Do not use with other cough medicines. Consult doctor for persistent cough.',
        interactions: 'May interact with MAO inhibitors',
        sideEffects: 'Drowsiness, dizziness, nausea',
        price: '9.99',
      },
      {
        id: 'med-4',
        brandName: 'Pepto-Bismol',
        genericName: 'Bismuth subsalicylate',
        category: 'otc',
        description: 'Anti-diarrheal and stomach soother',
        uses: 'Treats upset stomach, nausea, diarrhea',
        dosage: 'Adults: 525mg every 30 minutes to 1 hour as needed',
        precautions: 'Not for children under 12. May cause temporary darkening of tongue or stool.',
        interactions: 'Do not take with aspirin or blood thinners',
        sideEffects: 'Black stool, darkened tongue',
        price: '8.75',
      }
    ]);

    // Insert medication-symptom relationships
    await db.insert(medicationSymptoms).values([
      { medicationId: 'med-1', symptomId: 'symptom-1', effectiveness: 5 },
      { medicationId: 'med-1', symptomId: 'symptom-2', effectiveness: 4 },
      { medicationId: 'med-2', symptomId: 'symptom-1', effectiveness: 4 },
      { medicationId: 'med-2', symptomId: 'symptom-2', effectiveness: 5 },
      { medicationId: 'med-3', symptomId: 'symptom-3', effectiveness: 5 },
      { medicationId: 'med-4', symptomId: 'symptom-4', effectiveness: 4 },
    ]);

    // Insert pharmacies
    await db.insert(pharmacies).values([
      {
        id: 'pharmacy-1',
        name: 'CVS Pharmacy',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '(555) 123-4567',
        latitude: '40.7589',
        longitude: '-73.9851',
      },
      {
        id: 'pharmacy-2',
        name: 'Walgreens',
        address: '456 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10013',
        phone: '(555) 987-6543',
        latitude: '40.7614',
        longitude: '-73.9776',
      },
      {
        id: 'pharmacy-3',
        name: 'Rite Aid',
        address: '789 Park Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10021',
        phone: '(555) 456-7890',
        latitude: '40.7736',
        longitude: '-73.9566',
      }
    ]);

    // Insert pharmacy stock
    await db.insert(pharmacyStock).values([
      { pharmacyId: 'pharmacy-1', medicationId: 'med-1', stockLevel: 'in_stock' },
      { pharmacyId: 'pharmacy-1', medicationId: 'med-2', stockLevel: 'in_stock' },
      { pharmacyId: 'pharmacy-1', medicationId: 'med-3', stockLevel: 'low_stock' },
      { pharmacyId: 'pharmacy-2', medicationId: 'med-1', stockLevel: 'in_stock' },
      { pharmacyId: 'pharmacy-2', medicationId: 'med-2', stockLevel: 'out_of_stock' },
      { pharmacyId: 'pharmacy-2', medicationId: 'med-4', stockLevel: 'in_stock' },
      { pharmacyId: 'pharmacy-3', medicationId: 'med-1', stockLevel: 'low_stock' },
      { pharmacyId: 'pharmacy-3', medicationId: 'med-3', stockLevel: 'in_stock' },
      { pharmacyId: 'pharmacy-3', medicationId: 'med-4', stockLevel: 'in_stock' },
    ]);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedDatabase();
import { storage } from "./storage";
import type { InsertSymptom, InsertMedication } from "@shared/schema";

// Comprehensive symptom data
const symptoms: InsertSymptom[] = [
  // Respiratory & ENT
  { name: "Cough", description: "Persistent or dry cough", iconName: "wind", isCommon: true },
  { name: "Sore Throat", description: "Pain or irritation in the throat", iconName: "activity", isCommon: true },
  { name: "Runny Nose", description: "Nasal discharge or congestion", iconName: "droplets", isCommon: true },
  { name: "Stuffy Nose", description: "Blocked nasal passages", iconName: "shield", isCommon: true },
  { name: "Sneezing", description: "Frequent sneezing episodes", iconName: "wind" },
  { name: "Shortness of Breath", description: "Difficulty breathing or breathlessness", iconName: "activity" },
  { name: "Chest Congestion", description: "Feeling of fullness in the chest", iconName: "heart" },
  { name: "Wheezing", description: "High-pitched breathing sound", iconName: "activity" },
  { name: "Post-nasal Drip", description: "Mucus dripping from nose to throat", iconName: "droplets" },
  { name: "Hoarse Voice", description: "Rough or strained voice", iconName: "mic" },
  
  // Gastrointestinal
  { name: "Nausea", description: "Feeling of sickness or queasiness", iconName: "frown", isCommon: true },
  { name: "Vomiting", description: "Throwing up or feeling like throwing up", iconName: "frown" },
  { name: "Stomach Ache", description: "Pain or discomfort in the stomach area", iconName: "circle", isCommon: true },
  { name: "Diarrhea", description: "Loose or watery stools", iconName: "trending-down" },
  { name: "Constipation", description: "Difficulty passing stools", iconName: "minus" },
  { name: "Heartburn", description: "Burning sensation in chest or throat", iconName: "flame", isCommon: true },
  { name: "Acid Reflux", description: "Stomach acid backing up into esophagus", iconName: "arrow-up" },
  { name: "Bloating", description: "Feeling of fullness or swelling in abdomen", iconName: "circle" },
  { name: "Gas", description: "Excessive gas or flatulence", iconName: "wind" },
  { name: "Indigestion", description: "Discomfort after eating", iconName: "circle" },
  { name: "Loss of Appetite", description: "Reduced desire to eat", iconName: "minus" },
  { name: "Stomach Cramps", description: "Sharp pains in the stomach", iconName: "zap" },
  
  // Pain & Inflammation
  { name: "Headache", description: "Pain in the head or upper neck", iconName: "brain", isCommon: true },
  { name: "Migraine", description: "Severe headache with other symptoms", iconName: "brain" },
  { name: "Back Pain", description: "Pain in the back muscles or spine", iconName: "activity", isCommon: true },
  { name: "Neck Pain", description: "Pain or stiffness in the neck", iconName: "activity" },
  { name: "Muscle Pain", description: "Aching or sore muscles", iconName: "activity", isCommon: true },
  { name: "Joint Pain", description: "Pain in joints like knees, elbows", iconName: "activity", isCommon: true },
  { name: "Arthritis", description: "Joint inflammation and stiffness", iconName: "activity" },
  { name: "Menstrual Cramps", description: "Pain during menstruation", iconName: "heart" },
  { name: "Toothache", description: "Pain in or around teeth", iconName: "activity" },
  { name: "Earache", description: "Pain in the ear", iconName: "activity" },
  { name: "Chest Pain", description: "Pain or discomfort in chest area", iconName: "heart" },
  { name: "Foot Pain", description: "Pain in feet or ankles", iconName: "activity" },
  
  // Fever & Infection
  { name: "Fever", description: "Elevated body temperature", iconName: "thermometer", isCommon: true },
  { name: "Chills", description: "Feeling cold with shivering", iconName: "snowflake" },
  { name: "Body Aches", description: "General body pain and discomfort", iconName: "activity", isCommon: true },
  { name: "Fatigue", description: "Extreme tiredness or exhaustion", iconName: "battery", isCommon: true },
  { name: "Weakness", description: "Lack of physical strength", iconName: "trending-down" },
  { name: "Malaise", description: "General feeling of being unwell", iconName: "frown" },
  
  // Skin Conditions
  { name: "Rash", description: "Red, itchy, or irritated skin", iconName: "activity", isCommon: true },
  { name: "Itchy Skin", description: "Skin that feels itchy or irritated", iconName: "activity" },
  { name: "Dry Skin", description: "Skin that feels dry or flaky", iconName: "sun" },
  { name: "Acne", description: "Pimples or skin breakouts", iconName: "circle" },
  { name: "Eczema", description: "Inflamed, itchy skin condition", iconName: "activity" },
  { name: "Sunburn", description: "Skin damage from sun exposure", iconName: "sun" },
  { name: "Cuts", description: "Minor cuts or scrapes", iconName: "activity" },
  { name: "Bruises", description: "Discolored skin from injury", iconName: "circle" },
  { name: "Insect Bites", description: "Bites from mosquitoes, bees, etc.", iconName: "activity" },
  { name: "Hives", description: "Raised, itchy bumps on skin", iconName: "activity" },
  
  // Sleep & Mental Health
  { name: "Insomnia", description: "Difficulty falling or staying asleep", iconName: "moon", isCommon: true },
  { name: "Anxiety", description: "Feelings of worry or nervousness", iconName: "heart", isCommon: true },
  { name: "Stress", description: "Mental or emotional strain", iconName: "zap", isCommon: true },
  { name: "Depression", description: "Persistent feelings of sadness", iconName: "cloud" },
  { name: "Restlessness", description: "Inability to rest or relax", iconName: "activity" },
  { name: "Mood Swings", description: "Rapid changes in emotional state", iconName: "trending-up" },
  { name: "Concentration Problems", description: "Difficulty focusing or concentrating", iconName: "brain" },
  
  // Digestive Specific
  { name: "Hemorrhoids", description: "Swollen veins in rectum or anus", iconName: "circle" },
  { name: "Motion Sickness", description: "Nausea from travel or movement", iconName: "rotate-cw" },
  { name: "Morning Sickness", description: "Nausea during pregnancy", iconName: "sunrise" },
  
  // Eye & Vision
  { name: "Eye Irritation", description: "Red, itchy, or watery eyes", iconName: "eye" },
  { name: "Dry Eyes", description: "Eyes that feel dry or gritty", iconName: "eye" },
  { name: "Eye Strain", description: "Tired eyes from screen time", iconName: "eye" },
  { name: "Pink Eye", description: "Eye infection or irritation", iconName: "eye" },
  
  // Allergies
  { name: "Seasonal Allergies", description: "Allergic reactions to pollen", iconName: "cloud", isCommon: true },
  { name: "Food Allergies", description: "Allergic reactions to food", iconName: "activity" },
  { name: "Hay Fever", description: "Allergic rhinitis", iconName: "wind" },
  { name: "Allergic Reactions", description: "General allergic responses", iconName: "alert-triangle" },
  
  // Women's Health
  { name: "PMS", description: "Premenstrual syndrome symptoms", iconName: "heart" },
  { name: "Yeast Infection", description: "Vaginal yeast infection", iconName: "activity" },
  { name: "UTI Symptoms", description: "Urinary tract infection symptoms", iconName: "droplets" },
  
  // Circulatory
  { name: "Cold Hands and Feet", description: "Poor circulation in extremities", iconName: "snowflake" },
  { name: "Leg Cramps", description: "Muscle cramps in legs", iconName: "zap" },
  { name: "Varicose Veins", description: "Enlarged, twisted veins", iconName: "activity" },
  
  // Miscellaneous Common Issues
  { name: "Bad Breath", description: "Unpleasant mouth odor", iconName: "wind" },
  { name: "Dandruff", description: "Flaky scalp condition", iconName: "activity" },
  { name: "Excessive Sweating", description: "Abnormal amount of sweating", iconName: "droplets" },
  { name: "Dizziness", description: "Feeling lightheaded or unsteady", iconName: "rotate-cw", isCommon: true },
  { name: "Vertigo", description: "Spinning sensation", iconName: "rotate-cw" },
  { name: "Tinnitus", description: "Ringing in the ears", iconName: "volume-2" },
  { name: "Hiccups", description: "Involuntary spasms of the diaphragm", iconName: "activity" },
  { name: "Snoring", description: "Loud breathing during sleep", iconName: "volume-2" },
  { name: "Cold Sores", description: "Viral infection causing lip sores", iconName: "activity" },
  { name: "Canker Sores", description: "Painful mouth ulcers", iconName: "circle" },
];

// Comprehensive medication data
const medications: InsertMedication[] = [
  // Pain Relief & Anti-inflammatory
  {
    brandName: "Tylenol",
    genericName: "Acetaminophen",
    category: "otc",
    description: "Pain reliever and fever reducer that's gentle on the stomach",
    uses: "Headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers",
    dosage: "Adults: 650-1000mg every 4-6 hours, maximum 4000mg in 24 hours. Children: consult packaging for weight-based dosing",
    precautions: "Do not exceed recommended dose. Avoid alcohol consumption. Consult doctor if pregnant or breastfeeding",
    interactions: "May interact with warfarin and other blood thinners. Avoid with other acetaminophen-containing products",
    sideEffects: "Rare at recommended doses. Overdose can cause liver damage. Allergic reactions possible but uncommon",
    price: "8.99"
  },
  {
    brandName: "Advil",
    genericName: "Ibuprofen",
    category: "otc",
    description: "Nonsteroidal anti-inflammatory drug (NSAID) that reduces pain, fever, and inflammation",
    uses: "Headaches, dental pain, menstrual cramps, muscle aches, arthritis, minor injuries, fever",
    dosage: "Adults: 200-400mg every 4-6 hours, maximum 1200mg in 24 hours. Take with food or milk",
    precautions: "Not recommended during pregnancy (especially 3rd trimester). Avoid if allergic to aspirin. Use cautiously with heart/kidney disease",
    interactions: "May interact with blood thinners, aspirin, ACE inhibitors, lithium, and methotrexate",
    sideEffects: "Stomach upset, heartburn, dizziness, headache. Rare: stomach bleeding, kidney problems",
    price: "7.49"
  },
  {
    brandName: "Aleve",
    genericName: "Naproxen Sodium",
    category: "otc",
    description: "Long-lasting NSAID for all-day pain relief",
    uses: "Arthritis, back pain, menstrual cramps, headaches, muscle aches, toothaches",
    dosage: "Adults: 220mg every 8-12 hours, maximum 660mg in 24 hours. Take with food",
    precautions: "Similar to ibuprofen. Not for children under 12. Avoid during pregnancy",
    interactions: "Similar to other NSAIDs. Monitor blood pressure if taking BP medications",
    sideEffects: "Similar to ibuprofen but may last longer due to longer half-life",
    price: "9.99"
  },
  {
    brandName: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    category: "otc",
    description: "Pain reliever, fever reducer, and blood thinner",
    uses: "Headaches, muscle pain, toothaches, fever, arthritis, heart attack prevention (low dose)",
    dosage: "Adults: 325-650mg every 4 hours for pain. 81mg daily for heart protection (consult doctor)",
    precautions: "Not for children under 16 due to Reye's syndrome risk. Avoid before surgery",
    interactions: "Enhances blood thinners. May interact with diabetes medications",
    sideEffects: "Stomach irritation, heartburn, increased bleeding risk, ringing in ears (high doses)",
    price: "4.99"
  },

  // Cold & Flu
  {
    brandName: "Dayquil",
    genericName: "Acetaminophen/Dextromethorphan/Phenylephrine",
    category: "otc",
    description: "Multi-symptom cold and flu relief for daytime use",
    uses: "Cold and flu symptoms including aches, fever, cough, and nasal congestion",
    dosage: "Adults: 30ml every 4 hours, maximum 4 doses in 24 hours",
    precautions: "Do not exceed recommended dose. Avoid alcohol. Don't use with other acetaminophen products",
    interactions: "MAO inhibitors, blood pressure medications, antidepressants",
    sideEffects: "Drowsiness, dizziness, nausea, nervousness, trouble sleeping",
    price: "12.99"
  },
  {
    brandName: "Nyquil",
    genericName: "Acetaminophen/Dextromethorphan/Doxylamine",
    category: "otc",
    description: "Nighttime cold and flu relief with sleep aid",
    uses: "Cold and flu symptoms with help falling asleep",
    dosage: "Adults: 30ml every 6 hours before bedtime, maximum 4 doses in 24 hours",
    precautions: "Causes drowsiness. Don't drive or operate machinery. Avoid alcohol",
    interactions: "Sleep aids, anxiety medications, muscle relaxants, MAO inhibitors",
    sideEffects: "Drowsiness, dizziness, blurred vision, dry mouth, nausea",
    price: "12.99"
  },
  {
    brandName: "Robitussin DM",
    genericName: "Dextromethorphan/Guaifenesin",
    category: "otc",
    description: "Cough suppressant and expectorant",
    uses: "Cough due to minor throat and bronchial irritation, helps loosen mucus",
    dosage: "Adults: 10-20ml every 4 hours, maximum 6 doses in 24 hours",
    precautions: "Don't use for persistent cough from smoking or asthma. Consult doctor for chronic cough",
    interactions: "MAO inhibitors, fluoxetine, quinidine",
    sideEffects: "Drowsiness, dizziness, nausea, vomiting, stomach upset",
    price: "8.49"
  },
  {
    brandName: "Mucinex",
    genericName: "Guaifenesin",
    category: "otc",
    description: "Expectorant that helps loosen mucus and phlegm",
    uses: "Chest congestion, helps make coughs more productive",
    dosage: "Adults: 600-1200mg every 12 hours with plenty of water",
    precautions: "Drink plenty of fluids. Consult doctor for persistent cough",
    interactions: "Few known interactions. Safe with most medications",
    sideEffects: "Nausea, vomiting, stomach upset, dizziness, headache",
    price: "14.99"
  },
  {
    brandName: "Sudafed",
    genericName: "Pseudoephedrine",
    category: "otc",
    description: "Nasal decongestant for sinus and nasal congestion",
    uses: "Nasal congestion, sinus pressure, stuffiness due to colds or allergies",
    dosage: "Adults: 60mg every 4-6 hours, maximum 240mg in 24 hours",
    precautions: "Requires ID to purchase. May cause insomnia. Avoid with high blood pressure",
    interactions: "MAO inhibitors, blood pressure medications, antidepressants",
    sideEffects: "Restlessness, nervousness, trouble sleeping, increased heart rate",
    price: "11.99"
  },

  // Allergy Relief
  {
    brandName: "Benadryl",
    genericName: "Diphenhydramine",
    category: "otc",
    description: "Antihistamine for allergies and sleep aid",
    uses: "Allergic reactions, hay fever, runny nose, sneezing, itching, insomnia",
    dosage: "Adults: 25-50mg every 4-6 hours, maximum 300mg in 24 hours",
    precautions: "Causes drowsiness. Don't drive. Avoid alcohol. Not for children under 2",
    interactions: "Sleep aids, alcohol, muscle relaxants, anxiety medications",
    sideEffects: "Drowsiness, dry mouth, blurred vision, constipation, urinary retention",
    price: "6.99"
  },
  {
    brandName: "Claritin",
    genericName: "Loratadine",
    category: "otc",
    description: "Non-drowsy 24-hour allergy relief",
    uses: "Seasonal allergies, hay fever, runny nose, sneezing, itchy eyes",
    dosage: "Adults and children 6+: 10mg once daily",
    precautions: "Generally non-drowsy. Consult doctor for liver or kidney disease",
    interactions: "Few interactions. May interact with certain antifungals",
    sideEffects: "Headache, fatigue, dry mouth (less common than older antihistamines)",
    price: "15.99"
  },
  {
    brandName: "Zyrtec",
    genericName: "Cetirizine",
    category: "otc",
    description: "24-hour allergy relief, may cause mild drowsiness",
    uses: "Seasonal allergies, year-round allergies, hives, itching",
    dosage: "Adults and children 6+: 10mg once daily",
    precautions: "May cause drowsiness in some people. Adjust dose for kidney problems",
    interactions: "Alcohol may increase drowsiness. Few other interactions",
    sideEffects: "Drowsiness, fatigue, dry mouth, pharyngitis",
    price: "16.99"
  },
  {
    brandName: "Allegra",
    genericName: "Fexofenadine",
    category: "otc",
    description: "Non-drowsy 24-hour allergy relief",
    uses: "Seasonal allergies, hay fever, chronic hives",
    dosage: "Adults and children 12+: 180mg once daily or 60mg twice daily",
    precautions: "Take on empty stomach. Don't take with fruit juices",
    interactions: "Antacids may reduce absorption. Few other interactions",
    sideEffects: "Headache, back pain, cough, fever (uncommon)",
    price: "18.99"
  },

  // Digestive Health
  {
    brandName: "Pepto-Bismol",
    genericName: "Bismuth Subsalicylate",
    category: "otc",
    description: "Multi-symptom stomach relief",
    uses: "Nausea, heartburn, indigestion, upset stomach, diarrhea",
    dosage: "Adults: 30ml or 2 tablets every 30-60 minutes, maximum 8 doses in 24 hours",
    precautions: "Don't use with aspirin allergy. May turn stool black temporarily",
    interactions: "May affect absorption of some antibiotics and diabetes medications",
    sideEffects: "Black tongue/stool (temporary), constipation, ringing in ears",
    price: "7.99"
  },
  {
    brandName: "Tums",
    genericName: "Calcium Carbonate",
    category: "otc",
    description: "Antacid for heartburn and acid indigestion",
    uses: "Heartburn, acid indigestion, sour stomach, calcium supplement",
    dosage: "Adults: 2-4 tablets as needed, maximum 15 tablets in 24 hours",
    precautions: "Don't exceed recommended dose. May cause kidney stones with overuse",
    interactions: "May reduce absorption of some antibiotics and iron",
    sideEffects: "Constipation, gas, nausea (with overuse)",
    price: "5.99"
  },
  {
    brandName: "Mylanta",
    genericName: "Aluminum/Magnesium Hydroxide/Simethicone",
    category: "otc",
    description: "Antacid and anti-gas medication",
    uses: "Heartburn, acid indigestion, gas, bloating",
    dosage: "Adults: 2-4 teaspoons between meals and bedtime",
    precautions: "Don't use for more than 2 weeks without consulting doctor",
    interactions: "May affect absorption of many medications. Take 2 hours apart",
    sideEffects: "Diarrhea (magnesium), constipation (aluminum), nausea",
    price: "8.49"
  },
  {
    brandName: "Imodium A-D",
    genericName: "Loperamide",
    category: "otc",
    description: "Anti-diarrheal medication",
    uses: "Diarrhea, including traveler's diarrhea",
    dosage: "Adults: 4mg initially, then 2mg after each loose stool, maximum 8mg in 24 hours",
    precautions: "Don't use for more than 2 days. Stop if fever develops",
    interactions: "May interact with certain antibiotics and antifungals",
    sideEffects: "Constipation, dizziness, drowsiness, nausea",
    price: "9.99"
  },
  {
    brandName: "Miralax",
    genericName: "Polyethylene Glycol 3350",
    category: "otc",
    description: "Osmotic laxative for occasional constipation",
    uses: "Occasional constipation, irregular bowel movements",
    dosage: "Adults: 17g (1 capful) dissolved in 4-8 oz of beverage once daily",
    precautions: "Don't use for more than 1 week. Increase fluid intake",
    interactions: "Few interactions. May affect absorption of some medications",
    sideEffects: "Bloating, cramping, gas, nausea",
    price: "12.99"
  },

  // Sleep Aids
  {
    brandName: "Melatonin",
    genericName: "Melatonin",
    category: "otc",
    description: "Natural sleep hormone supplement",
    uses: "Insomnia, jet lag, sleep disorders, establishing sleep cycle",
    dosage: "Adults: 0.5-3mg taken 30 minutes before desired bedtime",
    precautions: "May cause drowsiness next day. Start with lowest dose",
    interactions: "Blood thinners, immunosuppressants, diabetes medications",
    sideEffects: "Daytime drowsiness, headache, dizziness, nausea",
    price: "11.99"
  },
  {
    brandName: "ZzzQuil",
    genericName: "Diphenhydramine",
    category: "otc",
    description: "Non-habit forming sleep aid",
    uses: "Occasional sleeplessness, trouble falling asleep",
    dosage: "Adults: 50mg (2 softgels) at bedtime if needed",
    precautions: "For occasional use only. Don't use with alcohol",
    interactions: "Similar to Benadryl - other sedating medications",
    sideEffects: "Next-day drowsiness, dry mouth, dizziness, constipation",
    price: "8.99"
  },

  // Topical Treatments
  {
    brandName: "Neosporin",
    genericName: "Neomycin/Polymyxin B/Bacitracin",
    category: "otc",
    description: "Antibiotic ointment for minor cuts and scrapes",
    uses: "Prevention of infection in minor cuts, scrapes, burns",
    dosage: "Apply small amount to affected area 1-3 times daily",
    precautions: "For external use only. Don't use on large areas or deep wounds",
    interactions: "Few topical interactions",
    sideEffects: "Skin irritation, rash, allergic reactions (rare)",
    price: "6.49"
  },
  {
    brandName: "Hydrocortisone Cream",
    genericName: "Hydrocortisone",
    category: "otc",
    description: "Topical corticosteroid for itching and inflammation",
    uses: "Eczema, dermatitis, insect bites, poison ivy, minor skin irritations",
    dosage: "Apply thin layer to affected area 2-4 times daily",
    precautions: "Don't use on face or groin for more than 2 weeks. Not for children under 2",
    interactions: "Few interactions with topical use",
    sideEffects: "Skin thinning with prolonged use, burning, itching",
    price: "7.99"
  },
  {
    brandName: "Calamine Lotion",
    genericName: "Calamine",
    category: "otc",
    description: "Topical anti-itch and drying agent",
    uses: "Poison ivy, poison oak, insect bites, chicken pox, minor skin irritations",
    dosage: "Shake well, apply to affected area as needed",
    precautions: "For external use only. Avoid eyes and mucous membranes",
    interactions: "None known",
    sideEffects: "Skin dryness, mild irritation (rare)",
    price: "4.99"
  },

  // Eye Care
  {
    brandName: "Visine",
    genericName: "Tetrahydrozoline",
    category: "otc",
    description: "Eye drops for red, irritated eyes",
    uses: "Red eyes due to minor irritation, dryness, allergies",
    dosage: "1-2 drops in affected eye(s) up to 4 times daily",
    precautions: "Don't use for more than 3 days. Remove contact lenses before use",
    interactions: "Few interactions",
    sideEffects: "Brief stinging, increased redness with overuse",
    price: "5.99"
  },
  {
    brandName: "Systane",
    genericName: "Polyethylene Glycol/Propylene Glycol",
    category: "otc",
    description: "Lubricating eye drops for dry eyes",
    uses: "Dry eyes, eye discomfort from environmental factors",
    dosage: "1-2 drops in each eye as needed throughout the day",
    precautions: "Remove contact lenses before use, wait 15 minutes before reinserting",
    interactions: "None known",
    sideEffects: "Temporary blurred vision, mild eye irritation",
    price: "12.99"
  },

  // Women's Health
  {
    brandName: "Midol",
    genericName: "Acetaminophen/Caffeine/Pyrilamine",
    category: "otc",
    description: "Multi-symptom menstrual relief",
    uses: "Menstrual cramps, bloating, water weight gain, fatigue",
    dosage: "Adults: 2 caplets every 6 hours, maximum 6 caplets in 24 hours",
    precautions: "Contains caffeine. Don't exceed recommended dose",
    interactions: "Other acetaminophen products, blood thinners",
    sideEffects: "Nervousness, trouble sleeping, stomach upset",
    price: "9.99"
  },
  {
    brandName: "Monistat",
    genericName: "Miconazole",
    category: "otc",
    description: "Antifungal treatment for yeast infections",
    uses: "Vaginal yeast infections",
    dosage: "Insert 1 applicator or suppository vaginally at bedtime for 3-7 days",
    precautions: "Complete full course even if symptoms improve. Consult doctor if first yeast infection",
    interactions: "May weaken latex condoms and diaphragms",
    sideEffects: "Vaginal burning, itching, irritation",
    price: "15.99"
  }
];

// Define symptom-medication relationships with effectiveness ratings
const symptomMedicationRelationships = [
  // Headache treatments
  { symptomName: "Headache", medicationName: "Tylenol", effectiveness: 4 },
  { symptomName: "Headache", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Headache", medicationName: "Aleve", effectiveness: 4 },
  { symptomName: "Headache", medicationName: "Aspirin", effectiveness: 4 },
  
  { symptomName: "Migraine", medicationName: "Advil", effectiveness: 4 },
  { symptomName: "Migraine", medicationName: "Aleve", effectiveness: 4 },
  { symptomName: "Migraine", medicationName: "Aspirin", effectiveness: 3 },
  
  // Fever treatments
  { symptomName: "Fever", medicationName: "Tylenol", effectiveness: 5 },
  { symptomName: "Fever", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Fever", medicationName: "Aspirin", effectiveness: 4 },
  
  // Body aches and pain
  { symptomName: "Body Aches", medicationName: "Tylenol", effectiveness: 4 },
  { symptomName: "Body Aches", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Body Aches", medicationName: "Aleve", effectiveness: 5 },
  { symptomName: "Body Aches", medicationName: "Aspirin", effectiveness: 4 },
  
  { symptomName: "Muscle Pain", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Muscle Pain", medicationName: "Aleve", effectiveness: 5 },
  { symptomName: "Muscle Pain", medicationName: "Tylenol", effectiveness: 3 },
  
  { symptomName: "Joint Pain", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Joint Pain", medicationName: "Aleve", effectiveness: 5 },
  { symptomName: "Joint Pain", medicationName: "Aspirin", effectiveness: 4 },
  
  { symptomName: "Back Pain", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Back Pain", medicationName: "Aleve", effectiveness: 5 },
  { symptomName: "Back Pain", medicationName: "Tylenol", effectiveness: 3 },
  
  { symptomName: "Neck Pain", medicationName: "Advil", effectiveness: 4 },
  { symptomName: "Neck Pain", medicationName: "Aleve", effectiveness: 4 },
  
  { symptomName: "Arthritis", medicationName: "Advil", effectiveness: 4 },
  { symptomName: "Arthritis", medicationName: "Aleve", effectiveness: 5 },
  { symptomName: "Arthritis", medicationName: "Aspirin", effectiveness: 4 },
  
  { symptomName: "Menstrual Cramps", medicationName: "Midol", effectiveness: 5 },
  { symptomName: "Menstrual Cramps", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Menstrual Cramps", medicationName: "Aleve", effectiveness: 4 },
  
  { symptomName: "Toothache", medicationName: "Advil", effectiveness: 5 },
  { symptomName: "Toothache", medicationName: "Tylenol", effectiveness: 4 },
  
  // Cold and flu symptoms
  { symptomName: "Cough", medicationName: "Robitussin DM", effectiveness: 5 },
  { symptomName: "Cough", medicationName: "Dayquil", effectiveness: 4 },
  { symptomName: "Cough", medicationName: "Nyquil", effectiveness: 4 },
  
  { symptomName: "Chest Congestion", medicationName: "Mucinex", effectiveness: 5 },
  { symptomName: "Chest Congestion", medicationName: "Robitussin DM", effectiveness: 4 },
  
  { symptomName: "Runny Nose", medicationName: "Dayquil", effectiveness: 4 },
  { symptomName: "Runny Nose", medicationName: "Benadryl", effectiveness: 4 },
  { symptomName: "Runny Nose", medicationName: "Claritin", effectiveness: 5 },
  { symptomName: "Runny Nose", medicationName: "Zyrtec", effectiveness: 5 },
  { symptomName: "Runny Nose", medicationName: "Allegra", effectiveness: 5 },
  
  { symptomName: "Stuffy Nose", medicationName: "Sudafed", effectiveness: 5 },
  { symptomName: "Stuffy Nose", medicationName: "Dayquil", effectiveness: 4 },
  
  { symptomName: "Sore Throat", medicationName: "Tylenol", effectiveness: 4 },
  { symptomName: "Sore Throat", medicationName: "Advil", effectiveness: 4 },
  { symptomName: "Sore Throat", medicationName: "Dayquil", effectiveness: 3 },
  
  { symptomName: "Sneezing", medicationName: "Benadryl", effectiveness: 4 },
  { symptomName: "Sneezing", medicationName: "Claritin", effectiveness: 5 },
  { symptomName: "Sneezing", medicationName: "Zyrtec", effectiveness: 5 },
  { symptomName: "Sneezing", medicationName: "Allegra", effectiveness: 5 },
  
  // Allergy symptoms
  { symptomName: "Seasonal Allergies", medicationName: "Claritin", effectiveness: 5 },
  { symptomName: "Seasonal Allergies", medicationName: "Zyrtec", effectiveness: 5 },
  { symptomName: "Seasonal Allergies", medicationName: "Allegra", effectiveness: 5 },
  { symptomName: "Seasonal Allergies", medicationName: "Benadryl", effectiveness: 4 },
  
  { symptomName: "Hay Fever", medicationName: "Claritin", effectiveness: 5 },
  { symptomName: "Hay Fever", medicationName: "Zyrtec", effectiveness: 5 },
  { symptomName: "Hay Fever", medicationName: "Allegra", effectiveness: 5 },
  
  { symptomName: "Eye Irritation", medicationName: "Visine", effectiveness: 4 },
  { symptomName: "Eye Irritation", medicationName: "Benadryl", effectiveness: 3 },
  
  { symptomName: "Dry Eyes", medicationName: "Systane", effectiveness: 5 },
  
  // Digestive issues
  { symptomName: "Nausea", medicationName: "Pepto-Bismol", effectiveness: 4 },
  { symptomName: "Nausea", medicationName: "Benadryl", effectiveness: 3 },
  
  { symptomName: "Stomach Ache", medicationName: "Pepto-Bismol", effectiveness: 4 },
  { symptomName: "Stomach Ache", medicationName: "Tums", effectiveness: 3 },
  
  { symptomName: "Heartburn", medicationName: "Tums", effectiveness: 5 },
  { symptomName: "Heartburn", medicationName: "Mylanta", effectiveness: 5 },
  { symptomName: "Heartburn", medicationName: "Pepto-Bismol", effectiveness: 4 },
  
  { symptomName: "Acid Reflux", medicationName: "Tums", effectiveness: 4 },
  { symptomName: "Acid Reflux", medicationName: "Mylanta", effectiveness: 5 },
  
  { symptomName: "Indigestion", medicationName: "Pepto-Bismol", effectiveness: 5 },
  { symptomName: "Indigestion", medicationName: "Tums", effectiveness: 4 },
  { symptomName: "Indigestion", medicationName: "Mylanta", effectiveness: 4 },
  
  { symptomName: "Diarrhea", medicationName: "Imodium A-D", effectiveness: 5 },
  { symptomName: "Diarrhea", medicationName: "Pepto-Bismol", effectiveness: 4 },
  
  { symptomName: "Constipation", medicationName: "Miralax", effectiveness: 5 },
  
  { symptomName: "Bloating", medicationName: "Mylanta", effectiveness: 4 },
  { symptomName: "Bloating", medicationName: "Midol", effectiveness: 4 },
  
  { symptomName: "Gas", medicationName: "Mylanta", effectiveness: 5 },
  
  // Sleep issues
  { symptomName: "Insomnia", medicationName: "Melatonin", effectiveness: 4 },
  { symptomName: "Insomnia", medicationName: "ZzzQuil", effectiveness: 4 },
  { symptomName: "Insomnia", medicationName: "Benadryl", effectiveness: 3 },
  
  // Skin conditions
  { symptomName: "Rash", medicationName: "Hydrocortisone Cream", effectiveness: 4 },
  { symptomName: "Rash", medicationName: "Benadryl", effectiveness: 3 },
  { symptomName: "Rash", medicationName: "Calamine Lotion", effectiveness: 3 },
  
  { symptomName: "Itchy Skin", medicationName: "Hydrocortisone Cream", effectiveness: 5 },
  { symptomName: "Itchy Skin", medicationName: "Benadryl", effectiveness: 4 },
  { symptomName: "Itchy Skin", medicationName: "Calamine Lotion", effectiveness: 4 },
  
  { symptomName: "Eczema", medicationName: "Hydrocortisone Cream", effectiveness: 4 },
  
  { symptomName: "Insect Bites", medicationName: "Hydrocortisone Cream", effectiveness: 4 },
  { symptomName: "Insect Bites", medicationName: "Calamine Lotion", effectiveness: 4 },
  { symptomName: "Insect Bites", medicationName: "Benadryl", effectiveness: 3 },
  
  { symptomName: "Cuts", medicationName: "Neosporin", effectiveness: 5 },
  
  // Mental health
  { symptomName: "Anxiety", medicationName: "Benadryl", effectiveness: 2 },
  
  // Women's health
  { symptomName: "PMS", medicationName: "Midol", effectiveness: 5 },
  { symptomName: "PMS", medicationName: "Advil", effectiveness: 4 },
  
  { symptomName: "Yeast Infection", medicationName: "Monistat", effectiveness: 5 },
  
  // Fatigue
  { symptomName: "Fatigue", medicationName: "Midol", effectiveness: 3 },
  
  // Motion sickness
  { symptomName: "Motion Sickness", medicationName: "Benadryl", effectiveness: 4 },
  
  // Dizziness
  { symptomName: "Dizziness", medicationName: "Benadryl", effectiveness: 2 },
];

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Insert symptoms
    console.log("Inserting symptoms...");
    const insertedSymptoms = [];
    for (const symptom of symptoms) {
      try {
        const result = await storage.createSymptom(symptom);
        insertedSymptoms.push(result);
        console.log(`✓ Inserted symptom: ${symptom.name}`);
      } catch (error) {
        console.log(`○ Symptom already exists: ${symptom.name}`);
      }
    }
    
    // Insert medications
    console.log("Inserting medications...");
    const insertedMedications = [];
    for (const medication of medications) {
      try {
        const result = await storage.createMedication(medication);
        insertedMedications.push(result);
        console.log(`✓ Inserted medication: ${medication.brandName}`);
      } catch (error) {
        console.log(`○ Medication already exists: ${medication.brandName}`);
      }
    }
    
    // Get all symptoms and medications for relationship mapping
    const allSymptoms = await storage.getSymptoms();
    const allMedications = await storage.getMedications();
    
    // Insert symptom-medication relationships
    console.log("Creating symptom-medication relationships...");
    for (const relationship of symptomMedicationRelationships) {
      const symptom = allSymptoms.find(s => s.name === relationship.symptomName);
      const medication = allMedications.find(m => m.brandName === relationship.medicationName);
      
      if (symptom && medication) {
        try {
          await storage.createMedicationSymptom({
            medicationId: medication.id,
            symptomId: symptom.id,
            effectiveness: relationship.effectiveness
          });
          console.log(`✓ Linked ${symptom.name} -> ${medication.brandName} (effectiveness: ${relationship.effectiveness})`);
        } catch (error) {
          console.log(`○ Relationship already exists: ${symptom.name} -> ${medication.brandName}`);
        }
      } else {
        console.log(`✗ Could not find symptom "${relationship.symptomName}" or medication "${relationship.medicationName}"`);
      }
    }
    
    console.log("Database seeding completed successfully!");
    
    // Print summary
    const finalSymptoms = await storage.getSymptoms();
    const finalMedications = await storage.getMedications();
    console.log(`\nSummary:`);
    console.log(`- Total symptoms: ${finalSymptoms.length}`);
    console.log(`- Total medications: ${finalMedications.length}`);
    console.log(`- Total relationships: ${symptomMedicationRelationships.length}`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Export data for use in other files
export { symptoms, medications, symptomMedicationRelationships };
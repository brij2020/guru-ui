// /utils/testData.ts
export interface TestQuestion {
  id?: string; // Add ID for MyCourses
  type: 'coding' | 'mcq' | 'theory' | 'output' | 'scenario';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  section?: string;
  topic?: string;
  groupType?: 'none' | 'rc_passage' | string;
  groupId?: string;
  groupTitle?: string;
  passageText?: string;
  groupOrder?: number | null;
  hasVisual?: boolean;
  assets?: Array<{
    kind?: 'image' | 'chart_image' | 'diagram_image' | 'table_image' | 'chart_data' | string;
    url?: string;
    alt?: string;
    width?: number | null;
    height?: number | null;
    caption?: string;
    sourcePage?: number | null;
    data?: Record<string, unknown> | null;
  }>;
  options?: string[];
  answer?: string;
  correct?: number; // For MyCourses MCQ questions
  explanation?: string;
  inputOutput?: string;
  solutionApproach?: string;
  sampleSolution?: string;
  complexity?: string;
  code?: string;
  expectedOutput?: string;
  idealSolution?: string;
  keyConsiderations?: string[];
}

export interface Test {
  id: string;
  title: string;
  desc: string;
  domain: string;
  img: string;
  totalQuestions: number;
  duration: number;
  questions: TestQuestion[];
}

// Cardiac Medicine Tests for MyCourses
export const cardiacTests: Test[] = [
  {
    id: "t1",
    title: "Heart Anatomy Quiz",
    desc: "Comprehensive heart anatomy assessment",
    domain: "Cardiology",
    img: "/images/cardiology.jpg",
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        id: "t1_q1",
        type: "mcq",
        difficulty: "easy",
        question: "Which chamber receives oxygenated blood from lungs?",
        options: ["Right atrium", "Left atrium", "Right ventricle", "Left ventricle"],
        correct: 1,
        explanation: "The left atrium receives oxygenated blood from the lungs via the pulmonary veins."
      },
      {
        id: "t1_q2",
        type: "mcq",
        difficulty: "easy",
        question: "Mitral valve prevents backflow from:",
        options: ["Aorta to LV", "PA to RV", "LA to LV", "RA to RV"],
        correct: 2,
        explanation: "The mitral valve prevents backflow of blood from the left ventricle to the left atrium during ventricular contraction."
      },
      {
        id: "t1_q3",
        type: "mcq",
        difficulty: "medium",
        question: "Pulmonary artery carries:",
        options: ["Oxygenated blood to body", "Deoxygenated blood to lungs", "Oxygenated blood to lungs", "Deoxygenated blood to heart"],
        correct: 1,
        explanation: "The pulmonary artery carries deoxygenated blood from the right ventricle to the lungs for oxygenation."
      },
      {
        id: "t1_q4",
        type: "mcq",
        difficulty: "easy",
        question: "Which is NOT a heart valve?",
        options: ["Mitral", "Tricuspid", "Pulmonary", "Carotid"],
        correct: 3,
        explanation: "Carotid is an artery, not a heart valve. The four heart valves are: mitral, tricuspid, pulmonary, and aortic."
      },
      {
        id: "t1_q5",
        type: "mcq",
        difficulty: "medium",
        question: "SA node is located in:",
        options: ["Left atrium", "Right atrium", "Left ventricle", "Right ventricle"],
        correct: 1,
        explanation: "The sinoatrial (SA) node is located in the right atrium near the opening of the superior vena cava."
      },
      {
        id: "t1_q6",
        type: "mcq",
        difficulty: "medium",
        question: "Blood supply to heart muscle is via:",
        options: ["Pulmonary arteries", "Coronary arteries", "Aorta", "Vena cava"],
        correct: 1,
        explanation: "The coronary arteries supply oxygenated blood to the heart muscle itself."
      },
      {
        id: "t1_q7",
        type: "mcq",
        difficulty: "medium",
        question: "Which chamber has thickest wall?",
        options: ["Right atrium", "Left atrium", "Right ventricle", "Left ventricle"],
        correct: 3,
        explanation: "The left ventricle has the thickest wall because it pumps blood to the entire body against systemic resistance."
      },
      {
        id: "t1_q8",
        type: "mcq",
        difficulty: "easy",
        question: "Tricuspid valve has how many leaflets?",
        options: ["2", "3", "4", "1"],
        correct: 1,
        explanation: "The tricuspid valve has three leaflets, as suggested by its name 'tri' meaning three."
      },
      {
        id: "t1_q9",
        type: "mcq",
        difficulty: "easy",
        question: "Which vessel carries blood from heart to body?",
        options: ["Pulmonary artery", "Aorta", "Superior vena cava", "Pulmonary vein"],
        correct: 1,
        explanation: "The aorta is the main artery that carries oxygenated blood from the left ventricle to the body."
      },
      {
        id: "t1_q10",
        type: "mcq",
        difficulty: "easy",
        question: "Pericardium function is:",
        options: ["Contraction", "Protection", "Electrical conduction", "Blood filtration"],
        correct: 1,
        explanation: "The pericardium is a protective sac that surrounds the heart, providing protection and preventing overfilling."
      }
    ]
  },
  {
    id: "t2",
    title: "Anatomy MCQ",
    desc: "Detailed cardiac anatomy multiple choice questions",
    domain: "Cardiology",
    img: "/images/cardiology.jpg",
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        id: "t2_q1",
        type: "mcq",
        difficulty: "easy",
        question: "Heart is located in:",
        options: ["Abdominal cavity", "Thoracic cavity", "Pelvic cavity", "Cranial cavity"],
        correct: 1,
        explanation: "The heart is located in the thoracic cavity, specifically in the mediastinum."
      },
      {
        id: "t2_q2",
        type: "mcq",
        difficulty: "easy",
        question: "Myocardium is responsible for:",
        options: ["Protection", "Contraction", "Lubrication", "Electrical conduction"],
        correct: 1,
        explanation: "The myocardium is the muscular middle layer responsible for the heart's pumping action."
      },
      {
        id: "t2_q3",
        type: "mcq",
        difficulty: "medium",
        question: "Endocardium lines:",
        options: ["Outer surface", "Heart chambers", "Pericardial sac", "Coronary vessels"],
        correct: 1,
        explanation: "The endocardium is the innermost layer that lines the heart chambers and valves."
      },
      {
        id: "t2_q4",
        type: "mcq",
        difficulty: "medium",
        question: "Normal heart weight in adults:",
        options: ["100-150g", "200-250g", "300-350g", "400-450g"],
        correct: 2,
        explanation: "The average adult heart weighs 200-250g in females and 250-300g in males."
      },
      {
        id: "t2_q5",
        type: "mcq",
        difficulty: "medium",
        question: "Base of heart is formed by:",
        options: ["Atria", "Ventricles", "Apex", "Valves"],
        correct: 0,
        explanation: "The base of the heart is formed primarily by the left atrium, with parts of the right atrium."
      },
      {
        id: "t2_q6",
        type: "mcq",
        difficulty: "easy",
        question: "Apex beat is felt at:",
        options: ["2nd left ICS", "5th left ICS", "2nd right ICS", "5th right ICS"],
        correct: 1,
        explanation: "The apex beat is normally palpable in the 5th left intercostal space, midclavicular line."
      },
      {
        id: "t2_q7",
        type: "mcq",
        difficulty: "hard",
        question: "Which is NOT part of cardiac skeleton?",
        options: ["Fibrous rings", "Tendon of Todaro", "Membranous septum", "Papillary muscles"],
        correct: 3,
        explanation: "Papillary muscles are muscular structures, not part of the fibrous cardiac skeleton."
      },
      {
        id: "t2_q8",
        type: "mcq",
        difficulty: "medium",
        question: "Coronary sinus opens into:",
        options: ["Right atrium", "Left atrium", "Right ventricle", "Left ventricle"],
        correct: 0,
        explanation: "The coronary sinus, which drains most cardiac veins, opens into the right atrium."
      },
      {
        id: "t2_q9",
        type: "mcq",
        difficulty: "hard",
        question: "Thebesian valves are in:",
        options: ["Coronary sinus", "IVC", "SVC", "Pulmonary veins"],
        correct: 0,
        explanation: "The Thebesian valve guards the orifice of the coronary sinus in the right atrium."
      },
      {
        id: "t2_q10",
        type: "mcq",
        difficulty: "medium",
        question: "Chordae tendineae connect:",
        options: ["Atria to ventricles", "Valves to papillary muscles", "Ventricles to arteries", "Atria to veins"],
        correct: 1,
        explanation: "Chordae tendineae are tendinous cords that connect the atrioventricular valves to the papillary muscles."
      }
    ]
  },
  {
    id: "t3",
    title: "ECG Pattern Test",
    desc: "Electrocardiogram interpretation and patterns",
    domain: "Cardiology",
    img: "/images/ECG.jpeg",
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        id: "t3_q1",
        type: "mcq",
        difficulty: "medium",
        question: "QRS complex represents:",
        options: ["Atrial depolarization", "Ventricular depolarization", "Atrial repolarization", "Ventricular repolarization"],
        correct: 1,
        explanation: "The QRS complex represents ventricular depolarization (contraction)."
      },
      {
        id: "t3_q2",
        type: "mcq",
        difficulty: "easy",
        question: "Normal PR interval duration:",
        options: ["0.06-0.10s", "0.12-0.20s", "0.20-0.30s", "0.30-0.40s"],
        correct: 1,
        explanation: "The normal PR interval is 0.12-0.20 seconds (3-5 small boxes on ECG paper)."
      },
      {
        id: "t3_q3",
        type: "mcq",
        difficulty: "easy",
        question: "P wave represents:",
        options: ["Atrial depolarization", "Ventricular depolarization", "Atrial repolarization", "Ventricular repolarization"],
        correct: 0,
        explanation: "The P wave represents atrial depolarization (contraction)."
      },
      {
        id: "t3_q4",
        type: "mcq",
        difficulty: "medium",
        question: "QT interval represents:",
        options: ["Atrial activity", "Ventricular depolarization & repolarization", "Conduction delay", "SA node firing"],
        correct: 1,
        explanation: "The QT interval represents the total time for ventricular depolarization and repolarization."
      },
      {
        id: "t3_q5",
        type: "mcq",
        difficulty: "easy",
        question: "Normal QRS duration:",
        options: ["<0.12s", "0.12-0.20s", "0.20-0.30s", ">0.30s"],
        correct: 0,
        explanation: "Normal QRS duration is less than 0.12 seconds (3 small boxes)."
      },
      {
        id: "t3_q6",
        type: "mcq",
        difficulty: "medium",
        question: "ST segment elevation indicates:",
        options: ["Hypokalemia", "Hyperkalemia", "Myocardial ischemia", "Atrial enlargement"],
        correct: 2,
        explanation: "ST segment elevation is a hallmark of acute myocardial infarction/ischemia."
      },
      {
        id: "t3_q7",
        type: "mcq",
        difficulty: "medium",
        question: "Lead II shows:",
        options: ["Right arm to left leg", "Left arm to left leg", "Right arm to left arm", "Chest to left leg"],
        correct: 0,
        explanation: "Lead II records the electrical difference between the right arm (negative) and left leg (positive)."
      },
      {
        id: "t3_q8",
        type: "mcq",
        difficulty: "easy",
        question: "Normal heart rate in ECG:",
        options: ["60-100 bpm", "100-120 bpm", "40-60 bpm", "120-140 bpm"],
        correct: 0,
        explanation: "Normal sinus rhythm has a heart rate of 60-100 beats per minute."
      },
      {
        id: "t3_q9",
        type: "mcq",
        difficulty: "hard",
        question: "U wave is seen in:",
        options: ["Hypercalcemia", "Hypokalemia", "Hypernatremia", "Hypomagnesemia"],
        correct: 1,
        explanation: "Prominent U waves are commonly seen in hypokalemia."
      },
      {
        id: "t3_q10",
        type: "mcq",
        difficulty: "medium",
        question: "Which lead is bipolar?",
        options: ["V1", "V2", "Lead I", "aVR"],
        correct: 2,
        explanation: "Lead I is a bipolar limb lead. V leads and augmented leads are unipolar."
      }
    ]
  },
  {
    id: "t4",
    title: "Pharma Quiz",
    desc: "Cardiac pharmacology knowledge assessment",
    domain: "Cardiology",
    img: "/images/pharma.jpg",
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        id: "t4_q1",
        type: "mcq",
        difficulty: "medium",
        question: "First-line hypertension drug:",
        options: ["Warfarin", "Digoxin", "Lisinopril", "Metformin"],
        correct: 2,
        explanation: "ACE inhibitors like Lisinopril are first-line for hypertension, especially with comorbidities."
      },
      {
        id: "t4_q2",
        type: "mcq",
        difficulty: "medium",
        question: "Beta-blockers mechanism:",
        options: ["Block calcium channels", "Inhibit ACE", "Block beta-receptors", "Increase potassium"],
        correct: 2,
        explanation: "Beta-blockers work by blocking beta-adrenergic receptors, reducing heart rate and contractility."
      },
      {
        id: "t4_q3",
        type: "mcq",
        difficulty: "easy",
        question: "Aspirin dose for MI:",
        options: ["75mg", "150mg", "300mg", "600mg"],
        correct: 2,
        explanation: "For acute MI, 300mg aspirin is given as loading dose for rapid antiplatelet effect."
      },
      {
        id: "t4_q4",
        type: "mcq",
        difficulty: "easy",
        question: "Statins reduce:",
        options: ["Blood pressure", "Cholesterol", "Blood sugar", "Heart rate"],
        correct: 1,
        explanation: "Statins inhibit HMG-CoA reductase, reducing cholesterol synthesis in the liver."
      },
      {
        id: "t4_q5",
        type: "mcq",
        difficulty: "easy",
        question: "Nitroglycerin is for:",
        options: ["Hypertension", "Angina", "Arrhythmia", "Heart failure"],
        correct: 1,
        explanation: "Nitroglycerin is a vasodilator used for acute angina attacks."
      },
      {
        id: "t4_q6",
        type: "mcq",
        difficulty: "medium",
        question: "Warfarin antidote:",
        options: ["Vitamin K", "Protamine", "Naloxone", "Flumazenil"],
        correct: 0,
        explanation: "Vitamin K is the antidote for warfarin overdose."
      },
      {
        id: "t4_q7",
        type: "mcq",
        difficulty: "medium",
        question: "Amiodarone is used for:",
        options: ["Hypertension", "Arrhythmia", "Angina", "Heart failure"],
        correct: 1,
        explanation: "Amiodarone is a class III antiarrhythmic used for various cardiac arrhythmias."
      },
      {
        id: "t4_q8",
        type: "mcq",
        difficulty: "medium",
        question: "Digoxin toxicity symptom:",
        options: ["Tachycardia", "Bradycardia", "Hypertension", "Hyperglycemia"],
        correct: 1,
        explanation: "Digoxin toxicity commonly causes bradycardia and various arrhythmias."
      },
      {
        id: "t4_q9",
        type: "mcq",
        difficulty: "easy",
        question: "Heparin antidote:",
        options: ["Vitamin K", "Protamine", "Naloxone", "Flumazenil"],
        correct: 1,
        explanation: "Protamine sulfate is the antidote for heparin."
      },
      {
        id: "t4_q10",
        type: "mcq",
        difficulty: "easy",
        question: "Furosemide is a:",
        options: ["Beta-blocker", "Diuretic", "ACE inhibitor", "Calcium blocker"],
        correct: 1,
        explanation: "Furosemide is a loop diuretic used for edema and heart failure."
      }
    ]
  },
  {
    id: "t5",
    title: "Intervention Quiz",
    desc: "Cardiac interventions and procedures knowledge",
    domain: "Cardiology",
    img: "/images/inter.png",
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        id: "t5_q1",
        type: "mcq",
        difficulty: "easy",
        question: "PCI stands for:",
        options: ["Primary Cardiac Intervention", "Percutaneous Coronary Intervention", "Preventive Cardiac Investigation", "Post-Cardiac Infarction"],
        correct: 1,
        explanation: "PCI stands for Percutaneous Coronary Intervention, commonly known as angioplasty with stenting."
      },
      {
        id: "t5_q2",
        type: "mcq",
        difficulty: "medium",
        question: "Most common artery in MI:",
        options: ["Right coronary", "Left anterior descending", "Circumflex", "Posterior descending"],
        correct: 1,
        explanation: "The left anterior descending (LAD) artery is most commonly involved in myocardial infarction."
      },
      {
        id: "t5_q3",
        type: "mcq",
        difficulty: "easy",
        question: "CABG means:",
        options: ["Coronary Angiography Bypass Graft", "Coronary Artery Bypass Graft", "Cardiac Artery Bypass Graft", "Coronary Aortic Bypass Graft"],
        correct: 1,
        explanation: "CABG stands for Coronary Artery Bypass Graft surgery."
      },
      {
        id: "t5_q4",
        type: "mcq",
        difficulty: "medium",
        question: "STEMI treatment window:",
        options: ["30 minutes", "60 minutes", "90 minutes", "120 minutes"],
        correct: 2,
        explanation: "Door-to-balloon time for STEMI should be less than 90 minutes for optimal outcomes."
      },
      {
        id: "t5_q5",
        type: "mcq",
        difficulty: "hard",
        question: "Balloon angioplasty was invented by:",
        options: ["Andreas Gruentzig", "Werner Forssmann", "Christian Barnard", "Michael DeBakey"],
        correct: 0,
        explanation: "Andreas Gruentzig performed the first coronary balloon angioplasty in 1977."
      },
      {
        id: "t5_q6",
        type: "mcq",
        difficulty: "medium",
        question: "Drug-eluting stents prevent:",
        options: ["Infection", "Restenosis", "Bleeding", "Arrhythmia"],
        correct: 1,
        explanation: "Drug-eluting stents release medication to prevent restenosis (re-narrowing) of the artery."
      },
      {
        id: "t5_q7",
        type: "mcq",
        difficulty: "hard",
        question: "IVUS is used for:",
        options: ["Pressure measurement", "Imaging vessel wall", "Blood flow measurement", "Electrical activity"],
        correct: 1,
        explanation: "IVUS (Intravascular Ultrasound) provides detailed imaging of vessel wall morphology."
      },
      {
        id: "t5_q8",
        type: "mcq",
        difficulty: "medium",
        question: "Which is NOT an access site for PCI?",
        options: ["Femoral artery", "Radial artery", "Brachial artery", "Jugular vein"],
        correct: 3,
        explanation: "PCI is typically performed via arterial access (femoral, radial, or brachial), not venous."
      },
      {
        id: "t5_q9",
        type: "mcq",
        difficulty: "medium",
        question: "TIMI flow grade 3 means:",
        options: ["No flow", "Slow flow", "Normal flow", "Complete blockage"],
        correct: 2,
        explanation: "TIMI 3 flow indicates normal perfusion with contrast filling the distal vessel completely."
      },
      {
        id: "t5_q10",
        type: "mcq",
        difficulty: "medium",
        question: "Contrast-induced nephropathy risk factor:",
        options: ["Young age", "Normal renal function", "Diabetes", "Low dose contrast"],
        correct: 2,
        explanation: "Diabetes is a major risk factor for contrast-induced nephropathy, especially with pre-existing renal impairment."
      }
    ]
  }
];

// Medical Test Data based on your JSON structure
export const doctorTests: Test[] = [
   {
    id: "dentist-mock",
    title: "Dentist Mock Test",
    desc: "Comprehensive dentistry knowledge assessment",
    domain: "Dentist",
    img: "/images/dentist.jpg",
    totalQuestions: 15,
    duration: 30,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "What is the primary cause of dental caries?",
        options: [
          "Bacteria and sugar interaction",
          "Vitamin deficiency", 
          "Genetic factors",
          "Hard brushing"
        ],
        answer: "Bacteria and sugar interaction",
        explanation: "Dental caries are primarily caused by bacteria in dental plaque metabolizing sugars and producing acids that demineralize tooth enamel."
      },
      {
        type: "mcq",
        difficulty: "medium",
        question: "Which tooth is most commonly affected by periodontal disease?",
        options: [
          "Incisors",
          "Canines", 
          "Premolars",
          "First molars"
        ],
        answer: "First molars",
        explanation: "First molars are most commonly affected due to their early eruption and complex anatomy making them more susceptible to plaque accumulation."
      },
      {
        type: "theory",
        difficulty: "medium",
        question: "Explain the procedure and importance of root canal treatment.",
        answer: "Root canal treatment involves:\n1. Removal of infected pulp tissue from the pulp chamber and root canals\n2. Cleaning and shaping of the root canal system\n3. Disinfection using irrigants\n4. Obturation with gutta-percha\n\nImportance:\n- Preserves natural tooth\n- Prevents spread of infection\n- Eliminates pain\n- Maintains jaw bone integrity"
      },
      {
        type: "scenario",
        difficulty: "hard",
        question: "A 45-year-old patient presents with severe tooth pain, swelling, and fever. Radiograph shows periapical radiolucency. What is your diagnosis and treatment plan?",
        idealSolution: "Diagnosis: Acute apical abscess with systemic involvement.\n\nTreatment Plan:\n1. Emergency management: Incision and drainage if fluctuant swelling exists\n2. Antibiotic therapy (Amoxicillin 500mg TDS for 5 days)\n3. Analgesics for pain management\n4. Root canal treatment or extraction based on tooth restorability\n5. Follow-up after 48 hours",
        keyConsiderations: [
          "Assess systemic involvement and need for hospitalization",
          "Evaluate tooth restorability before deciding RCT vs extraction",
          "Consider patient's medical history for antibiotic selection",
          "Monitor for spread of infection to fascial spaces"
        ]
      },
      {
        type: "mcq",
        difficulty: "easy",
        question: "What is the recommended fluoride concentration in toothpaste for adults?",
        options: [
          "250-500 ppm",
          "1000-1500 ppm", 
          "2000-2500 ppm",
          "5000+ ppm"
        ],
        answer: "1000-1500 ppm",
        explanation: "1000-1500 ppm fluoride is recommended for effective caries prevention in adults while being safe for daily use."
      }
    ]
  },
  {
    id: "gynecologist-mock",
    title: "Gynecologist Mock Test", 
    desc: "Gynecology and obstetrics knowledge evaluation",
    domain: "Gynecologist",
    img: "/images/gynecology.jpg",
    totalQuestions: 12,
    duration: 25,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "What is the normal duration of a menstrual cycle?",
        options: [
          "21-35 days",
          "14-21 days",
          "35-42 days", 
          "42-50 days"
        ],
        answer: "21-35 days",
        explanation: "A normal menstrual cycle typically ranges from 21 to 35 days, with 28 days being average."
      },
      {
        type: "mcq", 
        difficulty: "medium",
        question: "Which hormone is primarily responsible for ovulation?",
        options: [
          "Estrogen",
          "Progesterone",
          "Luteinizing Hormone (LH)",
          "Follicle Stimulating Hormone (FSH)"
        ],
        answer: "Luteinizing Hormone (LH)",
        explanation: "LH surge triggers ovulation approximately 24-36 hours after its peak, causing the mature follicle to release the egg."
      },
      {
        type: "theory",
        difficulty: "hard", 
        question: "Describe the management of pre-eclampsia in pregnancy.",
        answer: "Management of pre-eclampsia:\n\nMild pre-eclampsia:\n- Regular monitoring of BP and urine protein\n- Fetal surveillance with NST and ultrasound\n- Delivery at 37 weeks\n\nSevere pre-eclampsia:\n- Hospitalization\n- Antihypertensive therapy (Labetalol, Nifedipine)\n- Magnesium sulfate for seizure prophylaxis\n- Delivery after stabilization, regardless of gestational age\n- Corticosteroids if <34 weeks for fetal lung maturity"
      },
      {
        type: "scenario",
        difficulty: "medium",
        question: "A 28-year-old pregnant patient at 32 weeks presents with BP 150/95 mmHg, 2+ proteinuria, and mild edema. What is your immediate management?",
        idealSolution: "Immediate Management:\n1. Admit to hospital for close monitoring\n2. Start antihypertensive therapy (Labetalol 100mg BD)\n3. Administer Magnesium sulfate loading dose 4g IV followed by 1g/hour infusion\n4. Monitor fetal heart rate continuously\n5. Blood investigations: CBC, LFT, RFT, uric acid\n6. Consider delivery if condition worsens or after 34 weeks with steroid coverage",
        keyConsiderations: [
          "Assess for symptoms of severe features (headache, visual disturbances, epigastric pain)",
          "Monitor for HELLP syndrome",
          "Evaluate fetal well-being with biophysical profile",
          "Consider transfer to tertiary care if facilities inadequate"
        ]
      }
    ]
  },
  {
    id: "general-physician-mock",
    title: "General Physician Assessment",
    desc: "Comprehensive general medicine knowledge test",
    domain: "General Physician", 
    img: "/images/physician.jpg",
    totalQuestions: 20,
    duration: 40,
    questions: [
      {
        type: "mcq",
        difficulty: "easy", 
        question: "What is the first-line treatment for type 2 diabetes?",
        options: [
          "Insulin",
          "Metformin",
          "Sulfonylureas", 
          "GLP-1 agonists"
        ],
        answer: "Metformin",
        explanation: "Metformin is the first-line pharmacological treatment for type 2 diabetes due to its efficacy, safety profile, and cardiovascular benefits."
      },
      {
        type: "mcq",
        difficulty: "medium",
        question: "Which vitamin deficiency causes megaloblastic anemia?",
        options: [
          "Vitamin B12",
          "Vitamin C", 
          "Vitamin D",
          "Vitamin K"
        ],
        answer: "Vitamin B12",
        explanation: "Vitamin B12 deficiency impairs DNA synthesis in red blood cell precursors, leading to megaloblastic anemia characterized by large, immature RBCs."
      },
      {
        type: "theory",
        difficulty: "hard",
        question: "Explain the stepwise management of hypertension according to JNC-8 guidelines.",
        answer: "JNC-8 Hypertension Management:\n\nStep 1: Lifestyle modifications for all patients\n\nStep 2: Initiate pharmacotherapy for:\n- ≥60 years: BP ≥150/90 mmHg\n- <60 years: BP ≥140/90 mmHg\n- Diabetes/CKD: BP ≥140/90 mmHg\n\nFirst-line drugs:\n- General non-black population: Thiazide, ACEI, ARB, or CCB\n- Black population: Thiazide or CCB\n\nStep 3: Add second drug from different class if goal BP not achieved\n\nStep 4: Add third drug (usually thiazide if not already used)"
      },
      {
        type: "scenario", 
        difficulty: "medium",
        question: "A 65-year-old male presents with chest pain radiating to left arm, sweating, and nausea for 30 minutes. ECG shows ST elevation in anterior leads. What is your immediate management?",
        idealSolution: "Immediate Management (STEMI protocol):\n1. MONA protocol: Morphine, Oxygen, Nitroglycerin, Aspirin\n2. Dual antiplatelet therapy: Aspirin 325mg + Clopidogrel 600mg loading\n3. Immediate reperfusion therapy:\n   - Primary PCI within 90 minutes if available\n   - Thrombolysis within 30 minutes if PCI not available\n4. Anticoagulation: Heparin or LMWH\n5. Beta-blockers if no contraindications\n6. Statin therapy\n7. Monitor in CCU",
        keyConsiderations: [
          "Time is muscle - minimize door-to-balloon or door-to-needle time",
          "Assess contraindications for thrombolysis",
          "Monitor for complications: arrhythmias, heart failure, cardiogenic shock",
          "Consider transfer to PCI-capable center if within 120 minutes"
        ]
      }
    ]
  },
  {
    id: "dermatologist-mock",
    title: "Dermatology Specialist Test",
    desc: "Skin diseases and treatment knowledge assessment", 
    domain: "Dermatologist",
    img: "/images/dermatology.jpg",
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "Which of the following is the most common type of skin cancer?",
        options: [
          "Melanoma",
          "Basal cell carcinoma", 
          "Squamous cell carcinoma",
          "Merkel cell carcinoma"
        ],
        answer: "Basal cell carcinoma",
        explanation: "Basal cell carcinoma is the most common type of skin cancer, accounting for about 80% of all skin cancers, typically occurring on sun-exposed areas."
      },
      {
        type: "theory",
        difficulty: "medium",
        question: "Describe the clinical features and treatment of psoriasis vulgaris.",
        answer: "Clinical Features of Psoriasis Vulgaris:\n- Well-demarcated erythematous plaques with silvery scales\n- Commonly affects elbows, knees, scalp, and lower back\n- Auspitz sign: pinpoint bleeding when scale removed\n- Koebner phenomenon: lesions at sites of trauma\n\nTreatment:\nTopical: Corticosteroids, vitamin D analogs, coal tar\nPhototherapy: NB-UVB, PUVA\nSystemic: Methotrexate, Cyclosporine, Acitretin\nBiologics: TNF-alpha inhibitors, IL-17/23 inhibitors"
      }
    ]
  },
  {
    id: "ent-specialist-mock", 
    title: "ENT Specialist Examination",
    desc: "Ear, Nose and Throat disorders assessment",
    domain: "ENT Specialist",
    img: "/images/ent.jpg",
    totalQuestions: 8,
    duration: 15,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "What is the most common cause of acute otitis media in children?",
        options: [
          "Viral infection",
          "Bacterial infection",
          "Fungal infection", 
          "Allergic reaction"
        ],
        answer: "Bacterial infection",
        explanation: "Acute otitis media is most commonly caused by bacterial pathogens, with Streptococcus pneumoniae, Haemophilus influenzae, and Moraxella catarrhalis being the most frequent organisms."
      },
      {
        type: "scenario",
        difficulty: "medium", 
        question: "A 35-year-old teacher presents with hoarseness of voice for 3 months. She has no pain or swallowing difficulty. What is your differential diagnosis and workup?",
        idealSolution: "Differential Diagnosis:\n1. Vocal cord nodules/polyps\n2. Laryngopharyngeal reflux\n3. Functional voice disorder\n4. Early laryngeal malignancy\n5. Vocal cord paralysis\n\nWorkup:\n1. Detailed history: voice use pattern, reflux symptoms, smoking/alcohol\n2. Indirect laryngoscopy or flexible nasopharyngolaryngoscopy\n3. Voice therapy assessment\n4. Consider CT neck if malignancy suspected\n5. pH monitoring if reflux suspected",
        keyConsiderations: [
          "Assess risk factors for malignancy (smoking, alcohol)",
          "Evaluate voice usage pattern (teacher is high-risk for nodules)",
          "Consider trial of voice therapy and reflux management",
          "Low threshold for scope examination given duration of symptoms"
        ]
      }
    ]
  },
  {
    id: "homoeopath-mock",
    title: "Homoeopathy Practice Test",
    desc: "Homoeopathic principles and remedy knowledge",
    domain: "Homoeopath", 
    img: "/images/homoeopathy.jpg",
    totalQuestions: 6,
    duration: 12,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "Who is considered the founder of homoeopathy?",
        options: [
          "Hippocrates",
          "Samuel Hahnemann", 
          "Paracelsus",
          "Galen"
        ],
        answer: "Samuel Hahnemann",
        explanation: "Samuel Hahnemann, a German physician, founded homoeopathy in the late 18th century and formulated its fundamental principles."
      },
      {
        type: "theory",
        difficulty: "medium",
        question: "Explain the principle of 'Similia Similibus Curentur' with an example.",
        answer: "Principle: 'Like cures like' - a substance that causes symptoms in a healthy person can cure similar symptoms in a sick person.\n\nExample: \n- Allium cepa (red onion) causes watery eyes and runny nose\n- Therefore, it is used to treat colds with similar symptoms: watery eyes, runny nose, sneezing\n- The substance is highly diluted (potentized) according to homoeopathic principles"
      }
    ]
  },
  {
    id: "ayurveda-mock",
    title: "Ayurveda Knowledge Test", 
    desc: "Ayurvedic principles and treatment assessment",
    domain: "Ayurveda",
    img: "/images/ayurveda.jpg",
    totalQuestions: 7,
    duration: 14,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "How many fundamental principles (Doshas) are there in Ayurveda?",
        options: [
          "Two",
          "Three", 
          "Four",
          "Five"
        ],
        answer: "Three",
        explanation: "Ayurveda recognizes three fundamental biological principles or Doshas: Vata (air/space), Pitta (fire/water), and Kapha (water/earth), which govern all physiological and psychological functions."
      },
      {
        type: "theory",
        difficulty: "medium", 
        question: "Describe the concept of Agni in Ayurveda and its importance in health.",
        answer: "Agni (Digestive Fire) Concept:\n\nAgni refers to the metabolic and digestive fire that governs:\n- Digestion and absorption of food\n- Transformation of nutrients into bodily tissues\n- Elimination of waste products\n- Maintenance of cellular metabolism\n\nTypes of Agni:\n1. Jatharagni - main digestive fire in stomach\n2. Bhutagni - elemental fire for nutrient transformation  \n3. Dhatvagni - tissue-level metabolic fires\n\nImportance: Balanced Agni ensures proper digestion, prevents toxin (Ama) formation, and maintains overall health. Impaired Agni leads to disease."
      }
    ]
  },
  
];

export const nurseTests: Test[] = [
   {
    id: "nursing-fundamentals",
    title: "Nursing Fundamentals",
    desc: "Basic nursing concepts and patient care",
    domain: "Nurse",
    img: "/images/nursing.jpg", 
    totalQuestions: 10,
    duration: 20,
    questions: [
      {
        type: "mcq",
        difficulty: "easy",
        question: "What is the normal range for adult blood pressure?",
        options: [
          "<120/80 mmHg",
          "<130/85 mmHg", 
          "<140/90 mmHg",
          "<150/95 mmHg"
        ],
        answer: "<120/80 mmHg",
        explanation: "Normal blood pressure for adults is defined as systolic <120 mmHg and diastolic <80 mmHg according to current guidelines."
      },
      {
        type: "scenario",
        difficulty: "medium",
        question: "A post-operative patient develops sudden shortness of breath, chest pain, and tachycardia. What is your immediate nursing response?",
        idealSolution: "Immediate Nursing Response:\n1. Call for help and activate rapid response team\n2. Assess ABCs: Airway, Breathing, Circulation\n3. Administer high-flow oxygen via non-rebreather mask\n4. Monitor vital signs and oxygen saturation\n5. Position patient in semi-Fowler's position\n6. Prepare emergency equipment: crash cart, defibrillator\n7. Assist with diagnostic tests: ECG, ABG, chest X-ray\n8. Administer medications as ordered (anticoagulants, analgesics)",
        keyConsiderations: [
          "Consider pulmonary embolism in post-operative patients",
          "Monitor for signs of hemodynamic instability", 
          "Document all assessments and interventions",
          "Provide emotional support to patient and family"
        ]
      }
    ]
  },

];

export const programmingTests: Test[] = [
  {
    id: "javascript-advanced",
    title: "Advanced JavaScript",
    desc: "Advanced JavaScript concepts and coding challenges",
    domain: "Programming",
    img: "/images/javascript.jpg",
    totalQuestions: 15,
    duration: 45,
    questions: [
      {
        type: "coding",
        difficulty: "medium",
        question: "Implement a `debounce` function in JavaScript.",
        inputOutput: "Input: Calling debounce(myFunction, 300) multiple times rapidly should only execute `myFunction` once after 300ms of inactivity.",
        solutionApproach: "Use `setTimeout` to delay function execution and `clearTimeout` to reset the timer if the function is called again within the delay period. Use a closure to maintain the timer ID.",
        sampleSolution: "function debounce(func, delay) {\n  let timeout;\n  return function(...args) {\n    const context = this;\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(context, args), delay);\n  };\n}",
        complexity: "O(1) per invocation (amortized), O(1) space for closure"
      },
      {
        type: "coding", 
        difficulty: "medium",
        question: "Write a polyfill for `Promise.all`.",
        inputOutput: "Input: An array of Promises. Output: A single Promise that resolves with an array of results when all input Promises resolve, or rejects with the first error.",
        solutionApproach: "Iterate through the array of promises, track resolved values and errors. Use a counter to know when all promises have settled.",
        sampleSolution: "function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    if (!Array.isArray(promises)) {\n      return reject(new TypeError('Argument must be an array'));\n    }\n    let results = [];\n    let completed = 0;\n    let total = promises.length;\n\n    if (total === 0) return resolve([]);\n\n    promises.forEach((promise, index) => {\n      Promise.resolve(promise).then(value => {\n        results[index] = value;\n        completed++;\n        if (completed === total) {\n          resolve(results);\n        }\n      }).catch(reason => {\n        reject(reason);\n      });\n    });\n  });\n}",
        complexity: "O(N) time where N is the number of promises, O(N) space for results array"
      },
      {
        type: "mcq",
        difficulty: "medium", 
        question: "Which statement about `this` in JavaScript arrow functions is true?",
        options: [
          "Arrow functions bind `this` to the global object.",
          "Arrow functions have their own `this` context, which is determined by how they are called.",
          "Arrow functions inherit `this` from their lexical (enclosing) scope.",
          "Arrow functions cannot use `this`."
        ],
        answer: "Arrow functions inherit `this` from their lexical (enclosing) scope.",
        explanation: "Arrow functions do not have their own `this` binding. They capture the `this` value of the enclosing lexical context when they are created, and this binding cannot be changed."
      },
      {
        type: "output",
        difficulty: "medium",
        question: "What will be the output of the following code snippet?",
        code: "for (var i = 0; i < 3; i++) {\n    setTimeout(() => console.log(i), 100);\n}",
        expectedOutput: "3\n3\n3", 
        explanation: "The `var` keyword creates a function-scoped variable, and `i` is mutable. By the time `setTimeout` callbacks execute (after the loop finishes), the value of `i` has already become 3. All three closures reference the same `i` which now holds 3."
      },
      {
        type: "scenario",
        difficulty: "hard",
        question: "You need to render a list of 10,000 items efficiently in a browser. Each item has a complex structure and rendering all at once causes performance issues. How would you approach this to ensure a smooth user experience?",
        idealSolution: "The primary approach to efficiently render large lists is **Virtualization (or Windowing)**. This technique only renders the items currently visible in the user's viewport, plus a small buffer of items above and below the viewport. As the user scrolls, new items are rendered and old, off-screen items are unmounted or recycled. This significantly reduces the number of DOM elements that the browser needs to manage, improving performance.",
        keyConsiderations: [
          "**Virtualization Libraries:** Use existing libraries like `react-window`, `react-virtualized` (for React), `vue-virtual-scroller` (for Vue), or custom implementations.",
          "**Item Height:** Fixed vs. dynamic item heights. Fixed heights are simpler to implement; dynamic heights require more complex calculations to determine item positions and visible range.",
          "**Scroll Position:** Accurately calculating which items are visible based on scroll position and container height.",
          "**Placeholder Elements:** Using placeholder elements to maintain scrollbar size and prevent jumpiness.",
          "**Data Management:** Ensuring efficient data access for the visible items.",
          "**Performance Tuning:** Debouncing scroll events, optimizing individual item rendering, avoiding unnecessary re-renders."
        ]
      }
    ]
  }

];

// Combine all tests including cardiac tests
export const allTests = [...cardiacTests, ...doctorTests, ...nurseTests, ...programmingTests];

// Helper function to filter questions by difficulty
export const filterQuestionsByDifficulty = (questions: TestQuestion[], difficulty: string): TestQuestion[] => {
  if (difficulty === 'all') return questions;
  return questions.filter(q => q.difficulty === difficulty);
};

// Helper function to get question type display name
export const getQuestionTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'coding': 'Coding Challenge',
    'mcq': 'Multiple Choice', 
    'theory': 'Theory Question',
    'output': 'Output Prediction',
    'scenario': 'Scenario Based' 
  };
  return typeMap[type] || type;
};

// Helper to get tests by domain
export const getTestsByDomain = (domain: string): Test[] => {
  return allTests.filter(test => test.domain === domain);
};

// NEW: Helper to get test by ID (for MyCourses)
export const getTestById = (testId: string): Test | undefined => {
  return allTests.find(test => test.id === testId);
};

// NEW: Helper to get quiz questions for MyCourses
export const getQuizQuestionsForMyCourses = (testId: string) => {
  const test = getTestById(testId);
  if (!test) return [];
  
  return test.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options || [],
    correct: q.correct,
    explanation: q.explanation
  }));
};

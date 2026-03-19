import { CourseType } from "../../types"; // move your type here

export const coursesData: CourseType[] = [
  // Paste your existing `courses` array here
  {
    id: "1",
    courseRole: "Doctor",
    specialization: "Cardiology",
    title: "Heart Health Basics",
    shortDescription: "Learn about cardiology essentials.",
    description: `<h2>Comprehensive Cardiology Course</h2>
          <p>This <strong>comprehensive course</strong> covers all the fundamental aspects of cardiology. You'll learn about:</p>
          <ul>
            <li>Heart anatomy and physiology</li>
            <li>Common cardiovascular diseases</li>
            <li>Diagnostic techniques including ECG and echocardiography</li>
            <li>Modern treatment options and medications</li>
          </ul>
          <p><em>Perfect for medical students and junior doctors</em></p>`,
    price: 99.99,
    banner:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
    video: null,
    videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
    author: "Dr. Ahmed Al Mansoori",
    publishedDate: "2025-09-20",
    expiryDays: 7,
  },
  {
    id: "2",
    courseRole: "Doctor",
    specialization: "Neurology",
    title: "Brain Function & Disorders",
    shortDescription: "Detailed guide to understanding brain functions.",
    description: `<h2>Advanced Neurology Training</h2>
          <p>Explore the <strong>complex world of neurology</strong> with this in-depth course. This program includes:</p>
          <ol>
            <li>Brain structure and neural pathways</li>
            <li>Common neurological disorders (stroke, epilepsy, Parkinson's)</li>
            <li>Advanced diagnostic methods (MRI, CT, EEG)</li>
            <li>Cutting-edge treatment approaches</li>
          </ol>
          <blockquote>Essential for neurologists and neurosurgeons</blockquote>`,
    price: 149.99,
    banner:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
    video: null,
    videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
    author: "Dr. Arjumand Khan",
    publishedDate: "2025-09-18",
    expiryDays: 10,
  },
  {
    id: "3",
    courseRole: "Nurse",
    specialization: "Emergency Care",
    title: "ICU Care Essentials",
    shortDescription: "Practical ICU nursing techniques and patient care.",
    description: `<h2>ICU Nursing Mastery</h2>
          <p>Master the <strong>essential skills</strong> required for ICU nursing. This course covers:</p>
          <ul>
            <li>Critical care protocols and procedures</li>
            <li>Advanced patient monitoring techniques</li>
            <li>Emergency response and crisis management</li>
            <li>Medication administration in critical care</li>
          </ul>
          <p><strong>Learning Outcomes:</strong></p>
          <ul>
            <li>Proficient in ventilator management</li>
            <li>Expert in hemodynamic monitoring</li>
            <li>Skilled in emergency interventions</li>
          </ul>`,
    price: 79.99,
    banner:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
    video: null,
    videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
    author: "Nurse Aisha Ali",
    publishedDate: "2025-09-15",
    expiryDays: 30,
  },
  {
    id: "4",
    courseRole: "Nurse",
    specialization: "Pediatrics",
    title: "Pediatric Nursing",
    shortDescription: "Childcare and pediatric nursing best practices.",
    description: `<h2>Pediatric Nursing Excellence</h2>
          <p>Specialize in <strong>pediatric nursing</strong> with this comprehensive course. Key topics include:</p>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 8px; background: #f0f0f0;">Age Group</th>
                <th style="padding: 8px; background: #f0f0f0;">Key Focus Areas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px;">Newborns (0-1 month)</td>
                <td style="padding: 8px;">Feeding, growth monitoring, newborn screening</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Infants (1-12 months)</td>
                <td style="padding: 8px;">Immunization, developmental milestones</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Children (1-12 years)</td>
                <td style="padding: 8px;">Common childhood illnesses, preventive care</td>
              </tr>
            </tbody>
          </table>`,
    price: 89.99,
    banner:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
    video: null,
    videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
    author: "Nurse Fatima Noor",
    publishedDate: "2025-09-12",
    expiryDays: 7,
  },
  {
    id: "5",
    courseRole: "Doctor",
    specialization: "Orthopedics",
    title: "Orthopedic Surgery Insights",
    shortDescription: "Overview of orthopedic surgery and rehabilitation.",
    description: `<h2>Orthopedic Surgery Masterclass</h2>
          <p>Gain <strong>comprehensive insights</strong> into orthopedic surgery procedures and rehabilitation.</p>
          <h3>Course Modules:</h3>
          <ol>
            <li><strong>Module 1:</strong> Bone Anatomy and Physiology</li>
            <li><strong>Module 2:</strong> Fracture Management</li>
            <li><strong>Module 3:</strong> Joint Replacement Techniques</li>
            <li><strong>Module 4:</strong> Post-operative Rehabilitation</li>
          </ol>
          <p><code>Advanced surgical techniques and patient management protocols</code></p>`,
    price: 199.99,
    banner:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
    video: null,
    videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
    author: "Dr. Imran Malik",
    publishedDate: "2025-09-10",
    expiryDays: 3,
  },
];

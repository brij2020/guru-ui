import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import GovHeroSlider from "@/components/GovHeroSlider";
import PreferredExamNavigator from "@/components/PreferredExamNavigator";
import AiMockTrackTabs from "@/components/AiMockTrackTabs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "hi" }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isHindi = lang === "hi";

  const title = isHindi
    ? "اختبارات تجريبية لمتخصصي IT والطلاب والامتحانات الحكومية | Test Guru"
    : "Mock Tests for IT Professionals, Students & Government Exams | Test Guru";
  const description = isHindi
    ? "اختبارات تجريبية عبر الإنترنت لمجالات تقنية المعلومات والطلاب والامتحانات الحكومية والتعليم العام مع تحليل أداء ذكي."
    : "Take online mock tests for IT skills, student exams, government jobs, and general education with detailed analytics.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}`,
      siteName: "Test Guru",
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: "en" | "hi" }>;
}) {
  const { lang } = await params;
  const isHindi = lang === "hi";

  const popularExams = isHindi
    ? [
        {
          name: "SSC CGL",
          subtitle: "Tier 1 + Tier 2",
          details: "100 سؤال • 60 دقيقة",
          href: `/${lang}/gov-exams/mock-test-builder/ssc-cgl`,
        },
        {
          name: "IBPS PO",
          subtitle: "Prelims + Mains",
          details: "السرعة + الدقة",
          href: `/${lang}/gov-exams/mock-test-builder/ibps-po`,
        },
        {
          name: "SBI Clerk",
          subtitle: "Prelims Focus",
          details: "Quant + Reasoning + English",
          href: `/${lang}/gov-exams/mock-test-builder/sbi-clerk`,
        },
        {
          name: "UPSC Prelims",
          subtitle: "GS + CSAT",
          details: "تحليل موضوعي شامل",
          href: `/${lang}/gov-exams/mock-test-builder/upsc-cse`,
        },
        {
          name: "Railway NTPC",
          subtitle: "CBT Pattern",
          details: "اختبارات سرعة يومية",
          href: `/${lang}/gov-exams/mock-test-builder/rrb-ntpc`,
        },
        {
          name: "State PSC",
          subtitle: "Prelims Track",
          details: "GK + Aptitude + Current Affairs",
          href: `/${lang}/gov-exams/mock-test-builder/state-psc`,
        },
        {
          name: "BPSC TRE 4",
          subtitle: "Teacher Recruitment",
          details: "150 Questions • 150 Mins",
          href: `/${lang}/gov-exams/mock-test-builder/bpsc-tre-4`,
        },
      ]
    : [
        {
          name: "SSC CGL",
          subtitle: "Tier 1 + Tier 2",
          details: "100 questions • 60 mins",
          href: `/${lang}/gov-exams/mock-test-builder/ssc-cgl`,
        },
        {
          name: "IBPS PO",
          subtitle: "Prelims + Mains",
          details: "Speed + Accuracy Focus",
          href: `/${lang}/gov-exams/mock-test-builder/ibps-po`,
        },
        {
          name: "SBI Clerk",
          subtitle: "Prelims Focus",
          details: "Quant + Reasoning + English",
          href: `/${lang}/gov-exams/mock-test-builder/sbi-clerk`,
        },
        {
          name: "UPSC Prelims",
          subtitle: "GS + CSAT",
          details: "Topic-wise analytics",
          href: `/${lang}/gov-exams/mock-test-builder/upsc-cse`,
        },
        {
          name: "Railway NTPC",
          subtitle: "CBT Pattern",
          details: "Daily timed drills",
          href: `/${lang}/gov-exams/mock-test-builder/rrb-ntpc`,
        },
        {
          name: "State PSC",
          subtitle: "Prelims Track",
          details: "GK + Aptitude + Current Affairs",
          href: `/${lang}/gov-exams/mock-test-builder/state-psc`,
        },
        {
          name: "BPSC TRE 4",
          subtitle: "Teacher Recruitment",
          details: "150 Questions • 150 Mins",
          href: `/${lang}/gov-exams/mock-test-builder/bpsc-tre-4`,
        },
      ];

  const latestTests = isHindi
    ? [
        { title: "Full Stack Developer Mock 2026", href: `/${lang}/tests?exam=programming-dsa&set=fullstack-2026` },
        { title: "SSC CGL Quant & Reasoning Set 21", href: `/${lang}/tests?exam=ssc-cgl&set=quant-reasoning-21` },
        { title: "General Education Foundation Quiz 12", href: `/${lang}/tests?exam=general-education&set=foundation-12` },
      ]
    : [
        { title: "Full Stack Developer Mock 2026", href: `/${lang}/tests?exam=programming-dsa&set=fullstack-2026` },
        { title: "SSC CGL Quant & Reasoning Set 21", href: `/${lang}/tests?exam=ssc-cgl&set=quant-reasoning-21` },
        { title: "General Education Foundation Quiz 12", href: `/${lang}/tests?exam=general-education&set=foundation-12` },
      ];

  const educationalNews = isHindi
    ? [
        {
          title: "آخر تحديثات SSC CGL 2026: المواعيد ونمط الأسئلة",
          category: "تحديث امتحان",
          summary: "أهم التغييرات في نمط الاختبار والزمن مع نصائح للاستعداد.",
          href: `/${lang}/tests/instructions`,
        },
        {
          title: "UPSC Prelims: طريقة مراجعة Current Affairs أسبوعيًا",
          category: "استراتيجية مذاكرة",
          summary: "خطة عملية لتغطية الأخبار المهمة وربطها بموضوعات الامتحان.",
          href: `/${lang}/courses`,
        },
        {
          title: "منح تعليمية للطلاب 2026: الشروط ومواعيد التقديم",
          category: "منح دراسية",
          summary: "ملخص سريع للمنح المفتوحة وكيفية تجهيز ملف التقديم.",
          href: `/${lang}/courses`,
        },
      ]
    : [
        {
          title: "SSC CGL 2026 Update: Dates, Pattern and Key Changes",
          category: "Exam Update",
          summary: "A quick brief on pattern changes, section weightage, and prep priorities.",
          href: `/${lang}/tests/instructions`,
        },
        {
          title: "UPSC Prelims: Weekly Current Affairs Revision Framework",
          category: "Prep Strategy",
          summary: "A practical weekly structure to retain and apply current affairs effectively.",
          href: `/${lang}/courses`,
        },
        {
          title: "Top Scholarships for Students in 2026: Eligibility Checklist",
          category: "Scholarships",
          summary: "Important scholarship options with an easy checklist for application readiness.",
          href: `/${lang}/courses`,
        },
      ];

  const sipPlans = isHindi
    ? [
        {
          title: "SIP يومي (45 دقيقة)",
          frequency: "يوميًا",
          audience: "IT + Coding",
          points: ["15 دقيقة مفاهيم", "20 دقيقة أسئلة Coding", "10 دقائق مراجعة الأخطاء"],
          cta: "ابدأ الخطة اليومية",
          href: `/${lang}/tests?plan=sip-daily-coding`,
        },
        {
          title: "SIP أسبوعي (5 أيام)",
          frequency: "أسبوعيًا",
          audience: "IT + Coding",
          points: ["3 اختبارات Coding قصيرة", "2 اختبارات Aptitude", "جلسة تحليل أسبوعية للأداء"],
          cta: "ابدأ الخطة الأسبوعية",
          href: `/${lang}/tests?plan=sip-weekly-coding`,
        },
        {
          title: "SIP حكومي (6 أيام)",
          frequency: "الأكثر طلبًا",
          audience: "Gov Exams",
          points: ["4 اختبارات: Quant + Reasoning + GK", "2 اختبارات سرعة زمنية", "مراجعة أسبوعية لرفع الدقة والترتيب"],
          cta: "ابدأ SIP الحكومي",
          href: `/${lang}/tests?plan=sip-gov-aspirants`,
          featured: true,
        },
      ]
    : [
        {
          title: "Daily SIP (45 mins)",
          frequency: "Per Day",
          audience: "IT + Coding",
          points: ["15 mins concept revision", "20 mins coding questions", "10 mins error review"],
          cta: "Start Daily SIP",
          href: `/${lang}/tests?plan=sip-daily-coding`,
        },
        {
          title: "Weekly SIP (5 days)",
          frequency: "Per Week",
          audience: "IT + Coding",
          points: ["3 short coding mocks", "2 aptitude tests", "1 weekly performance review"],
          cta: "Start Weekly SIP",
          href: `/${lang}/tests?plan=sip-weekly-coding`,
        },
        {
          title: "Gov Aspirant SIP (6 days)",
          frequency: "Most Popular",
          audience: "SSC • Banking • UPSC",
          points: ["4 mocks: Quant + Reasoning + GK", "2 timed speed drills", "1 weekly revision for rank improvement"],
          cta: "Start Gov SIP",
          href: `/${lang}/tests?plan=sip-gov-aspirants`,
          featured: true,
        },
      ];

  const resources = isHindi
    ? [
        { title: "استراتيجية اختبارات التوظيف التقني (IT)", href: `/${lang}/tests/instructions` },
        { title: "خطة مذاكرة للطلاب والاختبارات الأكاديمية", href: `/${lang}/tests/instructions` },
        { title: "طريقة التحضير للامتحانات الحكومية خطوة بخطوة", href: `/${lang}/courses` },
      ]
    : [
        { title: "IT Interview & Aptitude Mock Test Strategy", href: `/${lang}/tests/instructions` },
        { title: "Student Exam Preparation Plan with Mock Tests", href: `/${lang}/tests/instructions` },
        { title: "Government Exam Preparation Roadmap", href: `/${lang}/courses` },
      ];

  const aiMockTracks = isHindi
    ? [
        {
          id: "medical",
          title: "Doctors & Specialists",
          description: "اختبارات ذكية للطب والتمريض والتخصصات الصحية مع تحليل نقاط الضعف.",
          href: `/${lang}/tests?track=medical`,
          cta: "ابدأ مسار الطب",
          badge: "Medical AI Track",
          highlights: [
            "حالات سريرية مصغرة بتغذية راجعة فورية",
            "تحليل دقة القرار الطبي حسب التخصص",
            "خطة تحسين أسبوعية للمفاهيم الضعيفة",
          ],
        },
        {
          id: "programming",
          title: "Programming",
          description: "اختبارات AI للبرمجة وDSA وOOP وأنماط مقابلات التوظيف التقنية.",
          href: `/${lang}/tests?track=programming`,
          cta: "ابدأ مسار البرمجة",
          badge: "Coding AI Track",
          highlights: [
            "أسئلة تكيفية في DSA وOOP",
            "تدريب على نمط مقابلات الشركات",
            "تحليل سرعة الحل وجودة المنطق",
          ],
        },
        {
          id: "nursing",
          title: "Nursing",
          description: "اختبارات تدريبية للتمريض السريري والأساسيات مع تقارير أداء فورية.",
          href: `/${lang}/tests?track=nursing`,
          cta: "ابدأ مسار التمريض",
          badge: "Nursing AI Track",
          highlights: [
            "سيناريوهات رعاية وتمريض واقعية",
            "تقارير فورية لنقاط القوة والضعف",
            "مراجعة مركزة على السلامة والإجراءات",
          ],
        },
      ]
    : [
        {
          id: "medical",
          title: "Doctors & Specialists",
          description: "AI mock tests for medicine, clinical decision-making, and specialist readiness.",
          href: `/${lang}/tests?track=medical`,
          cta: "Start Medical Track",
          badge: "Medical AI Track",
          highlights: [
            "Case-based clinical questions with instant feedback",
            "Topic-wise accuracy and confidence insights",
            "Personalized weak-area revision plan",
          ],
        },
        {
          id: "programming",
          title: "Programming",
          description: "Adaptive coding mocks for DSA, OOP, debugging, and tech interview patterns.",
          href: `/${lang}/tests?track=programming`,
          cta: "Start Programming Track",
          badge: "Coding AI Track",
          highlights: [
            "Adaptive DSA and problem-solving rounds",
            "Interview-pattern coding and debugging sets",
            "Speed and accuracy trend tracking",
          ],
        },
        {
          id: "nursing",
          title: "Nursing",
          description: "Nursing-focused mock tests for core concepts, clinical scenarios, and NCLEX-style prep.",
          href: `/${lang}/tests?track=nursing`,
          cta: "Start Nursing Track",
          badge: "Nursing AI Track",
          highlights: [
            "Clinical scenario-based nursing questions",
            "Core concept checks with instant explanations",
            "Targeted readiness insights by topic",
          ],
        },
      ];

  const faqItems = isHindi
    ? [
        {
          question: "هل يمكنني البدء باختبار مجاني؟",
          answer: "نعم، يمكنك بدء اختبار مجاني فورًا ثم اختيار خطة مناسبة حسب احتياجك.",
        },
        {
          question: "هل أحصل على تحليل تفصيلي بعد كل اختبار؟",
          answer: "نعم، تحصل على تحليل بالدقة والسرعة ونقاط الضعف لكل موضوع.",
        },
        {
          question: "هل الاختبارات بنفس نمط الامتحان الحقيقي؟",
          answer: "نعم، يتم تصميم الاختبارات بنفس أسلوب الصعوبة والزمن المتوقع للامتحانات التنافسية.",
        },
      ]
    : [
        {
          question: "Can I start with a free mock test?",
          answer: "Yes. You can start instantly with a free test and upgrade when you need advanced analytics.",
        },
        {
          question: "Do I get detailed analysis after each attempt?",
          answer: "Yes. You get speed, accuracy, percentile-style insights, and weak-topic breakdown.",
        },
        {
          question: "Are these mock tests useful for IT, student, and government exam preparation?",
          answer: "Yes. The platform includes role-focused tracks for IT professionals, students, government exams, and general education.",
        },
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Test Guru",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${lang}/tests?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Test Guru",
    url: siteUrl,
    logo: `${siteUrl}/branding/test-guru-mark.svg`,
  };

  return (
    <>
      <main>
        <section className="bg-[var(--section-bg-2)] px-6 md:px-12 lg:px-20 pt-12 pb-14">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-block px-3 py-1 rounded-full bg-[var(--section-bg-1)] text-[var(--section-primary)] text-sm font-semibold">
                {isHindi ? "منصة اختبارات IT والطلاب والحكومة" : "IT, Student & Government Exam Prep"}
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-[var(--heading-color)]">
                {isHindi
                  ? "اختبارات تجريبية لمتخصصي IT والطلاب والامتحانات الحكومية"
                  : "Online Mock Tests for IT Professionals, Students & Government Exams"}
              </h1>
              <p className="mt-4 text-base md:text-lg text-gray-600">
                {isHindi
                  ? "اختر المسار المناسب لك في IT أو التعليم العام أو الامتحانات الحكومية، وطور نتيجتك بتحليل ذكي."
                  : "Practice in IT skills, student academics, government exams, and general education with smart analytics."}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/${lang}/tests`}
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--section-primary)] text-white font-semibold px-6 py-3"
                >
                  {isHindi ? "ابدأ اختبارًا مجانيًا" : "Take a Free Mock Test"}
                </Link>
                <Link
                  href={`/${lang}/courses`}
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--section-primary)] text-[var(--section-primary)] font-semibold px-6 py-3"
                >
                  {isHindi ? "تصفح الامتحانات" : "Browse Exams"}
                </Link>
              </div>
            </div>
            <GovHeroSlider lang={lang} />
          </div>
        </section>

        <section id="ai-mock-tests" className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "AI-Powered Mock Tests" : "AI-Powered Mock Tests"}
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              {isHindi
                ? "اختر المسار المناسب وابدأ اختبارات تكيفية مع تحليل ذكي من أول محاولة."
                : "Choose your preferred track and start adaptive tests with AI-driven feedback."}
            </p>
            <AiMockTrackTabs tracks={aiMockTracks} isHindi={isHindi} lang={lang} />
            <div className="mt-5">
              <Link
                href={`/${lang}/tests`}
                className="inline-flex items-center rounded-lg border border-[var(--section-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--section-primary)]"
              >
                {isHindi ? "استعرض كل المسارات" : "Explore All Mock Test Tracks"}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[var(--section-bg-2)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
                {isHindi ? "Popular Exams / Categories" : "Popular Govt Exams / Categories"}
              </h2>
              <Link
                href={`/${lang}/gov-exams/mock-test-builder`}
                className="inline-flex items-center rounded-lg border border-[var(--section-primary)] px-4 py-2 text-sm font-semibold text-[var(--section-primary)]"
              >
                {isHindi ? "Build Custom Gov Mock" : "Build Custom Gov Mock"}
              </Link>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {isHindi
                ? "اختر الامتحان الحكومي المستهدف وابدأ اختبارات بنفس نمط الامتحان."
                : "Pick your target government exam and practice with pattern-specific mock tests."}
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularExams.map((exam) => (
                <Link
                  key={exam.name}
                  href={exam.href}
                  className="rounded-xl border bg-white border-[var(--grey)] px-5 py-5 hover:shadow-sm transition"
                >
                  <p className="text-lg font-bold text-[var(--heading-color)]">{exam.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--section-primary)]">
                    {exam.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-gray-600">{exam.details}</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--section-primary)]">
                    {isHindi ? "ابدأ الآن" : "Start Practice"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="sip-plans" className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "SIP للتحسين المستمر (مناسب جدًا للمتقدمين الحكوميين)" : "SIP for Coding Improvement (Optimized for Gov Aspirants)"}
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              {isHindi
                ? "اختر خطة يومية أو أسبوعية أو SIP حكومي لزيادة الدقة والسرعة وتحسين الترتيب."
                : "Choose daily, weekly, or GOV SIP plans to build consistency, improve accuracy, and boost rank."}
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sipPlans.map((plan) => (
                <article
                  key={plan.title}
                  className={`rounded-2xl border bg-white p-6 shadow-sm ${plan.featured ? "border-[var(--section-primary)] ring-2 ring-[var(--section-primary)]/15" : "border-[var(--section-border)]"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[var(--heading-color)]">{plan.title}</h3>
                    <span className="rounded-full bg-[#e8f3ff] px-3 py-1 text-xs font-semibold text-[var(--section-primary)]">
                      {plan.frequency}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{plan.audience}</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700">
                    {plan.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--section-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <PreferredExamNavigator lang={lang} />

        <section id="why-test-guru" className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "Why Test Guru" : "Why Test Guru"}
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                isHindi ? "مسارات مخصصة لـ IT والطلاب" : "Tracks for IT Professionals & Students",
                isHindi ? "تحليل دقيق حسب كل فئة" : "Role-Based Performance Analytics",
                isHindi ? "اختبارات حكومية بنمط واقعي" : "Government Exam Pattern Simulations",
                isHindi ? "بنك أسئلة للتعليم العام" : "General Education Question Bank",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-[var(--grey)] bg-white p-5">
                  <h3 className="font-semibold text-[var(--heading-color)]">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--section-bg-2)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
                {isHindi ? "Performance / Results Preview" : "Performance / Results Preview"}
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-gray-700">
                <li>{isHindi ? "مقارنة الأداء داخل مجالك (IT/طلاب/حكومي)" : "Compare your score within your target domain (IT/Student/Gov)"}</li>
                <li>{isHindi ? "متابعة السرعة والدقة لكل محاولة" : "Track speed and accuracy trends across attempts"}</li>
                <li>{isHindi ? "تحليل الموضوعات الأضعف مع خطة تحسين" : "Get weak-topic insights with next-step recommendations"}</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Image
                src="/images/mock-results-preview.svg"
                alt="Mock test results preview for IT students and government exam aspirants"
                width={500}
                height={380}
                className="rounded-2xl w-full h-44 object-cover"
              />
              <Image
                src="/images/mock-analytics-preview.svg"
                alt="Mock test analytics charts for category wise exam preparation"
                width={500}
                height={380}
                className="rounded-2xl w-full h-44 object-cover"
              />
            </div>
          </div>
        </section>

        <section id="social-proof" className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "Social Proof" : "Social Proof"}
            </h2>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: isHindi ? "اختبار مكتمل" : "Tests Completed", value: "250K+" },
                { label: isHindi ? "طالب نشط شهريًا" : "Monthly Active Learners", value: "40K+" },
                { label: isHindi ? "تقييم المستخدمين" : "Average Rating", value: "4.8/5" },
                { label: isHindi ? "قصص نجاح" : "Success Stories", value: "5,000+" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white border border-[var(--grey)] p-5 text-center">
                  <p className="text-2xl font-extrabold text-[var(--section-primary)]">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--section-bg-2)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "Latest Mock Tests / New Questions" : "Latest Mock Tests / New Questions"}
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestTests.map((test) => (
                <Link key={test.title} href={test.href} className="rounded-xl border border-[var(--grey)] bg-white p-5 hover:shadow-sm">
                  <p className="text-xs text-[var(--section-primary)] font-semibold">NEW</p>
                  <h3 className="mt-2 font-semibold text-[var(--heading-color)]">{test.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="education-news" className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "Educational News Feed" : "Educational News Feed"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isHindi
                ? "محتوى تعليمي فقط: تحديثات الامتحانات، الاستراتيجيات، والمنح الدراسية."
                : "Education-focused updates only: exam news, prep strategy, and scholarship insights."}
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {educationalNews.map((item) => (
                <article key={item.title} className="rounded-xl border border-[var(--section-border)] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--section-primary)]">
                    {item.category}
                  </p>
                  <h3 className="mt-2 text-base font-bold text-[var(--heading-color)]">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.summary}</p>
                  <Link href={item.href} className="mt-4 inline-block text-sm font-semibold text-[var(--section-primary)]">
                    {isHindi ? "اقرأ المزيد" : "Read Update"}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "Free Resources" : "Free Resources"}
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="rounded-xl border border-[var(--grey)] bg-white p-5 text-sm font-medium text-[var(--heading-color)] hover:text-[var(--section-primary)]"
                >
                  {resource.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--section-bg-2)] px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
              {isHindi ? "FAQ" : "FAQ"}
            </h2>
            <div className="mt-6 space-y-4">
              {faqItems.map((faq) => (
                <details key={faq.question} className="rounded-xl border border-[var(--grey)] bg-white px-5 py-4">
                  <summary className="cursor-pointer font-semibold text-[var(--heading-color)]">{faq.question}</summary>
                  <p className="mt-3 text-sm text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-14">
          <div
            className="max-w-5xl mx-auto rounded-3xl p-8 md:p-10 shadow-xl border border-white/20"
            style={{ background: "linear-gradient(135deg, #005bb5 0%, #0073e6 55%, #3396ec 100%)" }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white">
              {isHindi ? "ابدأ اختبارًا مجانيًا + تسجيل بياناتك" : "Start Free Test + Lead Capture"}
            </h2>
            <p className="mt-3 text-center text-base text-white">
              {isHindi
                ? "ابدأ الآن وأرسل بياناتك للحصول على خطة تحضير مناسبة."
                : "Start now and share your details to get a personalized prep path."}
            </p>
            <form action={`/${lang}/auth/signUp`} method="get" className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium text-white">
                  {isHindi ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <input
                  id="lead-email"
                  type="email"
                  name="email"
                  required
                  placeholder={isHindi ? "example@email.com" : "example@email.com"}
                  className="w-full rounded-lg border border-white/40 bg-white px-4 py-3 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label htmlFor="lead-phone" className="mb-1.5 block text-sm font-medium text-white">
                  {isHindi ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  name="phone"
                  required
                  placeholder={isHindi ? "+966 5XXXXXXXX" : "+1 (555) 000-0000"}
                  className="w-full rounded-lg border border-white/40 bg-white px-4 py-3 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#0f172a] text-white font-semibold px-5 py-3 hover:bg-[#1e293b] transition-colors"
                >
                  {isHindi ? "ابدأ اختبارًا مجانيًا" : "Start Free Test"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    </>
  );
}

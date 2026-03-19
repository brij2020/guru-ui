export type SidebarItem = {
  id:string;
  label: {en: string; ar: string};
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
};

export type adminbarItem = {
  label: string;
  path: string;
};

export type userbarItem = {
  label: string;
  path: string;
};

// export const adminSidebarItems: SidebarItem[] = [
//   { id: "Dashboard", path: "/admin/dashboard", label: { en: "Dashboard", ar: "لوحة القيادة" } },
//   { id: "Compliance Management", path: "/admin/reports/generator", label: { en: "Compliance Management", ar: "إدارة الامتثال" } },
//   { id: "Licenses", path: "/admin/licenses", label: { en: "Licenses", ar: "التراخيص" } },
//   { id: "Complaints & Violations", path: "/admin/complaints/track", label: { en: "Complaints & Violations", ar: "الشكاوى والانتهاكات" } },
 
// ];

export const userSidebarItems: userbarItem[] = [
  { label: "Dashboard", path: "/user/dashboard" },
  { label: "My Course", path: "/user/myCourse" },
  { label: "My Profile", path: "/user/myProfile" },
  { label: "My Certificate", path: "/user/myCertificates" },
];

export const adminSidebarItems: adminbarItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Courses", path: "/courses" },
  { label: "Tests", path: "/tests" },
  { label: "Manage AI Meta Data", path: "/tests/ai-meta" },
  { label: "Paper Blueprints", path: "/tests/paper-blueprints" },
  { label: "Question Coverage", path: "/tests/question-coverage" },
  { label: "Question Factory", path: "/tests/question-factory" },
  { label: "Question Publisher", path: "/tests/question-publisher" },
  { label: "Question Assets", path: "/tests/question-assets" },
  { label: "Question Import", path: "/tests/question-import" },
  { label: "Question Review", path: "/tests/question-review" },
  { label: "Draft Exam Preview", path: "/tests/draft-exam" },
  { label: "Users", path: "/users" },
];

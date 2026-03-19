export type CourseType = {
  id: string;
  courseName?: string;
  courseRole: string;
  specialization: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  banner: string | File | null;
  video: File | null;
  videoLink: string;
  author: string;
  publishedDate: string;
  expiryDays: number;
};

export type Certificate = {
  id: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  issuedDate: string;
  certificateId?: string;
  instructor: string;
  duration: string;
  grade?: string;
  score?: number;
}
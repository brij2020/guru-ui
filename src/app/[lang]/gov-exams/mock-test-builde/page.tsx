import { redirect } from "next/navigation";

export default async function MockTestBuildeRedirectPage({
  params,
}: {
  params: Promise<{ lang: "en" | "hi" }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/gov-exams/mock-test-builder`);
}

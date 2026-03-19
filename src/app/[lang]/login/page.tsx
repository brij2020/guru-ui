import { redirect } from "next/navigation";

type LoginAliasPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function LoginAliasPage({ params }: LoginAliasPageProps) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "en";
  redirect(`/${lang}/auth/login`);
}

import { getDictionary } from "@/app/[lang]/dictionaries";
import UserDashboardClient from "@/components/user/userDashboardClient";
// import UserDashboardOverview from "@/components/user/dashboard";

export default async function DashboardPage({ params }: { params: Promise<{ lang: "en" | "hi" }>}) {
  
  const {lang} = await params;
  const dict = await getDictionary(lang);

  return (
    <>
    {/* <UserDashboardOverview dict={dict}/> */}
    <UserDashboardClient dict={dict} lang={lang}/>

  </>
   )
}


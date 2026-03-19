import { getDictionary } from "@/app/[lang]/dictionaries";
import MyCourses from "@/components/user/mycourses";

export default async function MyCoursesPage({ params }: { params: Promise<{ lang: "en" | "hi" }>}) {
  
  const {lang} = await params;
  const dict = await getDictionary(lang);

  return (
    <>
    <MyCourses dict={dict} lang={lang}/>

  </>
   )
}


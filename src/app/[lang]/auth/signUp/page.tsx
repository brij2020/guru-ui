 import { getDictionary } from "../../../[lang]/dictionaries";
 import SignupPage from '@/components/dashboardCompo/SignUp';
 
 export default async function page({ params }: { params: Promise<{ lang: "en" | "hi" }>}) {
   
   const {lang} = await params;
   const dict = await getDictionary(lang); 
   return (
     <SignupPage dict={dict} lang={lang}/>
   )
 }

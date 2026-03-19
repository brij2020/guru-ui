import LoginForm from "@/components/LoginForm";
import { getDictionary } from "../../../[lang]/dictionaries";
 
 export default async function page({ params }: { params: Promise<{ lang: "en" | "hi" }>}) {
   
   const {lang} = await params;
   const dict = await getDictionary(lang); 
   return (
     <LoginForm  dict={dict} lang={lang}/>
   )
 }

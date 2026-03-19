"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useEffect } from "react";

// interface DictType {
//   dir?: string;
//   // Add other dictionary properties as needed
//   [key: string]: unknown;
// }


interface AppLayoutClientProps {
  children: React.ReactNode;
  dict:any;
  lang:any
}


export default  function AppLayoutClient({ lang, children,dict}: AppLayoutClientProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith(`/${lang}/admin`);
  const isUserRoute = pathname.startsWith(`/${lang}/user`);
  const isLoginRoute=pathname.startsWith(`/${lang}/auth/login`)
  const isSignUpRoute=pathname.startsWith(`/${lang}/auth/signUp`)
  
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dict?.dir || (lang === "ar" ? "rtl" : "ltr");
  }, [lang,dict?.dir]);

  return (
    <>
      {(!isAdminRoute && !isUserRoute && !isLoginRoute && !isSignUpRoute)&& <Navbar dict={dict} lang={lang} />}
      {children }
      {(!isAdminRoute && !isUserRoute && !isLoginRoute && !isSignUpRoute ) && <Footer dict={dict} lang={lang}/>}
    </>
  );
}

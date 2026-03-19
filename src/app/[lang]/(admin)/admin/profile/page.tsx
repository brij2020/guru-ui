import { getDictionary } from '@/app/[lang]/dictionaries';
import Profile from '@/components/admin/Profile'
import React from 'react'
export default async function Course({ params }: { params: Promise<{ lang: "en" | "hi" }>}) {
   const {lang} = await params;
     const dict = await getDictionary(lang); 
  return (
    <>
    <Profile dict={dict} lang={lang}/>
    </>
  )
}
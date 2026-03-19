import React from 'react'
import { getDictionary } from "@/app/[lang]/dictionaries";

import AllCourse from '@/components/courseSection/AllCourses'

export default async function page({params,}: {params: Promise<{ lang: "en"| "ar" }>}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <AllCourse dict={dict} lang={lang}/>
  )
}

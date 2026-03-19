import React from 'react'
import { getDictionary } from '@/app/[lang]/dictionaries';
import UserProfile from '@/components/user/profile';

export default async function UserProfilePage({ params }: { params: Promise<{ lang: "en" | "hi" }>}) {
  const {lang} = await params;
  const dict = await getDictionary(lang);
  return (
   <>
   <UserProfile dict={dict.userProfile} lang={lang}/>
   </>
  )
}


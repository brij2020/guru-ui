import React from 'react'
import { getDictionary } from '@/app/[lang]/dictionaries';
import UserCertificate from '@/components/user/UserCertificate';

export default async function Certificate({ 
  params 
}: { 
  params: Promise<{ lang: "en" | "hi" }> 
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  console.log('Rendering UserCertificate component...');
  
  return <UserCertificate lang={lang} />
}
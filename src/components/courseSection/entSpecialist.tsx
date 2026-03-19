"use client";

import CustomTestPage from "./customTestPage";

export default function ENTSection({dict}:any) {
  const title1 = dict.entSpecialist.title1
  const title2 = dict.entSpecialist.title2
  const subtitle = dict.entSpecialist.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.entSpecialist.entSpecialistTests
  

  return (
    <CustomTestPage 
      title1={title1} 
      title2={title2} 
      subtitle={subtitle} 
      dentistTests={dentistTests}
      viewAll={viewAll}
      startTest={startTest}
    />
  );
}

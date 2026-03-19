"use client";

import CustomTestPage from "./customTestPage";

export default function DentistSection({dict}:any) {
  const title1 = dict.dentist.title1
  const title2 = dict.dentist.title2
  const subtitle = dict.dentist.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.dentist.dentistTests
  

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

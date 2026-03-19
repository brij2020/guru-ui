"use client";

import CustomTestPage from "./customTestPage";

export default function DermatologistSection({dict}:any) {
  const title1 = dict.dermatologist.title1
  const title2 = dict.dermatologist.title2
  const subtitle = dict.dermatologist.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.dermatologist.dermatologistTests
  

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

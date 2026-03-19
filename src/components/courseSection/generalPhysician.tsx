"use client";

import CustomTestPage from "./customTestPage";

export default function GeneralPhysicianSection({dict}:any) {
  const title1 = dict.generalPhysician.title1
  const title2 = dict.generalPhysician.title2
  const subtitle = dict.generalPhysician.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.generalPhysician.generalPhysicianTests
  

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

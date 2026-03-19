"use client";

import CustomTestPage from "./customTestPage";

export default function GynecologistSection({dict}:any) {
  const title1 = dict.gynecologist.title1
  const title2 = dict.gynecologist.title2
  const subtitle = dict.gynecologist.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.gynecologist.gynecologistTests
  

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

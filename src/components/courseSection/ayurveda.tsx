"use client";

import CustomTestPage from "./customTestPage";

export default function AyurvedSection({dict}:any) {
  const title1 = dict.ayurved.title1
  const title2 = dict.ayurved.title2
  const subtitle = dict.ayurved.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.ayurved.ayurvedTests
  
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

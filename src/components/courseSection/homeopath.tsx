"use client";

import CustomTestPage from "./customTestPage";

export default function HomoeopathSection({dict}:any) {
  const title1 = dict.homoeopath.title1
  const title2 = dict.homoeopath.title2
  const subtitle = dict.homoeopath.subtitle
  const viewAll = dict.buttonText.viewAll
  const startTest = dict.buttonText.startTest
  const dentistTests = dict.homoeopath.homoeopathTests
  
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

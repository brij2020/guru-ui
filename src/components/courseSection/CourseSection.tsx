"use client";
import React, { useState } from "react";
import { Tabs } from "antd";
import { useCart } from "@/components/cartContext";
import CoursesBox from "@/components/courseSection/CourseBox";

function CoursesSection({ dict, lang }: any) {
  const categories = Object.keys(dict.course.courseData || {});
  const [currentTab, setCurrentTab] = useState(categories[0]);
  const { cart, addToCart } = useCart();    // <-- FIXED

  const handleAddToCart = (course: any) => {
    addToCart(course); // context already prevents duplicates
  };

  return (
    <div id="courses-section" className="py-12 bg-[var(--content-bg)]">
      <div className="max-w-7xl mx-auto px-4">
        
        <h2 className="text-2xl font-bold text-[var(--section-text)] mb-2">
          {dict.course.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {dict.course.subtitle}
        </p>

        <Tabs
          defaultActiveKey={categories[0]}
          onChange={(key) => setCurrentTab(key)}
          className="mb-6"
          items={categories.map((cat) => ({
            key: cat,
            label: <span className="font-medium">{cat}</span>,
          }))}
        />

        {/* Pass cart here */}
        <CoursesBox
          sectionData={
            dict.course.courseData[
              currentTab as keyof typeof dict.course.courseData
            ]
          }
          cart={cart}                   // <-- FIXED
          onAddToCart={handleAddToCart}
          dict={dict}
        />
      </div>
    </div>
  );
}

export default CoursesSection;

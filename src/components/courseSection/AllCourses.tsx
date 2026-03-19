"use client";

import React, { useState } from "react";
import { Checkbox, Card } from "antd";
import { useParams } from "next/navigation";
import Link from "next/link";

type CheckboxValueType = string | number;

export default function AllCourse({dict, lang}:any) {
  const params = useParams();
  const currentLang = params.lang as string; // Get current language from URL
  
  const cours = dict.AllCourses
  const allCourses = dict.AllCourses.allCourses
  const categories = cours.AllCategories;
  const [selectedTypes, setSelectedTypes] = useState<CheckboxValueType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredCourses = allCourses.filter((course:any) => {
    const typeMatch =
      selectedTypes.length === 0 || selectedTypes.includes(course.type);
    const categoryMatch =
      selectedCategory === "All" || course.category === selectedCategory;
    return typeMatch && categoryMatch;
  });

  return (
    <div className="flex max-w-7xl mx-auto min-h-screen bg-[var(--content-bg)] text-[var(--section-text)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--section-bg-1)] border-r border-[var(--section-border)] p-6 sticky top-0 h-screen">
        <h2 className="text-lg font-semibold mb-4">{cours.Filters}</h2>

        {/* Type Checkboxes */}
        <Checkbox.Group
          options={[
            { label: "Courses", value: "course" },
            { label: "Tests", value: "test" },
          ]}
          value={selectedTypes}
          onChange={(checked) => setSelectedTypes(checked as CheckboxValueType[])}
          className="flex flex-col gap-2 mb-6"
        />

        {/* Categories */}
        <h3 className="text-md font-semibold mb-3">{cours.Categories}</h3>
        <ul className="space-y-2">
          <li
            className={`cursor-pointer ${
              selectedCategory === "All"
                ? "text-[var(--section-primary)] font-bold"
                : ""
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            {cours.All}
          </li>
          {categories.map((cat:any) => (
            <li
              key={cat}
              className={`cursor-pointer ${
                selectedCategory === cat
                  ? "text-[var(--section-primary)] font-bold"
                  : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course:any) => (
            <Link href="/tests" key={course.id}>
              <Card
                hoverable
                className="flex flex-col h-full"
                cover={
                  <img
                    src={course.img}
                    alt={course.title}
                    className="h-48 w-full object-cover rounded-t-lg"
                  />
                }
              >
                <Card.Meta
                  title={course.title}
                  description={course.description}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Category: {course.category} | Type:{" "}
                  {course.type === "course" ? "Course" : "Test"}
                </p>
              </Card>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
           {cours.NoResultsFound}
          </p>
        )}
      </main>
    </div>
  );
}
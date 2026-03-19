"use client";

import React, { useState } from "react";
import { Card, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

/** --- Types --- */
type Review = {
  id: number;
  name: string;
  image: string;
  review: string;
};

type ReviewDict = {
  title: string;
  reviews: Review[];
};

type Dict = {
  reviewSection: ReviewDict;
};

type ReviewCarouselProps = {
  dict: Dict;
};

/** --- Component --- */
export default function ReviewCarousel({ dict }: ReviewCarouselProps) {
  const reviews = dict.reviewSection.reviews;
  const [index, setIndex] = useState(0);

  const prev = () => setIndex(index === 0 ? reviews.length - 1 : index - 1);
  const next = () => setIndex(index === reviews.length - 1 ? 0 : index + 1);

  return (
    <section className="w-full py-12 px-4 bg-purple-100 flex flex-col items-center text-center">
      <h2 className="text-3xl font-bold text-purple-700 mb-8">
        {dict.reviewSection.title}
      </h2>

      <Card
        className="relative max-w-lg w-full shadow-xl rounded-2xl"
        styles={{ body: { padding: "2rem" } }}
      >
        {/* Image */}
        <div className="flex justify-center mb-4">
          <img
            src={reviews[index].image}
            alt={reviews[index].name}
            width={100}
            height={100}
            className="rounded-full border-4 border-purple-600 object-cover"
          />
        </div>

        {/* Review Text */}
        <p className="text-gray-600 italic mb-4">
          &quot;{reviews[index].review}&quot;
        </p>

        {/* Reviewer Name */}
        <h4 className="font-semibold text-purple-700 mb-2">
          {reviews[index].name}
        </h4>

        {/* Navigation Buttons */}
        <Button
          shape="circle"
          icon={<LeftOutlined />}
          onClick={prev}
          className="!absolute top-1/2 -left-6 transform -translate-y-1/2 bg-purple-600 text-white hover:bg-purple-700"
        />
        <Button
          shape="circle"
          icon={<RightOutlined />}
          onClick={next}
          className="!absolute top-1/2 -right-6 transform -translate-y-1/2 bg-purple-600 text-white hover:bg-purple-700"
        />
      </Card>
    </section>
  );
}

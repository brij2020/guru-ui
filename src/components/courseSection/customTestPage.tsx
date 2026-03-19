"use client";

import { Carousel, Card } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRef } from "react";
// import { useCart } from "@/components/cartContext";

const { Meta } = Card;

export default function CustomTestPage({title1, title2, subtitle, dentistTests, viewAll, startTest}:any) {
  const carouselRef = useRef<any>(null);
  // const { addToCart } = useCart();
  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();

  return (
    <section className="py-12 bg-[var(--section-bg-1)] text-[var(--section-text)] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {title1}{" "}
              <span className="text-[var(--section-primary)]">{title2}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          </div>
          <Link
            href="/courses"
            className="text-[var(--section-primary)] hover:underline text-sm flex items-center gap-1"
          >
            {viewAll} →
          </Link>
        </div>

        {/* Custom Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-10 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
        >
          <LeftOutlined />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-10 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
        >
          <RightOutlined />  
        </button>

        {/* Carousel */} 
        <Carousel
          ref={carouselRef}
          dots={false}
          slidesToShow={3}
          infinite={false}
          responsive={[
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } },
          ]}
        >
          {dentistTests.map((test:any, idx:any) => (
            <div key={idx} className="px-2">
              <Card
                hoverable
                style={{ cursor: "default" }}
                className="rounded-xl shadow-sm transition "
                cover={
                  <div className="w-full aspect-[16/9] overflow-hidden rounded-t-xl">
                    <img
                      src={test.img}
                      alt={test.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                }
              >
              <Meta
                title={test.title}
                description={
                  <div className="space-y-1">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {test.description}
                    </p>
                    {/* <p className="text-sm font-medium text-gray-900 ">
                      Instructor: {test.createdBy}
                    </p>
                    <p className="text-sm font-semibold text-[var(--section-primary)]">
                      ${test.price}
                    </p> */}
                  </div>
                }/>
                {/* Buy Now button */}
                <Link href="/tests">
                  <button
                    // onClick={() => addToCart(test)}
                    className="mt-3 inline-block bg-[var(--section-primary)] text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition hover:cursor-pointer"
                  >
                    {startTest}
                  </button>
                </Link>
              </Card>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

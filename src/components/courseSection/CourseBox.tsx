import React from "react";
import { Card, Button, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import SkeletonImage from "../SkeltonImage";

const { Meta } = Card;

type CoursesBoxProps = {
  sectionData: any[];
  cart: any[]; 
  onAddToCart: (course: any) => void;
  dict: any;
};

function CoursesBox({ sectionData, cart = [], onAddToCart, dict }: CoursesBoxProps) {

  const handleAdd = (course: any) => {
    const alreadyAdded = cart.some((item) => item.id === course.id);

    if (alreadyAdded) {
      message.warning("Course already added to cart");
      return;
    }

    onAddToCart(course);
    message.success("Course added to cart");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sectionData.map((course) => (
        <Card
          key={course.id}
          hoverable
          style={{ cursor: "default" }}
          className="rounded-xl hover:shadow-lg transition"
          cover={
            <div className="w-full h-48 overflow-hidden rounded-t-xl">
              <SkeletonImage
                src={course.img}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          }
        >
          <Meta
            title={course.title}
            description={
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Author: {course.createdBy}
                </p>
                <p className="text-xs mt-1 line-clamp-2">
                  {course.description}
                </p>
                <p className="font-semibold text-[var(--section-primary)] mt-2">
                  AED {course.price}
                </p>
              </div>
            }
          />

          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleAdd(course)}         // ⬅ UPDATED
              className="!bg-[var(--section-primary)] !text-white !border-none hover:!bg-purple-700 !px-4 !py-2 !rounded-md"
            >
              {dict.buttonText.addtoCart}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default CoursesBox;

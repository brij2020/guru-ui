"use client";

import { useCart } from "@/components/cartContext";
import { Button, Empty, Input, message, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import visa from '@/../../public/images/visa.webp'
import mastercard from '@/../../public/images/mastercard.webp'
import paypal from '@/../../public/images/paypal.webp'

export default function CartPage({dict,lang}:any) {
  const cartText = dict.cart;
  const { cartItems, removeFromCart } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      message.warning(cartText.emptyCart);
      return;
    }
    message.success(cartText.checkout);
  };

  const handleRemove = (index: number) => {
    removeFromCart(index);
    message.success(cartText.removeText);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left - Items (70%) */}
        <div className="lg:col-span-7 bg-white dark:bg-[var(--content-bg)] border rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{cartText.shoppingCart}</h1>
            <Link href="/" className="text-sm text-[var(--section-primary)] hover:underline">
              {cartText.continueShopping}
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <Empty description={cartText.emptyCart} />
          ) : (
            <div className="space-y-6">
              {cartItems.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="flex items-start gap-4 pb-4 border-b relative">
                  {/* image */}
                  <div className="w-28 h-20 relative flex-shrink-0">
                    <img
                      src={item.img || "/images/placeholder.png"}
                      alt={item.title}
                      // fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* details */}
                  <div className="flex-1 pr-4">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <div><strong>{cartText.Instructor}:</strong> {item.createdBy || "Unknown"}</div>
                      <div><strong>{cartText.Duration}:</strong> {item.duration} {cartText.mins}</div>
                    </div>
                  </div>

                  {/* price + remove */}
                  <div className="flex flex-col items-end ">
                    <Popconfirm
                      title={cartText.removeItemCart}
                      onConfirm={() => handleRemove(idx)}
                      okText={cartText.Yes}
                      cancelText={cartText.No}
                    >
                      <button
                        aria-label="Remove item"
                        className="mt-3 text-gray-400 hover:text-red-600"
                        type="button"
                      >
                        <CloseOutlined />
                      </button>
                    </Popconfirm>
                     <div className="text-lg font-semibold text-[var(--section-primary)]">
                      ${Number(item.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right - Summary (30%) */}
        <aside className="lg:col-span-3">
          {/* Sticky on large screens, normal flow on small screens */}
          <div className="lg:sticky lg:top-24">
            <div className="border rounded-xl shadow-lg p-6 bg-white dark:bg-[var(--content-bg)]">
              <h2 className="text-xl font-semibold mb-4">{cartText.Summary}</h2>

              <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-2">
                <span>{cartText.Subtotal}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-2">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>{cartText.OrderTotal}</span>
                <span className="text-[var(--section-primary)]">${total.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 mb-4">
                <Input placeholder="Coupon Code" />
                <Button type="default">{cartText.Apply}</Button>
              </div>

              <Link href={`/${lang}/checkout`}>
                <Button type="primary" size="large" block className="bg-[var(--section-primary)]">
                  {cartText.ProceedtoCheckout}
                </Button>
              </Link>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">{cartText.OR}</div>

              <div className="flex justify-center gap-3 mt-4">
                <Image src={paypal} alt="PayPal" className="h-10 w-auto" width={1024} height={559}/>
                <Image src={visa} alt="Visa" className="h-10 w-auto" width={1024} height={559}/>
                <Image src={mastercard} alt="Mastercard" className="h-10 w-auto" width={1024} height={559}/>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

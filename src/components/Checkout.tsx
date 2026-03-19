"use client";
import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  Checkbox,
  Form,
  Result,
  Space,
  Divider,
  Tag,
  message,
  Alert,
} from "antd";
import {
  CreditCardOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useCart } from "@/components/cartContext";
import {
  CheckoutFormData,
  CheckoutErrors,
  CheckoutStep,
} from "@/utils/data/types/cart";

const GST_RATE = 0.18;

export default function Checkout ({dict, lang}:any) {
  const checkout = dict.checkout.text
  const receiptText = dict.checkout.paymentSlip
  const router = useRouter();
  const { cartItems, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("form");
  const [form] = Form.useForm();
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill(""));
  const [otpError, setOtpError] = useState<string>("");
  const [purchasedItems, setPurchasedItems] = useState(cartItems); // Store items before clearing cart
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const gst = subtotal * GST_RATE;
  const totalAmount = Number((subtotal + gst).toFixed(2));

  const onlyDigits = (s: string): string => s.replace(/\D/g, "");

  // Form validation
  const validateForm = useCallback((): boolean => {
    const values = form.getFieldsValue();
    const newErrors: CheckoutErrors = {};

    if (!values.name?.trim()) newErrors.name = checkout.checkText;

    const digitsCard = onlyDigits(values.card || "");
    if (!digitsCard || digitsCard.length < 12 || digitsCard.length > 19) {
      newErrors.card = checkout.fname;
    }

    const exp = values.expiry?.trim() || "";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
      newErrors.expiry = checkout.expiry;
    }

    // Changed from 3-4 digits to exactly 3 digits
    if (!/^\d{3}$/.test(values.cvv || "")) {
      newErrors.cvv = checkout.cvv;
    }

    if (!values.terms) newErrors.terms = checkout.tc;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Submit payment
  const handleFormSubmit = async (values: CheckoutFormData) => {
    if (!validateForm()) return;

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setOtpValues(new Array(6).fill(""));
    setOtpError("");
    setStep("otp");

    // Store purchased items before clearing cart
    setPurchasedItems([...cartItems]);

    // Wait until step updates, then show OTP
    setTimeout(() => {
      alert(`Demo OTP: ${otp}`);
      otpRefs.current[0]?.focus();
    }, 200);
  };

  // OTP logic
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = "";
      setOtpValues(newOtpValues);
    }
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpValues.join("");
    if (entered.length < 6) return setOtpError(checkout.code);
    if (entered !== generatedOtp) return setOtpError(checkout.try);

    setOtpError("");
    setStep("success");
    clearCart();
  };

  const resendOtp = () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setOtpValues(new Array(6).fill(""));
    setOtpError("");

    setTimeout(() => {
      alert(`New demo OTP: ${otp}`);
      otpRefs.current[0]?.focus();
    }, 200);
  };

  // Download receipt as PDF
  // Download receipt as PDF
  const handleDownloadReceipt = async () => {
    const itemsToDisplay = purchasedItems.length > 0 ? purchasedItems : cartItems;

    if (itemsToDisplay.length === 0) {
      message.error(checkout.notItem);
      return;
    }

    const receiptSubtotal = itemsToDisplay.reduce((acc, item) => acc + item.price, 0);
    const receiptGst = receiptSubtotal * GST_RATE;
    const receiptTotal = Number((receiptSubtotal + receiptGst).toFixed(2));

    try {
      message.loading({ content: "Generating receipt...", key: "receipt", duration: 0 });

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Create receipt container (make it visible off-screen, not opacity: 0)
      const receiptDiv = document.createElement("div");
      receiptDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: -9999px;
        width: 600px;
        background: white;
        color: #1f2937;
        padding: 32px;
        font-family: system-ui, sans-serif;
        line-height: 1.6;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 10000;
      `;

      receiptDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0 0 16px 0;">${receiptText.heading}</h1>
        </div>

        <div style="border-bottom: 1px solid #d1d5db; margin-bottom: 16px; padding-bottom: 8px;">
          <p style="margin: 4px 0;"><strong>${receiptText.date}</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 4px 0;"><strong>${receiptText.time}</strong> ${new Date().toLocaleTimeString()}</p>
          <p style="margin: 4px 0;"><strong>${receiptText.trans}</strong> ${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}</p>
        </div>

        <h2 style="font-size: 18px; font-weight: 600; color: #2563eb; border-bottom: 1px solid #d1d5db; margin-bottom: 12px; padding-bottom: 4px;">${receiptText.purchased}</h2>

        ${itemsToDisplay
          .map(
            (item) => `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <div>
              <p style="font-weight: 600; margin: 0;">${item.title || item.name}</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">${item.createdBy || receiptText.inst}</p>
            </div>
            <p style="font-weight: 600; color: #3b82f6; margin: 0;">$${(item.price || 0).toFixed(2)}</p>
          </div>
        `
          )
          .join("")}

        <div style="margin-top: 16px; border-top: 1px solid #d1d5db; padding-top: 8px;">
          <p style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Subtotal:</span>
            <span>$${receiptSubtotal.toFixed(2)}</span>
          </p>
          <p style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>GST (18%):</span>
            <span>$${receiptGst.toFixed(2)}</span>
          </p>
          <p style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #2563eb; margin: 8px 0 0 0;">
            <span>Total:</span>
            <span>$${receiptTotal.toFixed(2)}</span>
          </p>
        </div>

        <div style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 24px; border-top: 1px solid #d1d5db; padding-top: 16px;">
          <p style="margin: 4px 0;">${receiptText.thankText}</p>
          <p style="color: #2563eb; font-weight: 600; margin: 4px 0;">Happy Learning!</p>
        </div>
      `;

      document.body.appendChild(receiptDiv);

      // Wait for styles and layout to render
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`receipt-${Date.now()}.pdf`);

      document.body.removeChild(receiptDiv);
      message.success({ content: "Receipt downloaded successfully!", key: "receipt" });
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error({ content: "Failed to download receipt. Please try again.", key: "receipt" });
    }
  };

  const handleBackToCourses = () => router.push("/");

  // Confetti effect
  const Confetti: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-5 rounded-sm opacity-90 animate-bounce
            ${i % 6 === 0 ? "bg-red-400" : ""}
            ${i % 6 === 1 ? "bg-yellow-400" : ""}
            ${i % 6 === 2 ? "bg-green-400" : ""}
            ${i % 6 === 3 ? "bg-blue-400" : ""}
            ${i % 6 === 4 ? "bg-purple-400" : ""}
            ${i % 6 === 5 ? "bg-pink-400" : ""}`}
          style={{
            left: `${8 + i * 4}%`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${2 + i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  // Empty cart
  if (cartItems.length === 0 && step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <Result
            status="info"
            title= {checkout.empty}
            subTitle={checkout.addItemMsg}
            extra={
              <Button type="primary" onClick={() => router.push("/")}>
                {checkout.browse}
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4 py-8">
      {/* Payment form */}
      {step === "form" && (
        <Card
          className="w-full max-w-md shadow-xl border-0"
          styles={{ body: { padding: "24px" } }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CreditCardOutlined /> {checkout.pay}
            </h3>
            <Tag color="orange" className="text-base font-semibold py-1 px-3">
              ${totalAmount.toFixed(2)}
            </Tag>
          </div>

          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="name"
              label={checkout.card}
              validateStatus={errors.name ? "error" : ""}
              help={errors.name}
            >
              <Input size="large" placeholder={checkout.cardName} />
            </Form.Item>

            <Form.Item
              name="card"
              label={checkout.cardNum}
              validateStatus={errors.card ? "error" : ""}
              help={errors.card}
              getValueFromEvent={(e) => {
                let digits = onlyDigits(e.target.value).slice(0, 16);
                return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
              }}
            >
              <Input
                size="large"
                placeholder={checkout.valid}
                maxLength={19}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="expiry"
                label={checkout.exp}
                validateStatus={errors.expiry ? "error" : ""}
                help={errors.expiry}
                getValueFromEvent={(e) => {
                  let value = onlyDigits(e.target.value).slice(0, 4);
                  if (value.length > 2)
                    value = value.slice(0, 2) + "/" + value.slice(2);
                  return value;
                }}
              >
                <Input
                  size="large"
                  placeholder="MM/YY"
                  maxLength={5}
                  inputMode="numeric"
                />
              </Form.Item>

              <Form.Item
                name="cvv"
                label={checkout.cvvN}
                validateStatus={errors.cvv ? "error" : ""}
                help={errors.cvv}
                getValueFromEvent={(e) =>
                  onlyDigits(e.target.value).slice(0, 3)
                }
              >
                <Input.Password size="large" placeholder={checkout.cvvN} maxLength={3} />
              </Form.Item>
            </div>

            <Form.Item
              name="terms"
              valuePropName="checked"
              validateStatus={errors.terms ? "error" : ""}
              help={errors.terms}
            >
              <Checkbox>
                {checkout.iAccept}{" "}
                <a href="#privacy" className="text-purple-600">
                  {checkout.termP}
                </a>
              </Checkbox>
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block>
              {checkout.validate}
            </Button>

            <Divider dashed>{checkout.payMethod}</Divider>
            <div className="flex flex-wrap gap-2 justify-center">
              {[checkout.visa, checkout.masterCard, checkout.gpay, checkout.aPay].map((m) => (
                <Tag key={m} color="blue">
                  {m}
                </Tag>
              ))}
            </div>
          </Form>
        </Card>
      )}

      {/* OTP */}
      {step === "otp" && (
        <Card
          className="w-full max-w-md shadow-xl border-0 text-center"
          bodyStyle={{ padding: "24px" }}
        >
          <SafetyCertificateOutlined className="text-4xl text-blue-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">{checkout.otp}</h3>
          <form onSubmit={submitOtp} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  maxLength={1}
                  inputMode="numeric"
                  className="w-12 h-14 border rounded-md text-center text-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
            {otpError && <Alert message={otpError} type="error" showIcon />}
            <Space direction="vertical" className="w-full">
              <Button type="primary" htmlType="submit" size="large">
                {checkout.subm}
              </Button>
              <Button type="link" onClick={resendOtp}>
                {checkout.resend}
              </Button>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => setStep("form")}
              >
                {checkout.backto}
              </Button>
            </Space>
          </form>
        </Card>
      )}

      {/* Success */}
      {step === "success" && (
        <div className="relative w-full max-w-2xl">
          <Card
            className="shadow-2xl border-0 text-center relative z-10"
            bodyStyle={{ padding: "40px" }}
          >
            <Result
              icon={<CheckCircleOutlined className="text-green-500" />}
              status="success"
              title="Transaction Successful!"
              subTitle={`Your payment of $${totalAmount.toFixed(
                2
              )} has been processed successfully.`}
              extra={[
                <Button
                  key="courses"
                  type="primary"
                  size="large"
                  onClick={handleBackToCourses}
                >
                  {checkout.backtoC}
                </Button>,
                <Button
                  key="receipt"
                  icon={<DownloadOutlined />}
                  size="large"
                  onClick={handleDownloadReceipt}
                >
                  {checkout.downRec}
                </Button>,
              ]}
            />
          </Card>
          <Confetti />
        </div>
      )}
    </div>
  );
};

// import { getDictionary } from "@/app/[lang]/dictionaries";
import { getDictionary } from "../../[lang]/dictionaries";
import Checkout from "@/components/Checkout";

export default async function CheckoutPage({params}: {params: Promise<{ lang: "en" | "hi" }>}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Checkout dict={dict} lang={lang} />
    </>
  );
}
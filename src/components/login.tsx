// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { medcertusers, MedCertUsers } from "@/utils/userdata/medcertusers";

// const LOCAL_STORAGE_KEY = "medCert";

// interface LoginProps {
//   dict: any;
// }

// const LoginForm: React.FC<LoginProps> = ({ dict }) => {
//   const router = useRouter();
//   const { lang } = useParams();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [welcomeText, setWelcomeText] = useState("");
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//     const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setWelcomeText(
//         dict?.Logins?.welcome?.[user.role] || dict?.Logins?.welcome?.default
//       );
//     } else {
//       setWelcomeText(dict?.Logins?.welcome?.default);
//     }
//   }, [dict]);

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg("");
//     setSuccessMsg("");

//     // Find user from medcertusers
//     const user: MedCertUsers | undefined = medcertusers.find(
//       (u) =>
//         u.email.toLowerCase() === email.toLowerCase() &&
//         u.password === password
//     );

//     if (!user) {
//       setErrorMsg(dict?.Logins?.errorMsgs || "Invalid email or password");
//       return;
//     }

//     // Simplify role: admin stays admin, others become user
//     const simplifiedRole = user.role === "admin" ? "admin" : "user";

//     // Save full user in localStorage
//     localStorage.setItem(
//       LOCAL_STORAGE_KEY,
//       JSON.stringify({ ...user, role: simplifiedRole })
//     );

//     setSuccessMsg(dict?.Logins?.successMsgs || "Login successful!");

//     // Redirect to dashboard
//     setTimeout(() => {
//       router.push(`/${lang}/${simplifiedRole}/dashboard`);
//     }, 500);
//   };

//   return (
//     <section className="min-h-auto pt-12 bg-[var(--section-bg-1)] text-[var(--section-text)]">
//       <div className="grid lg:grid-cols-2 justify-center max-w-7xl mx-auto px-4 py-12 gap-12">
//         {/* Left side: Info text */}
//         <div className="space-y-6">
//           <h2 className="text-3xl font-bold">{dict?.Logins?.head}</h2>
//           <p>{dict?.Logins?.para}</p>
//           <ul className="list-disc pl-12">
//             <li>{dict?.Logins?.list1}</li>
//             <li>{dict?.Logins?.list2}</li>
//             <li>{dict?.Logins?.list3}</li>
//           </ul>
//         </div>

//         {/* Right side: Login form */}
//         <div className="w-full max-w-md mx-auto">
//           <div className="text-2xl font-semibold text-center mb-6">
//             {isClient ? welcomeText : dict?.Logins?.welcome?.default}
//           </div>
//           <div className="rounded-lg shadow border border-[var(--section-border)] bg-[var(--section-bg-2)] text-[var(--section-text)]">
//             <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
//               <form
//                 className="space-y-4 md:space-y-6"
//                 onSubmit={handleLogin}
//               >
//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block mb-2 text-sm font-medium"
//                   >
//                     {dict?.Logins?.email}
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     id="email"
//                     placeholder="name@company.com"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="block w-full p-2.5 rounded-lg bg-[var(--section-bg-1)] border border-[var(--section-border)] text-[var(--section-text)] placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="password"
//                     className="block mb-2 text-sm font-medium"
//                   >
//                     {dict?.Logins?.password}
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     id="password"
//                     placeholder="••••••••"
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="block w-full p-2.5 rounded-lg bg-[var(--section-bg-1)] border border-[var(--section-border)] text-[var(--section-text)] placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   />
//                 </div>

//                 {successMsg && (
//                   <div className="text-green-600 text-center font-medium">
//                     {successMsg}
//                   </div>
//                 )}
//                 {errorMsg && (
//                   <div className="text-red-600 text-center font-medium">
//                     {errorMsg}
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   className="w-full bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none focus:ring-blue-300"
//                 >
//                   {dict?.Logins?.button4}
//                 </button>

//                 <p className="text-sm font-light text-[var(--section-text-muted)]">
//                   {dict?.Logins?.para1}{" "}
//                   <a
//                     href="#"
//                     className="font-medium text-blue-500 hover:underline"
//                   >
//                     {dict?.Logins?.atri1}
//                   </a>
//                 </p>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default LoginForm;

// import { defineProperties } from "figma:react";

// export default function LoginForm({ 
//   title, 
//   subtitle, 
//   emailLabel, 
//   emailPlaceholder, 
//   passwordLabel, 
//   passwordPlaceholder, 
//   forgotPasswordText, 
//   submitText, 
//   orText, 
//   googleText, 
//   registerText, 
//   registerLinkText 
// }) {
//   return (
//     <div className="w-full max-w-md space-y-8 bg-white p-8">
//       {/* Error Message */}
//       <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm hidden">
//         Email ou mot de passe incorrect
//       </div>

//       {/* Title Section */}
//       <div className="space-y-2 text-center">
//         <h2 className="text-3xl font-semibold" style={{ color: "#73442A" }}>
//           {title}
//         </h2>
//         <p className="text-sm" style={{ color: "#6B7280" }}>
//           {subtitle}
//         </p>
//       </div>

//       {/* Form */}
//       <div className="space-y-4">
//         {/* Email Field */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium" style={{ color: "#73442A" }}>
//             {emailLabel}
//           </label>
//           <input
//             type="email"
//             placeholder={emailPlaceholder}
//             className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
//           />
//         </div>

//         {/* Password Field */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium" style={{ color: "#73442A" }}>
//             {passwordLabel}
//           </label>
//           <div className="relative">
//             <input
//               type="password"
//               placeholder={passwordPlaceholder}
//               className="w-full h-12 px-4 pr-10 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
//             />
//             <button className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600">
//               👁️
//             </button>
//           </div>
//         </div>

//         {/* Forgot Password Link */}
//         <div className="flex justify-end">
//           <a href="#" className="text-sm hover:opacity-80" style={{ color: "#F97316" }}>
//             {forgotPasswordText}
//           </a>
//         </div>

//         {/* Submit Button */}
//         <button
//           className="w-full h-12 text-sm font-medium text-white bg-orange-500 hover:opacity-90 rounded-lg"
//         >
//           {submitText}
//         </button>
//       </div>

//       {/* Divider */}
//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full border-t border-gray-200" />
//         </div>
//         <div className="relative flex justify-center text-xs uppercase">
//           <span className="bg-white px-2" style={{ color: "#6B7280" }}>
//             {orText}
//           </span>
//         </div>
//       </div>

//       {/* Google Button */}
//       <button className="w-full h-12 border border-gray-200 hover:bg-gray-50 rounded-lg bg-white flex items-center justify-center gap-2">
//         <svg className="w-5 h-5" viewBox="0 0 24 24">
//           <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//           <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//           <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//           <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//         </svg>
//         {googleText}
//       </button>

//       {/* Register Link */}
//       <div className="text-center text-sm" style={{ color: "#6B7280" }}>
//         {registerText}{" "}
//         <a href="#" className="hover:opacity-80 font-medium" style={{ color: "#F97316" }}>
//           {registerLinkText}
//         </a>
//       </div>
//     </div>
//   );
// }

// defineProperties(LoginForm, {
//   title: {
//     label: "Title",
//     type: "string",
//     defaultValue: "Bienvenue",
//   },
//   subtitle: {
//     label: "Subtitle",
//     type: "string",
//     defaultValue: "Entrez votre email et mot de passe pour accéder à votre compte.",
//   },
//   emailLabel: {
//     label: "Email Label",
//     type: "string",
//     defaultValue: "Email",
//   },
//   emailPlaceholder: {
//     label: "Email Placeholder",
//     type: "string",
//     defaultValue: "utilisateur@exemple.com",
//   },
//   passwordLabel: {
//     label: "Password Label",
//     type: "string",
//     defaultValue: "Mot de passe",
//   },
//   passwordPlaceholder: {
//     label: "Password Placeholder",
//     type: "string",
//     defaultValue: "Entrez votre mot de passe",
//   },
//   forgotPasswordText: {
//     label: "Forgot Password Text",
//     type: "string",
//     defaultValue: "Mot de passe oublié ?",
//   },
//   submitText: {
//     label: "Submit Button Text",
//     type: "string",
//     defaultValue: "Se connecter",
//   },
//   orText: {
//     label: "Or Text",
//     type: "string",
//     defaultValue: "Ou se connecter avec",
//   },
//   googleText: {
//     label: "Google Button Text",
//     type: "string",
//     defaultValue: "Google",
//   },
//   registerText: {
//     label: "Register Text",
//     type: "string",
//     defaultValue: "Pas encore de compte ?",
//   },
//   registerLinkText: {
//     label: "Register Link Text",
//     type: "string",
//     defaultValue: "S'inscrire maintenant.",
//   },
// });

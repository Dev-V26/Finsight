// import { BrowserRouter } from "react-router-dom";
// import AppRoutes from "./routes";
// import { AuthProvider } from "./context/AuthContext";
// import { SettingsProvider } from "./context/SettingsContext";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <SettingsProvider>
//           <AppRoutes />
//         </SettingsProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

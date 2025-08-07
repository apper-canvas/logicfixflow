import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Jobs from "@/components/pages/Jobs";
import Clients from "@/components/pages/Clients";
import ClientDetail from "@/components/pages/ClientDetail";
import Services from "@/components/pages/Services";
import Calendar from "@/components/pages/Calendar";
import Reports from "@/components/pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-slate-50 min-h-screen">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="services" element={<Services />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
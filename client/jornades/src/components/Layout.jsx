import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AppSidebar from "./ui/AppSidebar";

// Component principal de presentació (estructura de la pàgina)
export default function Layout() {
  // Estat per controlar si el menú lateral està obert (en pantalles petites)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Menú lateral de navegació */}
      <AppSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Contingut principal a la dreta del menú lateral */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Capçalera de la pàgina */}
        <Header 
          onToggleSidebar={() => setSidebarOpen((s) => !s)} 
        />
        
        {/* Aquí es renderitzen les pàgines filles definides a les rutes (Outlet) */}
        <main className="flex-1 px-4 py-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
        
        {/* Peu de pàgina */}
        <Footer />
      </div>
    </div>
  );
}

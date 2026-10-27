import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-6 pb-12">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;

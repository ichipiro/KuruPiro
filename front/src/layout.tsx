import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";

function useRedirect() {
  const [isRedirected, setIsRedirected] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const url = window.location.href;
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const targetPath = params.get("path");
    if (targetPath != null) {
      setIsRedirected(true);
      navigate(targetPath);
    }
  }, [navigate]);
  return isRedirected;
}

const Layout = () => {
  useRedirect();
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;

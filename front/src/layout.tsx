import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

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
  const location = useLocation();

  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
    // initialize analytics once
    import("./analytics").then(({ initGA, logPageView }) => {
      initGA();
      // log initial page
      logPageView(location.pathname + location.search);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
    // log page view on route change
    import("./analytics").then(({ logPageView }) => {
      logPageView(location.pathname + location.search);
    });
  }, [location]);
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

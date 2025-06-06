import React from "react";
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";
import routes from "routes.js";

var ps;

function Admin(props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const [backgroundColor, setBackgroundColor] = React.useState("black");
  const [activeColor, setActiveColor] = React.useState("info");
  const [sidebarMini, setSidebarMini] = React.useState(false);
  const mainPanel = React.useRef();

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanel.current);
    }
    return () => {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.className += " perfect-scrollbar-off";
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) =>
    routes.map((prop, key) => {
      if (prop.collapse) return getRoutes(prop.views);
      if (prop.layout === "/admin") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      }
      return null;
    });

  return (
    <div className="wrapper">
      <Sidebar
        {...props}
        routes={routes}
        bgColor={backgroundColor}
        activeColor={activeColor}
      />
      <div className="main-panel" ref={mainPanel}>
        <AdminNavbar {...location} handleMiniClick={() => {
          setSidebarMini(!sidebarMini);
          document.body.classList.toggle("sidebar-mini");
        }} />
        <Routes>{getRoutes(routes)}</Routes>
        {
          location.pathname.indexOf("full-screen-map") !== -1 ? null : (
            <Footer fluid />
          )
        }
      </div>
      {/* <FixedPlugin
        bgColor={backgroundColor}
        activeColor={activeColor}
        sidebarMini={sidebarMini}
        handleActiveClick={setActiveColor}
        handleBgClick={setBackgroundColor}
        handleMiniClick={() => {
          setSidebarMini(!sidebarMini);
          document.body.classList.toggle("sidebar-mini");
        }}
      /> */}
    </div>
  );
}

export default Admin;


import React from "react";
import { Link } from "react-router-dom";
import { Nav, Collapse } from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";


import vile from "assets/img/darktheme.png";
import logo from "assets/img/vile-logo.png";
import { useAuth } from "context/AuthContext";
import './../Sidebar/sidebar.css';

var ps;

function Sidebar(props) {
  const [openAvatar, setOpenAvatar] = React.useState(false);
  const [collapseStates, setCollapseStates] = React.useState({});
  const sidebar = React.useRef();
  const { user } = useAuth();

  const userRoles = user?.groups || [];

  const hasAccess = (routeRoles) => {
    if (!routeRoles) return true; // si no se define, todos pueden
    return routeRoles.some((role) => userRoles.includes(role));
  };

  // this creates the intial state of this component based on the collapse routes
  // that it gets through props.routes
  const getCollapseStates = (routes) => {
    let initialState = {};
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: getCollapseInitialState(prop.views),
          ...getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.js - route /admin/regular-forms
  const getCollapseInitialState = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.pathname.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  };
  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (!hasAccess(prop.roles)) return null;

      if (prop.collapse) {
        const visibleSubRoutes = prop.views.filter((view) => hasAccess(view.roles));
        if (visibleSubRoutes.length === 0) return null;

        var st = {};
        st[prop["state"]] = !collapseStates[prop.state];
        return (
          <li className={getCollapseInitialState(visibleSubRoutes) ? "active" : ""} key={key}>
            <a
              href="#pablo"
              data-toggle="collapse"
              aria-expanded={collapseStates[prop.state]}
              onClick={(e) => {
                e.preventDefault();
                setCollapseStates(st);
              }}
            >
              {prop.icon !== undefined ? (
                <>
                  <i className={prop.icon} />
                  <p>{prop.name}<b className="caret" /></p>
                </>
              ) : (
                <>
                  <span className="sidebar-mini-icon">{prop.mini}</span>
                  <span className="sidebar-normal">{prop.name}<b className="caret" /></span>
                </>
              )}
            </a>
            <Collapse isOpen={collapseStates[prop.state]}>
              <ul className="nav">{createLinks(visibleSubRoutes)}</ul>
            </Collapse>
          </li>
        );
      }

      if (prop.invisible) return null;

      return (
        <li className={activeRoute(prop.layout + prop.path)} key={key}>
          <Link to={prop.layout + prop.path}>
            {prop.icon !== undefined ? (
              <>
                <i className={prop.icon} />
                <p>{prop.name}</p>
              </>
            ) : (
              <>
                <span className="sidebar-mini-icon">{prop.mini}</span>
                <span className="sidebar-normal">{prop.name}</span>
              </>
            )}
          </Link>
        </li>
      );
    });
  };

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  React.useEffect(() => {
    // if you are using a Windows Machine, the scrollbars will have a Mac look
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      // we need to destroy the false scrollbar when we navigate
      // to a page that doesn't have this component rendered
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });
  React.useEffect(() => {
    setCollapseStates(getCollapseStates(props.routes));
  }, []);
  return (
    <div className="sidebar custom-sidebar"
    >
      <div className="logo">
        <a
          href="/admin/dashboard"
          className="simple-text logo-mini"
        >
          <div className="logo-img">
            <img src={logo} alt="vile-logo" />
          </div>
        </a>
        <a href="/admin/dashboard" className="simple-text logo-normal">
          <img
            src={logo}
            alt="Vilé Logo"
            style={{
              width: "90px",
              height: "auto",

            }}
          />
        </a>
      </div>

      <div className="sidebar-wrapper" ref={sidebar}>
        <div className="user">
          <div className="photo">
            <img src={vile} alt="vile" />
          </div>
          <div className="info">
            <a
              href="#pablo"
              data-toggle="collapse"
              aria-expanded={openAvatar}
              onClick={() => setOpenAvatar(!openAvatar)}
            >
              <span>
                {user?.first_name} {user?.last_name}

                {/* <b className="caret" /> */}
              </span>
            </a>
            {/* <Collapse isOpen={openAvatar}>
              <ul className="nav">
                <li>
                  <Link to="/admin/user-profile">
                    <span className="sidebar-mini-icon">MP</span>
                    <span className="sidebar-normal">My Profile</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/user-profile">
                    <span className="sidebar-mini-icon">EP</span>
                    <span className="sidebar-normal">Edit Profile</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/user-profile">
                    <span className="sidebar-mini-icon">S</span>
                    <span className="sidebar-normal">Settings</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/user-profile">
                    <span className="sidebar-mini-icon">R</span>
                    <span className="sidebar-normal">Reset Settings</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/user-profile">
                    <span className="sidebar-mini-icon">R</span>
                    <span className="sidebar-normal">Reset Settings</span>
                  </Link>
                </li>
              </ul>
            </Collapse> */}
          </div>
        </div>
        <Nav>{createLinks(props.routes)}</Nav>
      </div>
    </div>
  );
}

export default Sidebar;

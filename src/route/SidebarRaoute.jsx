import { lazy } from "react";
import { FaTachometerAlt, FaUsers, FaCar, FaWallet, FaUserCircle, FaMapMarkedAlt } from "react-icons/fa";

const Dashboard  = lazy(() => import("../pages/Dashboard"));
const Drivers    = lazy(() => import("../pages/Drivers"));
const Fleet      = lazy(() => import("../pages/Fleet"));
const Earnings   = lazy(() => import("../pages/Earnings"));
const Profile    = lazy(() => import("../pages/Profile"));
const LiveTracking = lazy(() => import("../pages/LiveTracking"));

const routes = [
  { path: "/dashboard",  component: Dashboard,  name: "Dashboard",          icon: FaTachometerAlt },
  { path: "/drivers",    component: Drivers,    name: "Drivers",            icon: FaUsers         },
  { path: "/fleet",      component: Fleet,      name: "Fleet Management",   icon: FaCar           },
  { path: "/earnings",   component: Earnings,   name: "Earnings & Wallet",  icon: FaWallet        },
  { path: "/profile",    component: Profile,    name: "Profile",            icon: FaUserCircle    },
  { path: "/live",       component: LiveTracking, name: "Live Tracking",      icon: FaMapMarkedAlt  },
];

export default routes;

import { useState, useMemo, useCallback, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Toaster, toast } from "sonner";
import routes from ".././route/SidebarRaoute";
import Sidebar from "../pages/Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Auth: admin object + logout
  const { admin, logout, token } = useAuth();

  const { themeColors, toggleTheme, palette, changePalette } = useTheme();
  const { currentFont, corporateFonts, changeFont } = useFont();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageTitle = useMemo(() => {
    const allRoutes = routes.flatMap(r => r.children || r);
    return allRoutes.find((route) => route.path === location.pathname)?.name || "Dashboard";
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // ✅ Logout handler: context clear + redirect to /login
  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  // ✅ Firebase FCM Integration for Vendor
  useEffect(() => {
    const setupFCM = async () => {
      try {
        if (!window.firebase || !token) return;

        // Initialize Firebase
        if (window.firebase.apps.length === 0) {
          window.firebase.initializeApp({
            apiKey: "AIzaSyDE-xxxxxxxxxxxx",
            authDomain: "collegepanel-1027b.firebaseapp.com",
            projectId: "collegepanel-1027b",
            storageBucket: "collegepanel-1027b.appspot.com",
            messagingSenderId: "305191062086",
            appId: "1:305191062086:web:64024844391696df3f27f1"
          });
        }

        const messaging = window.firebase.messaging();
        
        // Handle incoming messages while the app is in the foreground
        messaging.onMessage((payload) => {
          console.log("Foreground Message received:", payload);
          toast.info(payload.notification?.title || "Update", {
            description: payload.notification?.body || "Admin has updated your account.",
            duration: 5000,
          });
        });
        
        // Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission denied");
          return;
        }

        // Get Token
        const fcmToken = await messaging.getToken({
          vapidKey: "BCHvXyEqRxxxxxxxxxxx" 
        });

        if (fcmToken) {
          console.log("Vendor FCM Token Found:", fcmToken);
          
          // Send to Backend (Using dynamic BASE_URL and correct plural path)
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          await axios.patch(
            `${API_BASE}/api/vendors/update-fcm-token`,
            { fcmToken },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Vendor FCM Token Synced! ✅");
        }
      } catch (err) {
        console.error("FCM Setup Error:", err);
      }
    };

    if (token) {
      setupFCM();
    }
  }, [token]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: themeColors.background,
        fontFamily:
          currentFont.family ||
          'var(--app-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        routes={routes}
        currentPath={location.pathname}
        user={admin}
        logout={handleLogout}
        themeColors={themeColors}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          currentPageTitle={currentPageTitle}
          themeColors={themeColors}
          currentFont={currentFont}
          corporateFonts={corporateFonts}
          changeFont={changeFont}
          palette={palette}
          changePalette={changePalette}
          toggleTheme={toggleTheme}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-lg-0" style={{ backgroundColor: themeColors.background }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
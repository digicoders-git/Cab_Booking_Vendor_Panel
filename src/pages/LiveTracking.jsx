import { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { io } from "socket.io-client";
import { Search, MapPin, Car, WifiOff, ListFilter, User, Phone } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const mapContainerStyle = { width: "100%", height: "100%" };
const center = { lat: 26.8467, lng: 80.9462 }; // Default: Lucknow

export default function LiveTracking() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { admin } = useAuth();
  const [map, setMap] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDriverList, setShowDriverList] = useState(true);

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // ─── Initial Data Fetch ───
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Using the Mega Report API we created for all vendor data
        const res = await api("/api/vendors/reports/pure-vendor-data");
        if (res.success && res.report.driverManagement.list) {
          const initialDrivers = res.report.driverManagement.list.map(d => ({
            ...d,
            lat: d.currentLocation?.latitude || center.lat,
            lng: d.currentLocation?.longitude || center.lng,
            heading: d.currentHeading || 0,
            driverId: d.id // mapping ID for socket matching
          }));
          setDrivers(initialDrivers);
        }
      } catch (err) {
        console.error("Failed to fetch initial driver states", err);
      }
    };
    fetchInitialData();
  }, []);

  // ─── Socket Connection & Live Updates ───
  useEffect(() => {
    if (!admin?._id && !admin?.id) return;
    const vendorId = admin._id || admin.id;

    const socket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to Real-time Stream");
      // CRITICAL: Join the Vendor Specific Room
      socket.emit("join_room", { userId: vendorId, role: "vendor" });
    });

    // Listen for the CORRECT event name: driver_location_update
    socket.on("driver_location_update", (update) => {
      console.log("Live Location Received:", update);
      setDrivers((prev) => {
        const index = prev.findIndex((d) => d.driverId === update.driverId);
        if (index > -1) {
          const newDrivers = [...prev];
          newDrivers[index] = { 
            ...newDrivers[index], 
            lat: update.latitude, 
            lng: update.longitude, 
            heading: update.heading || 0 
          };
          return newDrivers;
        }
        return prev; // If driver not in initial list, we wait for next refresh or skip
      });
    });

    return () => socket.disconnect();
  }, [admin]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => 
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.phone?.includes(searchQuery)
    );
  }, [drivers, searchQuery]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    styles: [
      { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      // Optional: Premium Dark Mode or Clean Mode
      { featureType: "water", stylers: [{ color: "#e9e9e9" }, { visibility: "on" }] },
    ]
  }), []);

  if (!isLoaded) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
      
      {/* ─── Full Screen Map ─── */}
      <div className="absolute inset-0 z-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {drivers.filter(d => d.isOnline).map((driver) => (
            <Marker
              key={driver.driverId}
              position={{ lat: driver.lat, lng: driver.lng }}
              onClick={() => setSelectedDriver(driver)}
              icon={{
                // We point to a car icon that looks premium
                url: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png", // Generic car top view
                scaledSize: new window.google.maps.Size(35, 35),
                anchor: new window.google.maps.Point(17.5, 17.5),
                rotation: driver.heading || 0 // Rotation for smooth look
              }}
            />
          ))}

          {selectedDriver && (
            <InfoWindow
              position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
              onCloseClick={() => setSelectedDriver(null)}
            >
              <div className="p-3 min-w-[180px] space-y-3 bg-white rounded-lg">
                <div className="flex items-center gap-3 border-b pb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{selectedDriver.name}</p>
                    <p className="text-[10px] text-gray-400">{selectedDriver.phone}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-600 font-black uppercase bg-emerald-50 px-2 py-1 rounded">
                    Online
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">
                    HDG: {selectedDriver.heading}°
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* ─── Header Overlay Removed ─── */}

      {/* ─── Bottom Status ─── */}
      <div className="absolute bottom-10 left-10 z-10 flex items-center gap-4">
        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black uppercase text-gray-500">{drivers.filter(d => d.isOnline).length} Active</span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <span className="text-[10px] font-black uppercase text-gray-500">{drivers.filter(d => !d.isOnline).length} Offline</span>
          </div>
        </div>
      </div>

      {/* Re-center Button */}
      <button 
        onClick={() => map?.panTo(center)}
        className="absolute bottom-10 right-10 z-10 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:bg-indigo-700 transition-all transform active:scale-95 group"
        title="Re-center Map"
      >
        <MapPin size={24} className="group-hover:animate-bounce" />
      </button>

    </div>
  );
}

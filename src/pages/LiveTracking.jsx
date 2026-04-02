import { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { io } from "socket.io-client";
import { Search, MapPin, Car, User, Phone, CheckCircle2, AlertCircle, Clock, ListFilter, X } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [address, setAddress] = useState("Resolving location...");

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await api("/api/vendors/reports/pure-vendor-data");
        if (res.success && res.report.driverManagement.list) {
          const initialDrivers = res.report.driverManagement.list.map(d => ({
            ...d,
            lat: d.currentLocation?.latitude || center.lat,
            lng: d.currentLocation?.longitude || center.lng,
            heading: d.currentHeading || 0,
            driverId: d.id
          }));
          setDrivers(initialDrivers);
        }
      } catch (err) {
        console.error("Failed to fetch initial driver states", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!admin?._id && !admin?.id) return;
    const vendorId = admin._id || admin.id;

    const socket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      socket.emit("join_room", { userId: vendorId, role: "vendor" });
    });

    socket.on("driver_location_update", (update) => {
      setDrivers((prev) => {
        const index = prev.findIndex((d) => d.driverId === update.driverId);
        if (index > -1) {
          const newDrivers = [...prev];
          newDrivers[index] = {
            ...newDrivers[index],
            lat: update.latitude,
            lng: update.longitude,
            heading: update.heading || 0,
            isOnline: true
          };
          return newDrivers;
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, [admin]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone?.includes(searchQuery);
      const matchesStatus = statusFilter === "All" ||
        (statusFilter === "Online" && d.isOnline) ||
        (statusFilter === "Offline" && !d.isOnline);
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  // Handle Reverse Geocoding for Selected Driver
  useEffect(() => {
    if (!selectedDriver?.lat || !selectedDriver?.lng || !isLoaded) return;
    
    // Only fetch if coordinates significantly changed or it's a new select
    setAddress("Resolving address...");
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: selectedDriver.lat, lng: selectedDriver.lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Location details unavailable");
      }
    });
  }, [selectedDriver?.driverId, selectedDriver?.lat, selectedDriver?.lng, isLoaded]);

  if (!isLoaded) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 overflow-y-auto scroll-smooth">

      {/* ─── Top Section: Full Map View (Cleansed) ─── */}
      <div className="relative w-full h-[80vh] bg-gray-100 shadow-inner">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
          }}
        >
          {drivers.map((driver) => (
            <Marker
              key={driver.driverId}
              position={{ lat: driver.lat, lng: driver.lng }}
              onClick={() => setSelectedDriver(driver)}
              opacity={driver.isOnline ? 1 : 0.6}
              // GOOGLE MAPS NATIVE SLIDING:
              // Adding options for better marker behavior
              options={{
                optimized: false // This helps with smooth updates and rotation
              }}
              icon={{
                url: driver.carCategory?.image 
                  ? `${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${driver.carCategory.image}`
                  : "https://cdn-icons-png.flaticon.com/512/3202/3202926.png", 
                scaledSize: new window.google.maps.Size(40, 40), // Back to 40x40 as requested
                anchor: new window.google.maps.Point(20, 20),
                rotation: driver.heading || 0 
              }}
            />
          ))}

          {selectedDriver && (
            <InfoWindow
              position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
              onCloseClick={() => setSelectedDriver(null)}
            >
              <div className="p-3 bg-white rounded-2xl shadow-2xl border-0 overflow-hidden min-w-[180px]">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden border border-indigo-100/50">
                      {selectedDriver.carCategory?.image ? (
                        <img 
                          src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${selectedDriver.carCategory.image}`}
                          className="w-full h-full object-contain p-1.5 transition-transform hover:scale-110"
                          alt="Vehicle"
                        />
                      ) : (
                        <Car size={22} />
                      )}
                   </div>
                   <div>
                     <p className="text-[8px] font-black uppercase text-indigo-500 leading-none mb-1 tracking-tighter">
                       {selectedDriver.carCategory?.name || "Service Unit"}
                     </p>
                     <p className="text-xs font-black text-gray-900 leading-none">{selectedDriver.name}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                   <p className="text-[9px] text-gray-500 font-bold flex items-center gap-2">
                      <Phone size={10} className="text-indigo-300" /> +91 {selectedDriver.phone}
                   </p>
                   <div className={`w-2 h-2 rounded-full ${selectedDriver.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}></div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Re-center Button (Bottom Right) */}
        <button
          onClick={() => map?.panTo(center)}
          className="absolute bottom-6 right-6 z-10 w-11 h-11 bg-white rounded-xl shadow-2xl border border-gray-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 shadow-indigo-100/20"
        >
          <MapPin size={18} />
        </button>
      </div>

      {/* ─── Integrated Controls Section ─── */}
      <div className="max-w-[1500px] mx-auto px-8 mt-12 relative z-20 pb-20 space-y-10">

        {/* Control Header Card */}


        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Now" value={drivers.filter(d => d.isOnline).length} icon={CheckCircle2} color="indigo" />
          <StatCard label="Fleet Total" value={drivers.length} icon={ListFilter} color="slate" />
          <StatCard label="Sync Status" value="FAST" icon={Clock} color="emerald" />
          <StatCard label="Live Alerts" value="0" icon={AlertCircle} color="rose" />
        </div>

        {/* Matrix Grid Heading */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-gray-900 uppercase tracking-[0.1em]">Fleet Matrix</h3>
            <p className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">Real-time Persistence Stream</p>
          </div>
          <div className="flex -space-x-2">
            {drivers.slice(0, 3).map((d, i) => (
              <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-[8px] font-black ring-1 ring-gray-100">
                {d.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-gray-200/40">
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 tracking-tight">
              LIVE <span className="text-indigo-600">PULSE</span>
            </h2>
            <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.3em]">Operational Fleet Control Center</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto">
              {["All", "Online", "Offline"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 md:w-28 py-2.5 text-[11px] font-black uppercase rounded-lg transition-all ${statusFilter === status
                    ? "bg-white text-indigo-600 shadow-md border border-gray-100"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
              <input
                type="text"
                placeholder="Search by driver or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-6 py-2.5 bg-gray-50 border border-gray-50 rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrivers.map(driver => (
            <div
              key={driver.driverId}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setSelectedDriver(driver);
                map?.panTo({ lat: driver.lat, lng: driver.lng });
                setTimeout(() => map?.setZoom(16), 500);
              }}
              className={`bg-white p-7 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedDriver?.driverId === driver.driverId
                ? "border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50"
                : "border-gray-50 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/40"
                }`}
            >
                <div className="flex justify-between items-start mb-6">
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all overflow-hidden group-hover:scale-105 duration-500 ${
                       driver.isOnline ? "bg-indigo-600 shadow-2xl shadow-indigo-100 ring-2 ring-indigo-50" : "bg-gray-100 text-gray-400"
                     }`}>
                        {driver.carCategory?.image ? (
                          <img 
                            src={`${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/${driver.carCategory.image}`}
                            className="w-full h-full object-contain p-2.5 transition-transform group-hover:rotate-6"
                            alt="Car"
                          />
                        ) : (
                          <Car size={30} className={driver.isOnline ? "animate-pulse" : ""} />
                        )}
                     </div>
                     <div className="flex flex-col items-end">
                       <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-widest mb-2 shadow-sm ${
                         driver.isOnline ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? "bg-white animate-ping" : "bg-gray-400"}`}></div>
                          <span className="text-[7px] font-black">{driver.isOnline ? "LIVE" : "IDLE"}</span>
                       </div>
                       <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em]">{driver.carCategory?.name || "ECO_SYNC"}</span>
                     </div>
                </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{driver.name}</h4>
                <p className="text-[11px] text-gray-500 font-bold flex items-center gap-2">
                  <Phone size={13} className="text-indigo-200" /> {driver.phone}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em]">Asset Persistence</p>
                  <p className="text-[9px] text-gray-900 font-black uppercase tracking-widest mt-0.5">Secure Monitor Signal</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${driver.isOnline 
                  ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" 
                  : "bg-gray-50 text-gray-200"
                  }`}>
                  <MapPin size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ─── Premium Driver Detail Slider (Drawer) ─── */}
      {selectedDriver && (
        <div className="fixed top-0 right-0 h-screen w-full md:w-[450px] z-[100] bg-white shadow-[-10px_0_50px_rgba(0,0,0,0.08)] border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-500">
          
          {/* Drawer Header */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Operational Insight</p>
              <h2 className="text-xl font-black text-gray-900 uppercase">Driver Profile</h2>
            </div>
            <button 
              onClick={() => setSelectedDriver(null)}
              className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all transform active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar mt-0">
            
            {/* Main Identity Card */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100 relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${selectedDriver.isOnline ? "bg-indigo-600 text-white shadow-indigo-100" : "bg-gray-200 text-gray-400"}`}>
                    <User size={40} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase leading-tight">{selectedDriver.name}</h3>
                    <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                       <Phone size={14} className="text-indigo-300" /> {selectedDriver.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedDriver.isOnline ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                      {selectedDriver.isOnline ? "Active Signal" : "No Signal"}
                    </span>
                    {selectedDriver.isOnline && (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-tighter">
                         <MapPin size={10} /> Live Tracking
                      </span>
                    )}
                  </div>
               </div>
               <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <Car size={150} />
               </div>
            </div>

            {/* Persistence Stats */}
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] border-b border-gray-50 pb-3">Session Diagnostics</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Driver Identity</p>
                     <p className="text-xs font-black text-gray-900 truncate">ID: {selectedDriver.driverId?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Connectivity</p>
                     <p className={`text-xs font-black ${selectedDriver.isOnline ? "text-emerald-600" : "text-rose-500"}`}>{selectedDriver.isOnline ? "HIGH SPEED" : "DISCONNECTED"}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 col-span-2 relative overflow-hidden group/addr">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Operational Address</p>
                     <p className="text-xs font-black text-gray-900 leading-relaxed pr-8">{address}</p>
                     <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest">{selectedDriver.lat?.toFixed(5)} , {selectedDriver.lng?.toFixed(5)}</p>
                        <MapPin size={12} className="text-indigo-200 group-hover/addr:text-indigo-600 transition-colors" />
                     </div>
                  </div>
               </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4">
             <button 
                onClick={() => window.location.href = `tel:${selectedDriver.phone}`}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200"
             >
                Call Driver
             </button>
             <button className="flex-1 py-4 border-2 border-gray-900 text-gray-900 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-100 transition-all">
                Full Audit
             </button>
          </div>

        </div>
      )}

    </div>
  );
}

// ─── Stat Card Helper ───
const StatCard = ({ label, value, icon: Icon, color }) => {
  const themes = {
    indigo: "bg-indigo-600 text-white shadow-indigo-100",
    slate: "bg-white text-gray-900 border-gray-100",
    emerald: "bg-emerald-500 text-white shadow-emerald-100",
    rose: "bg-white text-gray-900 border-gray-100",
  };

  return (
    <div className={`${themes[color]} p-6 rounded-2xl border shadow-lg flex items-center justify-between group hover:-translate-y-1 transition-transform`}>
      <div className="space-y-1">
        <p className={`text-[8px] font-black uppercase tracking-widest ${color === 'slate' || color === 'rose' ? 'text-gray-400' : 'opacity-80'}`}>{label}</p>
        <h3 className="text-2xl font-black tracking-tighter">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'slate' ? 'bg-gray-50 text-gray-400' : color === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-white/20 text-white'}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

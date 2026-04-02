import { useState, useEffect } from "react";
import api from "../utils/api";
import { Bell, Info, AlertTriangle, CheckCircle2, Clock, Trash2, Ghost, TrendingUp, Users, Zap, BarChart3, PieChart } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Chart Data - derived from notifications
  const [categoryStats, setCategoryStats] = useState([
    { name: "Alerts", value: 0, color: "#f43f5e" },
    { name: "Success", value: 0, color: "#10b981" },
    { name: "Info", value: 0, color: "#6366f1" },
    { name: "Other", value: 0, color: "#f59e0b" }
  ]);

  const [timelineData, setTimelineData] = useState([]);
  const [readRateData, setReadRateData] = useState([
    { name: "Read", value: 0, color: "#6366f1" },
    { name: "Unread", value: 0, color: "#cbd5e1" }
  ]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      updateChartData();
    }
  }, [notifications]);

  const updateChartData = () => {
    // Category stats
    const stats = [...categoryStats];
    stats.forEach(s => s.value = 0);

    notifications.forEach(notif => {
      const title = notif.title.toLowerCase();
      if (title.includes("alert") || title.includes("urgent") || title.includes("block")) stats[0].value++;
      else if (title.includes("success") || title.includes("approved") || title.includes("complete")) stats[1].value++;
      else if (title.includes("info") || title.includes("update") || title.includes("new")) stats[2].value++;
      else stats[3].value++;
    });
    setCategoryStats([...stats]);

    // Timeline data (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push({ date: dateStr, count: 0, alerts: 0, success: 0 });
    }

    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt);
      const dayDiff = Math.floor((new Date() - notifDate) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        const idx = 6 - dayDiff;
        if (idx >= 0 && idx < 7) {
          last7Days[idx].count++;
          const title = notif.title.toLowerCase();
          if (title.includes("alert") || title.includes("urgent")) last7Days[idx].alerts++;
          if (title.includes("success") || title.includes("approved")) last7Days[idx].success++;
        }
      }
    });
    setTimelineData(last7Days);

    // Read/Unread stats (simulated for demo - can be extended)
    const readCount = notifications.filter(n => n.isRead).length;
    setReadRateData([
      { name: "Read", value: readCount, color: "#6366f1" },
      { name: "Unread", value: notifications.length - readCount, color: "#cbd5e1" }
    ]);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api("/api/notifications/my-notifications");
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("alert") || t.includes("urgent") || t.includes("block")) return <AlertTriangle className="text-rose-500" size={24} />;
    if (t.includes("success") || t.includes("approved") || t.includes("complete")) return <CheckCircle2 className="text-emerald-500" size={24} />;
    if (t.includes("info") || t.includes("update") || t.includes("new")) return <Info className="text-indigo-500" size={24} />;
    return <Bell className="text-amber-500" size={24} />;
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSecs = Math.floor((now - date) / 1000);
    if (diffInSecs < 60) return "Just now";
    if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
    if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = selectedCategory === "all"
    ? notifications
    : notifications.filter(n => {
      const title = n.title.toLowerCase();
      if (selectedCategory === "alert") return title.includes("alert") || title.includes("urgent");
      if (selectedCategory === "success") return title.includes("success") || title.includes("approved");
      if (selectedCategory === "info") return title.includes("info") || title.includes("update");
      return false;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] animate-pulse">Syncing Signal Stream</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] py-12 px-6 md:px-12 space-y-12 animate-in fade-in duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gray-50 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-gray-200">
              <Bell size={24} className="animate-swing" />
            </div>
            <h1 className="text-4xl font-[1000] text-gray-900 uppercase tracking-tighter leading-none">
              SIGNAL_ <span className="text-indigo-600">HUB</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] ml-1">Integrated System Broadcast Feed</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-50 rounded-xl flex items-center gap-2 border border-indigo-100">
            <ActivityIndicator />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Channel: VENDOR_LIVE</span>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardStat
          title="Total Signals"
          value={notifications.length}
          icon={<Bell size={20} />}
          color="indigo"
          trend="+12%"
        />
        <CardStat
          title="Alerts"
          value={categoryStats[0].value}
          icon={<AlertTriangle size={20} />}
          color="rose"
          trend={categoryStats[0].value > 0 ? "Critical" : "None"}
        />
        <CardStat
          title="Success"
          value={categoryStats[1].value}
          icon={<CheckCircle2 size={20} />}
          color="emerald"
          trend="Completed"
        />
        <CardStat
          title="Read Rate"
          value={`${Math.round((readRateData[0].value / (readRateData[0].value + readRateData[1].value || 1)) * 100)}%`}
          icon={<Users size={20} />}
          color="purple"
          trend="Engagement"
        />
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart - Timeline */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">Signal Timeline</h3>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">7-Day Broadcast Frequency</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              <span className="text-[8px] font-bold text-gray-400">Total Signals</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Category Distribution */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <PieChart size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">Signal Classification</h3>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">Category Distribution</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryStats.filter(c => c.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                >
                  {categoryStats.filter(c => c.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        \
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        {["all", "alert", "success", "info"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedCategory(tab)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${selectedCategory === tab
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
          >
            {tab === "all" ? "All Signals" : tab === "alert" ? "Alerts" : tab === "success" ? "Success" : "Info"}
          </button>
        ))}
      </div>

      {/* ── NOTIFICATIONS LIST ── */}
      <div className="max-w-8xl mx-auto space-y-6 pb-20">
        {filteredNotifications.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 border border-gray-100">
              <Ghost size={64} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">Zero Signals Detected</h3>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed">Broadcast frequency is currently silent.<br />New updates will appear here automatically.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif, index) => (
            <div
              key={notif._id}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-8 relative z-10">
                <div className="w-16 h-16 bg-gray-50 rounded-[1.8rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-gray-100/50">
                  {getIcon(notif.title)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <h3 className="text-lg font-[1000] text-gray-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{notif.title}</h3>
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock size={12} className="text-gray-300" /> {getTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">{notif.message}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-8 group-hover:translate-y-0 duration-700"></div>
            </div>
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className="text-center pt-8 opacity-20">
        <h1 className="text-[60px] font-black text-gray-300 tracking-[-0.05em] leading-none select-none">SYSTEM_FEED</h1>
      </div>
    </div>
  );
}

function ActivityIndicator() {
  return (
    <div className="flex items-center gap-1">
      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
    </div>
  );
}

// Card Stat Component
function CardStat({ title, value, icon, color, trend }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    rose: "bg-rose-50 text-rose-500",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-wider">{trend}</span>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-3xl font-black text-gray-800 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
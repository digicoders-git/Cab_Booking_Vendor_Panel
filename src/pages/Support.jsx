import { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "sonner";
import {
   Headset, Mail, Phone, MessageSquare,
   Clock, CheckCircle2, Send, Inbox,
   HelpCircle, ChevronRight, UserCircle,
   BarChart3, PieChart, TrendingUp, Ticket
} from 'lucide-react';
import {
   LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

export default function Support() {
   const [subject, setSubject] = useState("");
   const [message, setMessage] = useState("");
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(false);
   const [fetching, setFetching] = useState(true);

   // Chart Data States
   const [statusStats, setStatusStats] = useState([
      { name: "Open", value: 0, color: "#f59e0b" },
      { name: "In Progress", value: 0, color: "#6366f1" },
      { name: "Closed", value: 0, color: "#10b981" }
   ]);
   const [monthlyTrend, setMonthlyTrend] = useState([]);
   const [responseTimeData, setResponseTimeData] = useState([]);

   useEffect(() => {
      fetchMyTickets();
   }, []);

   useEffect(() => {
      if (tickets.length > 0) {
         updateChartData();
      }
   }, [tickets]);

   const updateChartData = () => {
      // Status Stats
      const stats = [...statusStats];
      stats.forEach(s => s.value = 0);

      tickets.forEach(ticket => {
         if (ticket.status === "Open") stats[0].value++;
         else if (ticket.status === "In Progress" || ticket.status === "Pending") stats[1].value++;
         else if (ticket.status === "Closed" || ticket.status === "Resolved") stats[2].value++;
      });
      setStatusStats([...stats]);

      // Monthly Trend (last 6 months)
      const last6Months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
         const date = new Date();
         date.setMonth(today.getMonth() - i);
         const monthName = monthNames[date.getMonth()];
         last6Months.push({ month: monthName, tickets: 0, resolved: 0 });
      }

      tickets.forEach(ticket => {
         const ticketDate = new Date(ticket.createdAt);
         const monthDiff = (today.getFullYear() - ticketDate.getFullYear()) * 12 + (today.getMonth() - ticketDate.getMonth());
         if (monthDiff >= 0 && monthDiff < 6) {
            const idx = 5 - monthDiff;
            if (idx >= 0 && idx < 6) {
               last6Months[idx].tickets++;
               if (ticket.status === "Closed" || ticket.status === "Resolved") {
                  last6Months[idx].resolved++;
               }
            }
         }
      });
      setMonthlyTrend(last6Months);

      // Response Time Data (simulated from ticket data)
      const responseData = [
         { range: "< 1 hour", count: 0, color: "#10b981" },
         { range: "1-4 hours", count: 0, color: "#6366f1" },
         { range: "4-24 hours", count: 0, color: "#f59e0b" },
         { range: "> 24 hours", count: 0, color: "#ef4444" }
      ];

      tickets.forEach(ticket => {
         if (ticket.reply && ticket.createdAt) {
            const created = new Date(ticket.createdAt);
            const replied = new Date(ticket.updatedAt || ticket.createdAt);
            const hoursDiff = Math.abs(replied - created) / 36e5;

            if (hoursDiff < 1) responseData[0].count++;
            else if (hoursDiff < 4) responseData[1].count++;
            else if (hoursDiff < 24) responseData[2].count++;
            else responseData[3].count++;
         }
      });
      setResponseTimeData(responseData);
   };

   const fetchMyTickets = async () => {
      setFetching(true);
      try {
         const res = await api("/api/support/my-tickets");
         if (res.success) {
            setTickets(res.requests);
         }
      } catch (error) {
         console.error("Error fetching tickets:", error);
      } finally {
         setFetching(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!subject || !message) return toast.error("Please fill all fields");

      setLoading(true);
      try {
         const res = await api("/api/support/create", {
            method: "POST",
            body: JSON.stringify({ subject, message })
         });

         if (res.success) {
            toast.success("Support ticket created!");
            setSubject("");
            setMessage("");
            fetchMyTickets();
         }
      } catch (error) {
         toast.error(error.message || "Something went wrong");
      } finally {
         setLoading(false);
      }
   };

   // Card Stat Component
   const CardStat = ({ title, value, icon, color, subtitle }) => {
      const colorClasses = {
         indigo: "bg-indigo-50 text-indigo-600",
         amber: "bg-amber-50 text-amber-500",
         emerald: "bg-emerald-50 text-emerald-600",
         purple: "bg-purple-50 text-purple-600",
         rose: "bg-rose-50 text-rose-500"
      };

      return (
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                  {icon}
               </div>
               {subtitle && <span className="text-[9px] font-black text-gray-300 uppercase tracking-wider">{subtitle}</span>}
            </div>
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
               <p className="text-3xl font-black text-gray-800 tracking-tighter">{value}</p>
            </div>
         </div>
      );
   };

   return (
      <div className="min-h-screen bg-white py-10 px-6 md:px-12 max-w-[1600px] mx-auto space-y-20 animate-in fade-in duration-700">

         {/* ── Header Section ── */}
         <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-8 gap-8">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <Headset size={14} /> 24x7 Help Desk
               </div>
               <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Support <span className="text-indigo-600">Nexus</span></h1>
               <p className="text-gray-500 text-sm font-medium">Professional operational assistance for all registered vendors.</p>
            </div>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all cursor-default">
                  <Phone size={16} className="text-indigo-600" />
                  <span className="text-sm font-bold text-gray-800">+91 999 000 1234</span>
               </div>
               <div className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all cursor-default">
                  <Mail size={16} className="text-indigo-600" />
                  <span className="text-sm font-bold text-gray-800">help@fleetapp.com</span>
               </div>
            </div>
         </div>

         {/* ── STATS CARDS SECTION ── */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardStat
               title="Total Tickets"
               value={tickets.length}
               icon={<Ticket size={20} />}
               color="indigo"
               subtitle="All Time"
            />
            <CardStat
               title="Open"
               value={statusStats[0].value}
               icon={<HelpCircle size={20} />}
               color="amber"
               subtitle="Pending Action"
            />
            <CardStat
               title="In Progress"
               value={statusStats[1].value}
               icon={<Clock size={20} />}
               color="purple"
               subtitle="Being Handled"
            />
            <CardStat
               title="Closed"
               value={statusStats[2].value}
               icon={<CheckCircle2 size={20} />}
               color="emerald"
               subtitle="Resolved"
            />
         </div>

         {/* ── CHARTS SECTION ── */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart - Monthly Trend */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <TrendingUp size={18} className="text-indigo-600" />
                     </div>
                     <div>
                        <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">Ticket Volume Trend</h3>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Last 6 Months</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <span className="text-[8px] font-bold text-gray-500">Created</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-[8px] font-bold text-gray-500">Resolved</span>
                     </div>
                  </div>
               </div>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="tickets" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Pie Chart - Status Distribution */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                     <PieChart size={18} className="text-emerald-600" />
                  </div>
                  <div>
                     <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">Ticket Distribution</h3>
                     <p className="text-[9px] text-gray-400 uppercase tracking-widest">Status Breakdown</p>
                  </div>
               </div>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <RePieChart>
                        <Pie
                           data={statusStats.filter(s => s.value > 0)}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={80}
                           paddingAngle={3}
                           dataKey="value"
                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                           labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        >
                           {statusStats.filter(s => s.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </RePieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Bar Chart - Response Time Analysis */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg lg:col-span-2">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <BarChart3 size={18} className="text-amber-600" />
                     </div>
                     <div>
                        <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">Response Time Analysis</h3>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">First Reply SLA</p>
                     </div>
                  </div>
               </div>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={responseTimeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis type="category" dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* ── Middle Section: Info & Form ── */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left side: Support Info */}
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-6">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Operational <span className="text-indigo-600">Assistance</span></h2>
                  <div className="space-y-4">
                     <p className="text-gray-500 font-medium leading-relaxed">
                        Welcome to the CAP BOOKING Vendor Support Hub. Our dedicated team is available 24/7 to ensure your fleet operations remain smooth and uninterrupted.
                     </p>
                     <p className="text-gray-500 font-medium leading-relaxed">
                        Whether you're facing technical issues with real-time tracking, need clarification on wallet settlements, or require assistance with driver onboarding—we've got you covered.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-indigo-200 transition-all">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <MessageSquare size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Fast Response</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Typical turnaround: &lt; 30 Mins</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-indigo-200 transition-all">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <UserCircle size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Human Support</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Direct access to fleet managers</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right side: Form */}
            <div className="lg:col-span-7">
               <form onSubmit={handleSubmit} className="relative space-y-8 bg-gray-50/50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-80">Ticket Subject</label>
                     <input
                        type="text"
                        placeholder="BRIEFLY DESCRIBE YOUR CONCERN..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 font-bold focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 placeholder:font-black placeholder:opacity-50"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest ml-1 opacity-80">Message Details</label>
                     <textarea
                        rows="8"
                        placeholder="PROVIDE DETAILED INFORMATION FOR FASTER RESOLUTION..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-6 py-5 bg-white border border-gray-200 rounded-[1.8rem] text-gray-900 font-bold focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 placeholder:font-black placeholder:opacity-50 resize-none"
                     ></textarea>
                  </div>

                  <button
                     disabled={loading}
                     className="w-full md:w-auto px-12 py-5 bg-gray-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50"
                  >
                     {loading ? "TRANSMITTING..." : (
                        <>
                           <span>Dispatch Message</span>
                           <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                     )}
                  </button>

                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none"></div>
               </form>
            </div>
         </div>

         {/* ── Bottom Section: Table ── */}
         <div className="space-y-8 pt-10 pb-20">
            <div className="flex items-center justify-between border-b pb-4">
               <div className="space-y-1">
                  <h2 className="text-sm font-black text-gray-900 uppercase">Recent Messages</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">History of your support requests</p>
               </div>
               <button
                  onClick={fetchMyTickets}
                  className="p-2 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-indigo-600 transition-all"
               >
                  <Clock size={16} />
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                           <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                           <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Broadcast Date</th>
                           <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Response</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {fetching ? (
                           [1, 2, 3].map(i => (
                              <tr key={i} className="animate-pulse">
                                 <td colSpan="4" className="px-8 py-6"><div className="h-4 bg-gray-50 rounded-full w-full"></div></td>
                              </tr>
                           ))
                        ) : tickets.length === 0 ? (
                           <tr>
                              <td colSpan="4" className="px-8 py-20 text-center">
                                 <div className="flex flex-col items-center gap-4 opacity-20">
                                    <Inbox size={48} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Support Signals Detected</p>
                                 </div>
                              </td>
                           </tr>
                        ) : (
                           tickets.map(ticket => (
                              <tr key={ticket._id} className="hover:bg-gray-50/30 transition-colors group">
                                 <td className="px-8 py-6">
                                    <span className={`px-4 py-1.5 text-[8px] font-black uppercase rounded-full tracking-widest border ${ticket.status === 'Open' ? 'text-amber-500 bg-amber-50 border-amber-100' :
                                       ticket.status === 'Closed' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                                          'text-indigo-500 bg-indigo-50 border-indigo-100'
                                       }`}>
                                       {ticket.status}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="space-y-1">
                                       <p className="text-sm font-black text-gray-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{ticket.subject}</p>
                                       <p className="text-[10px] text-gray-400 font-bold truncate max-w-xs">{ticket.message}</p>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                       <Clock size={12} className="opacity-40" />
                                       {new Date(ticket.createdAt).toLocaleDateString()}
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    {ticket.reply ? (
                                       <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 space-y-1">
                                          <div className="flex items-center gap-2">
                                             <CheckCircle2 size={10} className="text-emerald-600" />
                                             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Response</span>
                                          </div>
                                          <p className="text-[10px] font-bold text-gray-600 leading-relaxed">"{ticket.reply}"</p>
                                       </div>
                                    ) : (
                                       <div className="flex items-center gap-2 opacity-40">
                                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Signal...</span>
                                       </div>
                                    )}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
}
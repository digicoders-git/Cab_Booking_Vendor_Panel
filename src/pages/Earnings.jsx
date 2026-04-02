import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  FaWallet, FaChartLine, FaCalendarAlt, FaHistory,
  FaPlusCircle, FaCheckCircle, FaClock, FaTimesCircle,
  FaArrowUp, FaArrowDown, FaSyncAlt, FaTimes, FaExclamationCircle
} from "react-icons/fa";
import { toast } from "sonner";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`text-xl ${color}`} />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        ₹{Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  </div>
);

// ─── Withdrawal Modal ─────────────────────────────────────────────────────────
const WithdrawalModal = ({ onClose, onSuccess, balance }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 100) { setError("Minimum withdrawal amount is ₹100"); return; }
    if (num > balance)           { setError("Amount cannot exceed wallet balance"); return; }
    setLoading(true); setError("");
    try {
      await api("/api/vendors/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: num, note }),
      });
      toast.success("Withdrawal request submitted!");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FaWallet className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Request Withdrawal</h2>
              <p className="text-xs text-gray-400">Available: ₹{Number(balance).toLocaleString("en-IN")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount (₹)</label>
            <input
              type="number" min="100" step="0.01"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min ₹100)"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Note (Optional)</label>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)}
              rows={3} placeholder="Add a note for admin..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              <FaExclamationCircle className="flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Earnings() {
  const [dashboard, setDashboard]     = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [showModal, setShowModal]     = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await api("/api/vendors/dashboard/stats");
      if (statsRes.success) setDashboard(statsRes.dashboard);
    } catch {
      toast.error("Failed to load dashboard stats");
    }
    try {
      const historyRes = await api("/api/vendors/wallet/withdrawals");
      if (historyRes.success) setWithdrawals(historyRes.withdrawals || []);
    } catch {
      // withdrawal history unavailable — silently ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build chart data from recent transactions
  const chartData = (dashboard?.recentTransactions || [])
    .slice().reverse()
    .map((tx, i) => ({
      name: new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      amount: tx.type === "Credit" ? tx.amount : 0,
    }));

  const statusBadge = (status) => {
    const map = {
      Approved: "bg-emerald-50 text-emerald-600",
      Pending:  "bg-amber-50 text-amber-600",
      Rejected: "bg-red-50 text-red-500",
    };
    const icons = {
      Approved: <FaCheckCircle className="text-xs" />,
      Pending:  <FaClock className="text-xs" />,
      Rejected: <FaTimesCircle className="text-xs" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "history",   label: "Withdrawal History" },
  ];

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Earnings & Wallet</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your earnings and manage withdrawals</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm"
            title="Refresh"
          >
            <FaSyncAlt />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <FaPlusCircle />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={FaWallet}      label="Wallet Balance"   value={dashboard?.walletBalance}   color="text-indigo-600"  bg="bg-indigo-50" />
        <StatCard icon={FaChartLine}   label="Total Earnings"   value={dashboard?.totalEarnings}   color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={FaCalendarAlt} label="Monthly Earnings" value={dashboard?.monthlyEarnings} color="text-amber-500"   bg="bg-amber-50" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === t.id ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard Tab ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Recent Earnings Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`₹${v}`, "Amount"]}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fill="url(#earningsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">Recent Transactions</h3>
            </div>
            {!dashboard?.recentTransactions?.length ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">No transactions yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dashboard.recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "Credit" ? "bg-emerald-50" : "bg-red-50"}`}>
                        {tx.type === "Credit"
                          ? <FaArrowDown className="text-emerald-500 text-sm" />
                          : <FaArrowUp   className="text-red-500 text-sm" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{tx.description}</p>
                        <p className="text-xs text-gray-400">
                          {tx.category} • {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type === "Credit" ? "text-emerald-600" : "text-red-500"}`}>
                        {tx.type === "Credit" ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                        tx.status === "Pending"   ? "bg-amber-50 text-amber-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Withdrawal History Tab ── */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Withdrawal Requests ({withdrawals.length})</h3>
          </div>
          {!withdrawals.length ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">No withdrawal requests yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["ID", "Amount", "Bank", "Status", "Date"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {withdrawals.map((wd) => (
                    <tr key={wd._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">{wd._id?.slice(-8)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">₹{Number(wd.amount).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700">{wd.bankDetails?.bankName || "—"}</p>
                        <p className="text-xs text-gray-400">{wd.bankDetails?.accountNumber || "—"}</p>
                      </td>
                      <td className="px-6 py-4">{statusBadge(wd.status)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(wd.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <WithdrawalModal
          balance={dashboard?.walletBalance || 0}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}

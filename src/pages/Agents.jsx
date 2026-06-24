import { useState, useEffect, useCallback, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  FaUserPlus, FaUsers, FaCheckCircle, FaTimesCircle,
  FaEdit, FaTrash, FaEye, FaTimes, FaUserTie
} from "react-icons/fa";
import { toast } from "sonner";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ title }) => (
  <div className="col-span-2 pt-2">
    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1">{title}</p>
  </div>
);

// ─── File Upload Field ────────────────────────────────────────────────────────
const FileField = ({ label, name, onChange, preview }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden">
      {preview ? (
        <img src={preview} alt={label} className="w-full h-full object-cover rounded-xl" />
      ) : (
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-2xl">📎</span>
          <span className="text-xs">Click to upload</span>
        </div>
      )}
      <input type="file" name={name} accept="image/*" onChange={onChange} className="hidden" />
    </label>
  </div>
);

// ─── Modal: Add Agent ────────────────────────────────────────────────────────
const AddAgentModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    aadharNumber: "", panNumber: "",
    accountNumber: "", ifscCode: "", bankName: "", accountHolderName: "",
    address: "", city: "", state: "", pincode: "",
  });
  const [files, setFiles] = useState({ image: null, aadhar: null, pan: null });
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const { name, files: f } = e.target;
    if (!f[0]) return;
    setFiles((p) => ({ ...p, [name]: f[0] }));
    setPreviews((p) => ({ ...p, [name]: URL.createObjectURL(f[0]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

      await api("/api/vendors/create-agent", { method: "POST", body: fd });
      toast.success("Agent registered successfully. Waiting for Admin approval!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const textFields = {
    profile: [
      { name: "name",     label: "Full Name",  type: "text",     placeholder: "Rohan" },
      { name: "email",    label: "Email",       type: "email",    placeholder: "rohan@test.com" },
      { name: "phone",    label: "Phone",       type: "text",     placeholder: "9876543210" },
      { name: "password", label: "Password",    type: "password", placeholder: "••••••••" },
    ],
    documents: [
      { name: "aadharNumber", label: "Aadhar Number", type: "text", placeholder: "1234 5678 9012" },
      { name: "panNumber",    label: "PAN Number",    type: "text", placeholder: "ABCDE1234F" },
    ],
    bank: [
      { name: "accountNumber",     label: "Account Number",      type: "text", placeholder: "1234567890" },
      { name: "ifscCode",          label: "IFSC Code",           type: "text", placeholder: "HDFC000123" },
      { name: "bankName",          label: "Bank Name",           type: "text", placeholder: "HDFC Bank" },
      { name: "accountHolderName", label: "Account Holder Name", type: "text", placeholder: "Rohan Kumar" },
    ],
    address: [
      { name: "address", label: "Address", type: "text", placeholder: "Main Road", full: true },
      { name: "city",    label: "City",    type: "text", placeholder: "Lucknow" },
      { name: "state",   label: "State",   type: "text", placeholder: "Uttar Pradesh" },
      { name: "pincode", label: "Pincode", type: "text", placeholder: "226001" },
    ],
  };

  const fileFields = [
    { name: "image",  label: "Agent Photo 🖼️" },
    { name: "aadhar", label: "Aadhar Card 📄" },
    { name: "pan",    label: "PAN Card 📄" },
  ];

  const sectionLabels = {
    profile: "👤 Profile",
    documents: "📄 Identification",
    bank:    "🏦 Bank Details",
    address: "📍 Address",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FaUserPlus className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Register New Agent</h2>
              <p className="text-xs text-gray-400">Agent will require Admin approval to become active</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(textFields).map(([section, fields]) => (
              <Fragment key={section}>
                <SectionHeading title={sectionLabels[section]} />
                {fields.map((f) => (
                  <div key={f.name} className={f.full ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-gray-50"
                    />
                  </div>
                ))}
              </Fragment>
            ))}
            <SectionHeading title="📁 Documents & Photo" />
            {fileFields.map((f) => (
              <FileField
                key={f.name}
                label={f.label}
                name={f.name}
                onChange={handleFile}
                preview={previews[f.name]}
              />
            ))}
          </div>

          <div className="flex gap-3 mt-6 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? "Registering..." : "Register Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: Update Agent ────────────────────────────────────────────────────
const UpdateAgentModal = ({ agent, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: agent.name || "",
    email: agent.email || "",
    phone: agent.phone || "",
    password: "",
    aadharNumber: agent.aadharNumber || "",
    panNumber: agent.panNumber || "",
    accountNumber: agent.bankDetails?.accountNumber || "",
    ifscCode: agent.bankDetails?.ifscCode || "",
    bankName: agent.bankDetails?.bankName || "",
    accountHolderName: agent.bankDetails?.accountHolderName || "",
    address: agent.address || "",
    city: agent.city || "",
    state: agent.state || "",
    pincode: agent.pincode || "",
  });
  const [files, setFiles] = useState({ image: null, aadhar: null, pan: null });
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const { name, files: f } = e.target;
    if (!f[0]) return;
    setFiles((p) => ({ ...p, [name]: f[0] }));
    setPreviews((p) => ({ ...p, [name]: URL.createObjectURL(f[0]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await api(`/api/vendors/update-agent/${agent._id}`, { method: "PUT", body: fd });
      toast.success("Agent updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const textFields = {
    profile: [
      { name: "name",     label: "Full Name",  type: "text",     placeholder: "" },
      { name: "email",    label: "Email",       type: "email",    placeholder: "" },
      { name: "phone",    label: "Phone",       type: "text",     placeholder: "" },
      { name: "password", label: "New Password", type: "password", placeholder: "Leave blank to keep" },
    ],
    documents: [
      { name: "aadharNumber", label: "Aadhar Number", type: "text", placeholder: "" },
      { name: "panNumber",    label: "PAN Number",    type: "text", placeholder: "" },
    ],
    bank: [
      { name: "accountNumber",     label: "Account Number",      type: "text", placeholder: "" },
      { name: "ifscCode",          label: "IFSC Code",           type: "text", placeholder: "" },
      { name: "bankName",          label: "Bank Name",           type: "text", placeholder: "" },
      { name: "accountHolderName", label: "Account Holder Name", type: "text", placeholder: "" },
    ],
    address: [
      { name: "address", label: "Address", type: "text", placeholder: "", full: true },
      { name: "city",    label: "City",    type: "text", placeholder: "" },
      { name: "state",   label: "State",   type: "text", placeholder: "" },
      { name: "pincode", label: "Pincode", type: "text", placeholder: "" },
    ],
  };

  const fileFields = [
    { name: "image",  label: "Agent Photo 🖼️" },
    { name: "aadhar", label: "Aadhar Card 📄" },
    { name: "pan",    label: "PAN Card 📄" },
  ];

  const sectionLabels = {
    profile: "👤 Profile",
    documents: "📄 Identification",
    bank:    "🏦 Bank Details",
    address: "📍 Address",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <FaEdit className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Update Agent</h2>
              <p className="text-xs text-gray-400">{agent.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(textFields).map(([section, fields]) => (
              <Fragment key={section}>
                <SectionHeading title={sectionLabels[section]} />
                {fields.map((f) => (
                  <div key={f.name} className={f.full ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50"
                    />
                  </div>
                ))}
              </Fragment>
            ))}
            <SectionHeading title="📁 Documents & Photo" />
            {fileFields.map((f) => (
              <FileField
                key={f.name}
                label={f.label}
                name={f.name}
                onChange={handleFile}
                preview={previews[f.name]}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-6 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60">
              {loading ? "Updating..." : "Update Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: View Agent ───────────────────────────────────────────────────────
const ViewAgentModal = ({ agentId, onClose }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    api(`/api/vendors/agent/${agentId}`)
      .then((d) => { if (d.success) setAgent(d.agent); })
      .catch(() => toast.error("Failed to load agent details"))
      .finally(() => setLoading(false));
  }, [agentId]);

  const imgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const clean = path.replace(/^\//, "");
    if (clean.startsWith("uploads/")) return `${BASE}/${clean}`;
    return `${BASE}/uploads/${clean}`;
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 font-medium text-right">{value || "—"}</span>
    </div>
  );

  const DocImg = ({ label, src }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      {src ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img src={src} alt={label} className="w-full h-28 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity" />
        </a>
      ) : (
        <div className="w-full h-28 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">No file</div>
      )}
    </div>
  );

  const Section = ({ title, children }) => (
    <div>
      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-3">{title}</p>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {agent?.image ? (
              <img src={imgUrl(agent.image)} alt={agent.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200" />
            ) : (
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                {agent?.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800">{agent?.name || "Loading..."}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {agent?.isApproved && <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">✓ Approved</span>}
                {!agent?.isApproved && agent && <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">Pending</span>}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${agent?.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                    {agent?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !agent ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Failed to load agent data.</div>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Bookings", value: agent.totalBookings ?? 0,                  color: "bg-indigo-50 text-indigo-600" },
                { label: "Total Earnings", value: `₹${agent.totalEarnings ?? 0}`,         color: "bg-emerald-50 text-emerald-600" },
                { label: "Wallet",         value: `₹${agent.walletBalance ?? 0}`,         color: "bg-amber-50 text-amber-600" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <Section title="👤 Profile">
                  <InfoRow label="Email"   value={agent.email} />
                  <InfoRow label="Phone"   value={agent.phone} />
                  <InfoRow label="Commission" value={`${agent.commissionPercentage || 0}%`} />
                  <InfoRow label="Joined"  value={agent.createdAt ? new Date(agent.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                </Section>
                <Section title="🏦 Bank Details">
                  <InfoRow label="Account No"  value={agent.bankDetails?.accountNumber} />
                  <InfoRow label="IFSC"         value={agent.bankDetails?.ifscCode} />
                  <InfoRow label="Bank"         value={agent.bankDetails?.bankName} />
                  <InfoRow label="Holder Name" value={agent.bankDetails?.accountHolderName} />
                </Section>
              </div>

              <div className="space-y-5">
                <Section title="📄 Identification">
                  <InfoRow label="Aadhar" value={agent.aadharNumber} />
                  <InfoRow label="PAN"    value={agent.panNumber} />
                </Section>
                <Section title="📍 Address">
                  <InfoRow label="Address" value={agent.address} />
                  <InfoRow label="City"    value={agent.city} />
                  <InfoRow label="State"   value={agent.state} />
                  <InfoRow label="Pincode" value={agent.pincode} />
                </Section>
              </div>
            </div>

            <Section title="📁 Documents & Photo">
              <div className="grid grid-cols-3 gap-3">
                <DocImg label="Agent Photo"  src={imgUrl(agent.image)} />
                <DocImg label="Aadhar Card"  src={imgUrl(agent.documents?.aadhar)} />
                <DocImg label="PAN Card"     src={imgUrl(agent.documents?.pan)} />
              </div>
            </Section>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`text-xl ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewAgent, setViewAgent] = useState(null);
  const [editAgent, setEditAgent] = useState(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/vendors/my/agents");
      if (data.success) setAgents(data.agents || []);
    } catch {
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this agent permanently?")) return;
    try {
      await api(`/api/vendors/delete-agent/${id}`, { method: "DELETE" });
      toast.success("Agent deleted");
      fetchAgents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Stats ──
  const total    = agents.length;
  const approved = agents.filter((d) => d.isApproved).length;
  const active   = agents.filter((d) => d.isActive).length;
  const pending  = agents.filter((d) => !d.isApproved).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agents</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your network of booking agents</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FaUserPlus />
          Add Agent
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FaUserTie}       label="Total Agents"    value={total}    color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={FaCheckCircle} label="Approved"        value={approved} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={FaUsers}       label="Active"          value={active}   color="text-blue-500"  bg="bg-blue-50" />
        <StatCard icon={FaTimesCircle} label="Pending Review"  value={pending}  color="text-amber-500"    bg="bg-amber-50" />
      </div>

      {/* ── Agents Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">All Agents ({total})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <FaUserTie className="text-5xl mb-3" />
            <p className="text-sm font-medium text-gray-400">No agents found. Register your first agent!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Agent", "Contact", "Approved", "Status", "Earnings", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                          {d.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{d.phone}</p>
                      <p className="text-xs text-gray-400">{d.city || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${d.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {d.isApproved ? "✓ Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${d.isActive ? "bg-indigo-50 text-indigo-600" : "bg-red-50 text-red-500"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700">₹{d.totalEarnings || 0}</p>
                      <p className="text-xs text-gray-400">{d.totalBookings || 0} Bookings</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewAgent(d._id)} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors" title="View">
                          <FaEye />
                        </button>
                        <button onClick={() => setEditAgent(d)} className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors" title="Edit">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(d._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddAgentModal onClose={() => setShowAdd(false)} onSuccess={fetchAgents} />}
      {editAgent && <UpdateAgentModal agent={editAgent} onClose={() => setEditAgent(null)} onSuccess={fetchAgents} />}
      {viewAgent && <ViewAgentModal agentId={viewAgent} onClose={() => setViewAgent(null)} />}
    </div>
  );
}

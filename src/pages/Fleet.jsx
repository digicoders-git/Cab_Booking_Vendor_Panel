import { useState, useEffect, useCallback } from "react";
import { getMyFleets, getFleetById, createFleet, updateFleet, toggleFleet, deleteFleet } from "../api/fleetApi";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  FaPlus, FaBuilding, FaCheckCircle, FaTimesCircle,
  FaEdit, FaTrash, FaEye, FaTimes, FaToggleOn, FaToggleOff
} from "react-icons/fa";
import { toast } from "sonner";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

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

// ─── Modal: Add Fleet ─────────────────────────────────────────────────────────
const AddFleetModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    companyName: "", gstNumber: "", panNumber: "",
    address: "", city: "", state: "", pincode: "",
    accountNumber: "", ifscCode: "", bankName: "", accountHolderName: "",
  });
  const [files, setFiles]     = useState({ image: null, gstCertificate: null, panCard: null, businessLicense: null });
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
      await createFleet(fd);
      toast.success("Fleet registered successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "👤 Profile",
      fields: [
        { name: "name",     label: "Owner Name", placeholder: "Amit Fleet Owner" },
        { name: "email",    label: "Email",       placeholder: "amit@fleet.com",    type: "email" },
        { name: "phone",    label: "Phone",       placeholder: "9800112233" },
        { name: "password", label: "Password",    placeholder: "••••••••",          type: "password" },
      ],
      fileFields: [
        { name: "image", label: "Profile Photo 🖼️" },
      ],
    },
    {
      title: "🏢 Business Details",
      fields: [
        { name: "companyName", label: "Company Name", placeholder: "Amit Tours" },
        { name: "gstNumber",   label: "GST Number",   placeholder: "27AABCU9603R1ZX" },
        { name: "panNumber",   label: "PAN Number",   placeholder: "AABCU9603R" },
      ],
      fileFields: [
        { name: "gstCertificate",  label: "GST Certificate 📄" },
        { name: "panCard",         label: "PAN Card 📄" },
        { name: "businessLicense", label: "Business License 📄" },
      ],
    },
    {
      title: "📍 Address",
      fields: [
        { name: "address", label: "Address", placeholder: "Baner, Pune", full: true },
        { name: "city",    label: "City",    placeholder: "Pune" },
        { name: "state",   label: "State",   placeholder: "Maharashtra" },
        { name: "pincode", label: "Pincode", placeholder: "411045" },
      ],
    },
    {
      title: "🏦 Bank Details",
      fields: [
        { name: "accountNumber",     label: "Account Number",      placeholder: "501000123456" },
        { name: "ifscCode",          label: "IFSC Code",           placeholder: "HDFC000123" },
        { name: "bankName",          label: "Bank Name",           placeholder: "HDFC Bank" },
        { name: "accountHolderName", label: "Account Holder Name", placeholder: "Amit Kumar" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FaPlus className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Register New Fleet</h2>
              <p className="text-xs text-gray-400">Fill all details to register fleet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-3">{sec.title}</p>
              <div className="grid grid-cols-2 gap-4">
                {sec.fields?.map((f) => (
                  <div key={f.name} className={f.full ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <input
                      type={f.type || "text"}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-gray-50"
                    />
                  </div>
                ))}
                {sec.fileFields?.map((f) => (
                  <FileField key={f.name} label={f.label} name={f.name} onChange={handleFile} preview={previews[f.name]} />
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? "Registering..." : "Register Fleet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: Update Fleet ──────────────────────────────────────────────────────
const UpdateFleetModal = ({ fleet, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    companyName:       fleet.companyName       || "",
    phone:             fleet.phone             || "",
    address:           fleet.address           || "",
    city:              fleet.city              || "",
    state:             fleet.state             || "",
    pincode:           fleet.pincode           || "",
    gstNumber:         fleet.gstNumber         || "",
    panNumber:         fleet.panNumber         || "",
    accountNumber:     fleet.accountNumber     || "",
    ifscCode:          fleet.ifscCode          || "",
    bankName:          fleet.bankName          || "",
    accountHolderName: fleet.accountHolderName || "",
  });
  const [files, setFiles]       = useState({ image: null, gstCertificate: null, panCard: null, businessLicense: null });
  const [previews, setPreviews] = useState({});
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFile   = (e) => {
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
      await updateFleet(fleet._id, fd);
      toast.success("Fleet updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "🏢 Business Details",
      fields: [
        { name: "companyName", label: "Company Name", placeholder: "Kishore Travels" },
        { name: "phone",       label: "Phone",         placeholder: "9897123456" },
        { name: "gstNumber",   label: "GST Number",   placeholder: "27AAAAA0000A1Z5" },
        { name: "panNumber",   label: "PAN Number",   placeholder: "ABCDE1234F" },
      ],
      fileFields: [
        { name: "image",           label: "Profile Photo 🖼️" },
        { name: "gstCertificate",  label: "GST Certificate 📄" },
        { name: "panCard",         label: "PAN Card 📄" },
        { name: "businessLicense", label: "Business License 📄" },
      ],
    },
    {
      title: "📍 Address",
      fields: [
        { name: "address", label: "Address", placeholder: "Main Market Road", full: true },
        { name: "city",    label: "City",    placeholder: "Pune" },
        { name: "state",   label: "State",   placeholder: "Maharashtra" },
        { name: "pincode", label: "Pincode", placeholder: "411001" },
      ],
    },
    {
      title: "🏦 Bank Details",
      fields: [
        { name: "accountNumber",     label: "Account Number",      placeholder: "301234567890" },
        { name: "ifscCode",          label: "IFSC Code",           placeholder: "HDFC0001234" },
        { name: "bankName",          label: "Bank Name",           placeholder: "HDFC Bank" },
        { name: "accountHolderName", label: "Account Holder Name", placeholder: "Kishore Kumar" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <FaEdit className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Update Fleet</h2>
              <p className="text-xs text-gray-400">{fleet.companyName || fleet.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-1 mb-3">{sec.title}</p>
              <div className="grid grid-cols-2 gap-4">
                {sec.fields?.map((f) => (
                  <div key={f.name} className={f.full ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <input
                      type="text"
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50"
                    />
                  </div>
                ))}
                {sec.fileFields?.map((f) => (
                  <FileField key={f.name} label={f.label} name={f.name} onChange={handleFile} preview={previews[f.name]} />
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60">
              {loading ? "Updating..." : "Update Fleet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: View Fleet ────────────────────────────────────────────────────────
const ViewFleetModal = ({ fleetId, onClose }) => {
  const [fleet, setFleet] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    getFleetById(fleetId)
      .then((d) => { if (d.success) setFleet(d.fleet); })
      .catch(() => toast.error("Failed to load fleet details"))
      .finally(() => setLoading(false));
  }, [fleetId]);

  const imgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const clean = path.replace(/^\//, "");
    return clean.startsWith("uploads/") ? `${BASE}/${clean}` : `${BASE}/uploads/${clean}`;
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

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {fleet?.image ? (
              <img src={imgUrl(fleet.image)} alt={fleet.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200" />
            ) : (
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                {fleet?.name?.[0]?.toUpperCase() || "F"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800">{fleet?.companyName || fleet?.name || "Loading..."}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{fleet?.name}</span>
                {fleet?.isActive && <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">✓ Active</span>}
                {fleet && !fleet.isActive && <span className="text-xs bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-full">Inactive</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !fleet ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Failed to load fleet data.</div>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Cars",     value: fleet.totalCars     ?? 0, color: "bg-indigo-50 text-indigo-600" },
                { label: "Total Drivers",  value: fleet.totalDrivers  ?? 0, color: "bg-emerald-50 text-emerald-600" },
                { label: "Total Earnings", value: `₹${fleet.totalEarnings ?? 0}`, color: "bg-amber-50 text-amber-600" },
                { label: "Wallet",         value: `₹${fleet.walletBalance ?? 0}`, color: "bg-purple-50 text-purple-600" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-5">
                <Section title="👤 Profile">
                  <InfoRow label="Owner Name" value={fleet.name} />
                  <InfoRow label="Email"      value={fleet.email} />
                  <InfoRow label="Phone"      value={fleet.phone} />
                  <InfoRow label="Joined"     value={fleet.createdAt ? new Date(fleet.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                </Section>
                <Section title="🏦 Bank Details">
                  <InfoRow label="Account No"  value={fleet.bankDetails?.accountNumber} />
                  <InfoRow label="IFSC"         value={fleet.bankDetails?.ifscCode} />
                  <InfoRow label="Bank"         value={fleet.bankDetails?.bankName} />
                  <InfoRow label="Holder Name" value={fleet.bankDetails?.accountHolderName} />
                </Section>
              </div>
              {/* Right */}
              <div className="space-y-5">
                <Section title="🏢 Business Details">
                  <InfoRow label="Company"    value={fleet.companyName} />
                  <InfoRow label="GST Number" value={fleet.gstNumber} />
                  <InfoRow label="PAN Number" value={fleet.panNumber} />
                  <InfoRow label="Commission" value={fleet.commissionPercentage != null ? `${fleet.commissionPercentage}%` : null} />
                </Section>
                <Section title="📍 Address">
                  <InfoRow label="Address" value={fleet.address} />
                  <InfoRow label="City"    value={fleet.city} />
                  <InfoRow label="State"   value={fleet.state} />
                  <InfoRow label="Pincode" value={fleet.pincode} />
                </Section>
              </div>
            </div>

            {/* Documents */}
            <Section title="📁 Documents & Photo">
              <div className="grid grid-cols-4 gap-3">
                <DocImg label="Profile Photo"    src={imgUrl(fleet.image)} />
                <DocImg label="GST Certificate"  src={imgUrl(fleet.documents?.gstCertificate)} />
                <DocImg label="PAN Card"         src={imgUrl(fleet.documents?.panCard)} />
                <DocImg label="Business License" src={imgUrl(fleet.documents?.businessLicense)} />
              </div>
            </Section>

          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Fleet() {
  const [fleets, setFleets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [viewFleet, setViewFleet] = useState(null);
  const [editFleet, setEditFleet] = useState(null);

  const fetchFleets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyFleets();
      if (data.success) setFleets(data.fleets || []);
    } catch {
      toast.error("Failed to fetch fleets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFleets(); }, [fetchFleets]);

  const handleToggle = async (id) => {
    try {
      const data = await toggleFleet(id);
      toast.success(data.message || "Status updated!");
      setFleets((prev) =>
        prev.map((f) => f._id === id ? { ...f, isActive: data.isActive } : f)
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fleet permanently?")) return;
    try {
      await deleteFleet(id);
      toast.success("Fleet deleted");
      setFleets((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Stats ──
  const total    = fleets.length;
  const active   = fleets.filter((f) => f.isActive).length;
  const inactive = fleets.filter((f) => !f.isActive).length;

  const pieData = [
    { name: "Active",   value: active },
    { name: "Inactive", value: inactive },
  ].filter((d) => d.value > 0);

  const barData = fleets.slice(0, 6).map((f) => ({
    name:   f.companyName?.split(" ")[0] || f.name?.split(" ")[0] || "Fleet",
    Active: f.isActive ? 1 : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fleet Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your registered fleet accounts</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FaPlus />
          Add Fleet
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FaBuilding}    label="Total Fleets" value={total}    color="text-indigo-600"  bg="bg-indigo-50" />
        <StatCard icon={FaCheckCircle} label="Active"       value={active}   color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={FaTimesCircle} label="Inactive"     value={inactive} color="text-red-500"     bg="bg-red-50" />
      </div>

      {/* ── Charts ── */}
      {total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Fleet Status Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Fleet Activity (Top 6)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="Active" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Fleet Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">All Fleets ({total})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaBuilding className="text-5xl text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No fleets yet. Add your first fleet!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Fleet Owner", "Company", "City", "Bank", "Status", "Toggle", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fleets.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                          {f.name?.[0]?.toUpperCase() || "F"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{f.name}</p>
                          <p className="text-xs text-gray-400">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{f.companyName || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{f.city || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{f.bankName || "—"}</p>
                      <p className="text-xs text-gray-400">{f.ifscCode || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${f.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {f.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(f._id)}
                        className="transition-transform duration-200 hover:scale-110"
                        title={f.isActive ? "Click to Deactivate" : "Click to Activate"}
                      >
                        {f.isActive
                          ? <FaToggleOn  className="text-3xl text-emerald-500" />
                          : <FaToggleOff className="text-3xl text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewFleet(f._id)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="View">
                          <FaEye className="text-xs" />
                        </button>
                        <button onClick={() => setEditFleet(f)} className="p-2 bg-amber-50 text-amber-500 rounded-lg hover:bg-amber-100 transition-colors" title="Edit">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => handleDelete(f._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                          <FaTrash className="text-xs" />
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

      {/* ── Modals ── */}
      {showAdd   && <AddFleetModal    onClose={() => setShowAdd(false)}   onSuccess={fetchFleets} />}
      {editFleet && <UpdateFleetModal fleet={editFleet} onClose={() => setEditFleet(null)} onSuccess={fetchFleets} />}
      {viewFleet && <ViewFleetModal   fleetId={viewFleet} onClose={() => setViewFleet(null)} />}
    </div>
  );
}

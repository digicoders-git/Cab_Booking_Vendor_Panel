import { useState, useEffect, useCallback, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  FaUserPlus, FaUsers, FaCheckCircle, FaTimesCircle,
  FaWifi, FaEdit, FaTrash, FaEye, FaTimes, FaCar,
  FaToggleOn, FaToggleOff
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

// ─── Modal: Add Driver ────────────────────────────────────────────────────────
const AddDriverModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    licenseNumber: "", licenseExpiry: "",
    carNumber: "", carModel: "", carBrand: "", carType: "", carColor: "", manufacturingYear: "",
    accountNumber: "", ifscCode: "", bankName: "", accountHolderName: "",
    address: "", city: "", state: "", pincode: "",
  });
  const [files, setFiles] = useState({ image: null, rcImage: null, insuranceImage: null, permitImage: null, pucImage: null });
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [carCategories, setCarCategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/car-categories/active`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCarCategories(d.categories || []); })
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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

      await api("/api/vendors/create-driver", { method: "POST", body: fd });
      toast.success("Driver registered successfully!");
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
      { name: "name",     label: "Full Name",  type: "text",     placeholder: "Priyanshu" },
      { name: "email",    label: "Email",       type: "email",    placeholder: "priyanshu@test.com" },
      { name: "phone",    label: "Phone",       type: "text",     placeholder: "7068767516" },
      { name: "password", label: "Password",    type: "password", placeholder: "••••••••" },
    ],
    license: [
      { name: "licenseNumber", label: "License Number", type: "text", placeholder: "UP-14-ABC-123" },
      { name: "licenseExpiry", label: "License Expiry", type: "date", placeholder: "" },
    ],
    car: [
      { name: "carNumber",         label: "Car Number",          type: "text", placeholder: "UP-14-AB-1234" },
      { name: "carModel",          label: "Car Model",           type: "text", placeholder: "Swift Dzire" },
      { name: "carBrand",          label: "Car Brand",           type: "text", placeholder: "Maruti Suzuki" },
      { name: "carColor",          label: "Car Color",           type: "text", placeholder: "White" },
      { name: "manufacturingYear", label: "Manufacturing Year",  type: "text", placeholder: "2023" },
    ],
    bank: [
      { name: "accountNumber",     label: "Account Number",      type: "text", placeholder: "1234567890" },
      { name: "ifscCode",          label: "IFSC Code",           type: "text", placeholder: "HDFC000123" },
      { name: "bankName",          label: "Bank Name",           type: "text", placeholder: "HDFC Bank" },
      { name: "accountHolderName", label: "Account Holder Name", type: "text", placeholder: "Priyanshu" },
    ],
    address: [
      { name: "address", label: "Address", type: "text", placeholder: "Polytechnic Road", full: true },
      { name: "city",    label: "City",    type: "text", placeholder: "AMBEDKAR NAGAR" },
      { name: "state",   label: "State",   type: "text", placeholder: "Uttar Pradesh" },
      { name: "pincode", label: "Pincode", type: "text", placeholder: "275203" },
    ],
  };

  const fileFields = [
    { name: "image",           label: "Driver Photo 🖼️" },
    { name: "rcImage",         label: "RC Copy 📄" },
    { name: "insuranceImage",  label: "Insurance 📄" },
    { name: "permitImage",     label: "Permit 📄" },
    { name: "pucImage",        label: "PUC Copy 📄" },
  ];

  const sectionLabels = {
    profile: "👤 Profile",
    license: "🪪 License",
    car:     "🚗 Car Details",
    bank:    "🏦 Bank Details",
    address: "📍 Address",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FaUserPlus className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Register New Driver</h2>
              <p className="text-xs text-gray-400">Fill all sections to register driver</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Text Sections */}
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
                {section === "car" && (
                  <div key="carType">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Car Type</label>
                    <select
                      name="carType"
                      value={form.carType}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-gray-50"
                    >
                      <option value="">-- Select Car Type --</option>
                      {carCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} — ₹{cat.baseFare} base / ₹{cat.perKmRate}/km
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </Fragment>
            ))}

            {/* Documents */}
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

          {/* Footer Buttons */}
          <div className="flex gap-3 mt-6 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: Update Driver ────────────────────────────────────────────────────
const UpdateDriverModal = ({ driver, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: driver.name || "",
    email: driver.email || "",
    phone: driver.phone || "",
    password: "",
    licenseNumber: driver.licenseNumber || "",
    licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split("T")[0] : "",
    carNumber: driver.carDetails?.carNumber || "",
    carModel: driver.carDetails?.carModel || "",
    carBrand: driver.carDetails?.carBrand || "",
    carType: driver.carDetails?.carType?._id || driver.carDetails?.carType || "",
    carColor: driver.carDetails?.carColor || "",
    manufacturingYear: driver.carDetails?.manufacturingYear || "",
    accountNumber: driver.bankDetails?.accountNumber || "",
    ifscCode: driver.bankDetails?.ifscCode || "",
    bankName: driver.bankDetails?.bankName || "",
    accountHolderName: driver.bankDetails?.accountHolderName || "",
    address: driver.address || "",
    city: driver.city || "",
    state: driver.state || "",
    pincode: driver.pincode || "",
  });
  const [files, setFiles] = useState({ image: null, rcImage: null, insuranceImage: null, permitImage: null, pucImage: null });
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [carCategories, setCarCategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/car-categories/active`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCarCategories(d.categories || []); })
      .catch(() => {});
  }, []);

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
      await api(`/api/vendors/update-driver/${driver._id}`, { method: "PUT", body: fd });
      toast.success("Driver updated successfully!");
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
    license: [
      { name: "licenseNumber", label: "License Number", type: "text", placeholder: "" },
      { name: "licenseExpiry", label: "License Expiry", type: "date", placeholder: "" },
    ],
    car: [
      { name: "carNumber",         label: "Car Number",         type: "text", placeholder: "" },
      { name: "carModel",          label: "Car Model",          type: "text", placeholder: "" },
      { name: "carBrand",          label: "Car Brand",          type: "text", placeholder: "" },
      { name: "carColor",          label: "Car Color",          type: "text", placeholder: "" },
      { name: "manufacturingYear", label: "Manufacturing Year", type: "text", placeholder: "" },
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
    { name: "image",          label: "Driver Photo 🖼️" },
    { name: "rcImage",        label: "RC Copy 📄" },
    { name: "insuranceImage", label: "Insurance 📄" },
    { name: "permitImage",    label: "Permit 📄" },
    { name: "pucImage",       label: "PUC Copy 📄" },
  ];

  const sectionLabels = {
    profile: "👤 Profile",
    license: "🪪 License",
    car:     "🚗 Car Details",
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
              <h2 className="text-lg font-bold text-gray-800">Update Driver</h2>
              <p className="text-xs text-gray-400">{driver.name}</p>
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
                {section === "car" && (
                  <div key="carType">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Car Type</label>
                    <select
                      name="carType"
                      value={form.carType}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50"
                    >
                      <option value="">-- Select Car Type --</option>
                      {carCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} — ₹{cat.baseFare} base / ₹{cat.perKmRate}/km
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
              {loading ? "Updating..." : "Update Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: View Driver ───────────────────────────────────────────────────────
const ViewDriverModal = ({ driverId, onClose }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    api(`/api/vendors/driver/${driverId}`)
      .then((d) => { if (d.success) setDriver(d.driver); })
      .catch(() => toast.error("Failed to load driver details"))
      .finally(() => setLoading(false));
  }, [driverId]);

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

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {driver?.image ? (
              <img src={imgUrl(driver.image)} alt={driver.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200" />
            ) : (
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                {driver?.name?.[0]?.toUpperCase() || "D"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800">{driver?.name || "Loading..."}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${driver?.isOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
                <span className="text-xs text-gray-400">{driver?.isOnline ? "Online" : "Offline"}</span>
                {driver?.isApproved && <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">✓ Approved</span>}
                {!driver?.isApproved && driver && <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">Pending</span>}
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
        ) : !driver ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Failed to load driver data.</div>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Trips",   value: driver.totalTrips ?? 0,                  color: "bg-indigo-50 text-indigo-600" },
                { label: "Total Earnings",value: `₹${driver.totalEarnings ?? 0}`,         color: "bg-emerald-50 text-emerald-600" },
                { label: "Wallet",        value: `₹${driver.walletBalance ?? 0}`,         color: "bg-amber-50 text-amber-600" },
                { label: "Rating",        value: `⭐ ${driver.rating ?? 0}`,              color: "bg-purple-50 text-purple-600" },
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
                  <InfoRow label="Email"   value={driver.email} />
                  <InfoRow label="Phone"   value={driver.phone} />
                  <InfoRow label="Active"  value={driver.isActive ? "✅ Active" : "❌ Inactive"} />
                  <InfoRow label="Available" value={driver.isAvailable ? "✅ Yes" : "❌ No"} />
                  <InfoRow label="Joined"  value={driver.createdAt ? new Date(driver.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                </Section>

                <Section title="🪪 License">
                  <InfoRow label="License No" value={driver.licenseNumber} />
                  <InfoRow label="Expiry"     value={driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                </Section>

                <Section title="🏦 Bank Details">
                  <InfoRow label="Account No"  value={driver.bankDetails?.accountNumber} />
                  <InfoRow label="IFSC"         value={driver.bankDetails?.ifscCode} />
                  <InfoRow label="Bank"         value={driver.bankDetails?.bankName} />
                  <InfoRow label="Holder Name" value={driver.bankDetails?.accountHolderName} />
                </Section>
              </div>

              {/* Right */}
              <div className="space-y-5">
                <Section title="🚗 Car Details">
                  <InfoRow label="Car Number" value={driver.carDetails?.carNumber} />
                  <InfoRow label="Model"      value={driver.carDetails?.carModel} />
                  <InfoRow label="Brand"      value={driver.carDetails?.carBrand} />
                  <InfoRow label="Color"      value={driver.carDetails?.carColor} />
                  <InfoRow label="Year"       value={driver.carDetails?.manufacturingYear} />
                </Section>

                <Section title="📍 Address">
                  <InfoRow label="Address" value={driver.address} />
                  <InfoRow label="City"    value={driver.city} />
                  <InfoRow label="State"   value={driver.state} />
                  <InfoRow label="Pincode" value={driver.pincode} />
                </Section>
              </div>
            </div>

            {/* Documents */}
            <Section title="📁 Documents & Photo">
              <div className="grid grid-cols-5 gap-3">
                <DocImg label="Driver Photo"  src={imgUrl(driver.image)} />
                <DocImg label="RC"            src={imgUrl(driver.carDetails?.carDocuments?.rc)} />
                <DocImg label="Insurance"     src={imgUrl(driver.carDetails?.carDocuments?.insurance)} />
                <DocImg label="Permit"        src={imgUrl(driver.carDetails?.carDocuments?.permit)} />
                <DocImg label="PUC"           src={imgUrl(driver.carDetails?.carDocuments?.puc)} />
              </div>
            </Section>

          </div>
        )}

        {/* Footer */}
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
export default function Drivers() {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewDriver, setViewDriver] = useState(null);
  const [editDriver, setEditDriver] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/vendors/my/drivers");
      if (data.success) setDrivers(data.drivers || []);
    } catch {
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this driver permanently?")) return;
    try {
      await api(`/api/vendors/delete-driver/${id}`, { method: "DELETE" });
      toast.success("Driver deleted");
      fetchDrivers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      const data = await api(`/api/vendors/toggle-driver/${id}`, { method: "PATCH" });
      toast.success(data.message || "Status updated!");
      setDrivers((prev) =>
        prev.map((d) => d._id === id ? { ...d, isActive: data.isActive } : d)
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Stats ──
  const total    = drivers.length;
  const approved = drivers.filter((d) => d.isApproved).length;
  const online   = drivers.filter((d) => d.isOnline).length;
  const inactive = drivers.filter((d) => !d.isActive).length;

  // ── Chart Data ──
  const pieData = [
    { name: "Approved",    value: approved },
    { name: "Online",      value: online },
    { name: "Inactive",    value: inactive },
    { name: "Pending",     value: total - approved },
  ].filter((d) => d.value > 0);

  const barData = drivers.slice(0, 6).map((d) => ({
    name: d.name?.split(" ")[0] || "Driver",
    Approved: d.isApproved ? 1 : 0,
    Online:   d.isOnline   ? 1 : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Drivers</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your registered drivers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FaUserPlus />
          Add Driver
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FaUsers}       label="Total Drivers"    value={total}    color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={FaCheckCircle} label="Approved"         value={approved} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={FaWifi}        label="Online Now"        value={online}   color="text-amber-500"  bg="bg-amber-50" />
        <StatCard icon={FaTimesCircle} label="Inactive"         value={inactive} color="text-red-500"    bg="bg-red-50" />
      </div>

      {/* ── Charts ── */}
      {total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Driver Status Overview</h3>
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

          {/* Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Driver Activity (Top 6)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="Approved" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Online"   fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Drivers Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">All Drivers ({total})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <FaCar className="text-5xl mb-3" />
            <p className="text-sm font-medium text-gray-400">No drivers yet. Add your first driver!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Driver", "Car Details", "Approved", "Active", "Online", "Toggle", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {drivers.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                          {d.name?.[0]?.toUpperCase() || "D"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{d.carDetails?.carModel || "—"}</p>
                      <p className="text-xs text-gray-400">{d.carDetails?.carNumber || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${d.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {d.isApproved ? "✓ Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${d.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${d.isOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
                      <span className="ml-2 text-xs text-gray-500">{d.isOnline ? "Online" : "Offline"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(d._id, d.isActive)}
                        title={d.isActive ? "Click to Deactivate" : "Click to Activate"}
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        {d.isActive
                          ? <FaToggleOn  className="text-3xl text-emerald-500" />
                          : <FaToggleOff className="text-3xl text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewDriver(d)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="View"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          onClick={() => setEditDriver(d)}
                          className="p-2 bg-amber-50 text-amber-500 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
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
      {showAdd && (
        <AddDriverModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchDrivers}
        />
      )}
      {editDriver && (
        <UpdateDriverModal
          driver={editDriver}
          onClose={() => setEditDriver(null)}
          onSuccess={fetchDrivers}
        />
      )}
      {viewDriver && (
        <ViewDriverModal
          driverId={viewDriver._id}
          onClose={() => setViewDriver(null)}
        />
      )}
    </div>
  );
}

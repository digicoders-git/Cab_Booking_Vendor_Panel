import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { toast } from "sonner";
import { 
  User, Mail, Phone, Building2, MapPin, Map, 
  CreditCard, Landmark, Wallet, Camera, Save, 
  Edit3, X, CheckCircle2, Hash, Percent,
  Lock, ShieldCheck, Key
} from "lucide-react";

// ─── Helper Components (Defined outside to prevent re-mounting on state change) ─
const InfoGroup = ({ title, children, icon: Icon, color = "indigo" }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 bg-${color}-50 rounded-lg text-${color}-600`}>
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const DisplayItem = ({ icon: Icon, label, value, name, editable = true, isEditing, formData, onChange, type = "text" }) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
      <Icon size={12} className="text-indigo-400" />
      {label}
    </label>
    {isEditing && editable ? (
      <input
        type={type}
        name={name}
        value={name.includes('.') ? name.split('.').reduce((acc, part) => acc?.[part], formData) || "" : formData[name] || ""}
        onChange={onChange}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        placeholder={`Enter ${label}`}
      />
    ) : (
      <p className="text-gray-800 font-medium px-1 truncate capitalize">
        {type === "password" ? "••••••••" : (value || <span className="text-gray-300 italic">Not set</span>)}
      </p>
    )}
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api("/api/vendors/profile/me");
      if (res.success) {
        setProfile(res.vendor);
        setFormData({ ...res.vendor, password: "", confirmPassword: "" });
      }
    } catch (error) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Password validation if attempting to change
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const updateToast = toast.loading("Updating profile...");

    try {
      const fd = new FormData();
      
      // Basic info
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      fd.append("companyName", formData.companyName || "");
      
      // Address info
      fd.append("address", formData.address || "");
      fd.append("city", formData.city || "");
      fd.append("state", formData.state || "");
      fd.append("pincode", formData.pincode || "");
      
      // Bank info
      if (formData.bankDetails) {
        fd.append("accountNumber", formData.bankDetails.accountNumber || "");
        fd.append("ifscCode", formData.bankDetails.ifscCode || "");
        fd.append("accountHolderName", formData.bankDetails.accountHolderName || "");
        fd.append("bankName", formData.bankDetails.bankName || "");
      }

      // Password
      if (formData.password) {
        fd.append("password", formData.password);
      }

      // Image
      if (selectedFile) {
        fd.append("image", selectedFile);
      }

      const res = await api("/api/vendors/profile/self-update", {
        method: "PUT",
        body: fd
      });

      if (res.success) {
        toast.success(res.message || "Profile updated successfully!", { id: updateToast });
        setProfile(res.vendor);
        setIsEditing(false);
        setFormData(prev => ({ ...res.vendor, password: "", confirmPassword: "" }));
        setImagePreview(null);
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong", { id: updateToast });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      
      {/* ── Profile Header ── */}
      <div className="relative group rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-1 shadow-2xl shadow-indigo-100">
        <div className="bg-white rounded-[1.4rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 text-center md:text-left">
            <div className="relative inline-block group/img">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
                <img 
                  src={imagePreview || (profile?.image ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${profile.image}` : `https://ui-avatars.com/api/?name=${profile?.name}&background=6366f1&color=fff&size=500`)} 
                  alt={profile?.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                />
              </div>
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-[2px] rounded-2xl"
                >
                  <Camera className="text-white" size={32} />
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 space-y-2 relative z-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile?.name}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 self-center">
                <CheckCircle2 size={12} /> Active Vendor
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-gray-500 font-medium text-sm">
              <span className="flex items-center gap-2"><Building2 size={16} className="text-indigo-400" /> {profile?.companyName}</span>
              <span className="flex items-center gap-2"><MapPin size={16} className="text-indigo-400" /> {profile?.city}, {profile?.state}</span>
              <span className="flex items-center gap-2 text-indigo-600 font-bold"><Percent size={16} /> {profile?.commissionPercentage}% Comm.</span>
            </div>
          </div>

          <div className="flex gap-3 relative z-10 w-full md:w-auto">
            {isEditing ? (
              <>
                <button 
                  onClick={() => { setIsEditing(false); setFormData({ ...profile, password: "", confirmPassword: "" }); setImagePreview(null); }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Save size={18} /> Save Details
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Wallet size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Wallet Balance</p><p className="text-2xl font-black text-gray-800">₹{profile?.walletBalance?.toLocaleString("en-IN")}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-fuchsia-50 rounded-xl flex items-center justify-center text-fuchsia-600"><Map size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Assigned Area</p><p className="text-lg font-bold text-gray-800 line-clamp-1">{profile?.assignedArea}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Percent size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Commission</p><p className="text-2xl font-black text-gray-800">{profile?.commissionPercentage}%</p></div>
        </div>
      </div>

      {/* ── Forms ── */}
      <div className="grid grid-cols-1 gap-8">
        
        <InfoGroup title="Basic Information" icon={User}>
          <DisplayItem icon={User} label="Full Name" value={profile?.name} name="name" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Phone} label="Phone Number" value={profile?.phone} name="phone" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Mail} label="Email Address" value={profile?.email} name="email" editable={false} isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Building2} label="Company Name" value={profile?.companyName} name="companyName" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
        </InfoGroup>

        <InfoGroup title="Bank Details" icon={Landmark} color="violet">
          <DisplayItem icon={User} label="Account Holder" value={profile?.bankDetails?.accountHolderName} name="bankDetails.accountHolderName" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Landmark} label="Bank Name" value={profile?.bankDetails?.bankName} name="bankDetails.bankName" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Hash} label="Account Number" value={profile?.bankDetails?.accountNumber} name="bankDetails.accountNumber" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={CreditCard} label="IFSC Code" value={profile?.bankDetails?.ifscCode} name="bankDetails.ifscCode" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
        </InfoGroup>

        <InfoGroup title="Address & Location" icon={MapPin} color="fuchsia">
          <DisplayItem icon={MapPin} label="Street Address" value={profile?.address} name="address" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Building2} label="City" value={profile?.city} name="city" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Map} label="State" value={profile?.state} name="state" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={Hash} label="Pincode" value={profile?.pincode} name="pincode" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
        </InfoGroup>

        <InfoGroup title="Security Settings" icon={Lock} color="rose">
          <DisplayItem icon={Key} label="New Password" type="password" name="password" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          <DisplayItem icon={ShieldCheck} label="Confirm Password" type="password" name="confirmPassword" isEditing={isEditing} formData={formData} onChange={handleInputChange} />
          {!isEditing && <p className="col-span-2 text-xs text-gray-400 mt-2 italic">Edit profile to update your password.</p>}
        </InfoGroup>

      </div>

      <div className="text-center pb-8 pt-4">
        <p className="text-gray-400 text-xs font-medium">Vendor ID: <span className="font-mono">{profile?._id}</span></p>
      </div>

    </div>
  );
}

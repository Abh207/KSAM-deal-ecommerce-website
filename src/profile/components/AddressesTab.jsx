import { useState, useId } from "react";
import { Plus, MapPin, Home, Briefcase, Tag, Trash2, Edit2, Check, X, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const INITIAL_FORM = {
  label: "Home",
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "Delhi",
  pincode: "",
  country: "India",
  is_default: false
};

export default function AddressesTab({
  addresses = [],
  userId,
  onReloadAddresses,
  onShowToast
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Open modal for new address
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      is_default: addresses.length === 0 // automatically default if first
    });
    setErrors({});
    setModalOpen(true);
  };

  // Open modal for editing existing address
  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      label: addr.label || "Home",
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "Delhi",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      is_default: !!addr.is_default
    });
    setErrors({});
    setModalOpen(true);
  };

  // Validate address form
  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = "Full name is required.";
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit mobile number.";
    }
    if (!formData.line1.trim()) errs.line1 = "Address line 1 is required.";
    if (!formData.city.trim()) errs.city = "City is required.";
    if (!formData.state) errs.state = "Please select a state.";
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit Indian PIN code.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save address (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate() || !userId) return;

    setSaving(true);
    try {
      // If setting this address as default, unset existing default first
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from("addresses")
          .update({
            label: formData.label,
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            line1: formData.line1.trim(),
            line2: formData.line2.trim() || null,
            landmark: formData.landmark.trim() || null,
            city: formData.city.trim(),
            state: formData.state,
            pincode: formData.pincode.trim(),
            country: formData.country || "India",
            is_default: formData.is_default
          })
          .eq("id", editingId)
          .eq("user_id", userId);

        if (error) throw error;
        onShowToast("Address updated successfully!");
      } else {
        // Insert
        const { error } = await supabase
          .from("addresses")
          .insert({
            user_id: userId,
            label: formData.label,
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            line1: formData.line1.trim(),
            line2: formData.line2.trim() || null,
            landmark: formData.landmark.trim() || null,
            city: formData.city.trim(),
            state: formData.state,
            pincode: formData.pincode.trim(),
            country: formData.country || "India",
            is_default: formData.is_default || addresses.length === 0
          });

        if (error) throw error;
        onShowToast("New address added successfully!");
      }

      setModalOpen(false);
      onReloadAddresses();
    } catch (err) {
      console.error("[Save Address Error]", err);
      setErrors({ form: err.message || "Failed to save address." });
    } finally {
      setSaving(false);
    }
  };

  // Set address as default
  const handleSetDefault = async (addrId) => {
    if (!userId) return;
    try {
      // Unset all default
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      // Set target as default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addrId)
        .eq("user_id", userId);

      if (error) throw error;
      onShowToast("Default delivery address updated!");
      onReloadAddresses();
    } catch (err) {
      console.error("[Set Default Error]", err);
      onShowToast("Failed to update default address.");
    }
  };

  // Confirm delete address
  const confirmDelete = async () => {
    if (!deleteTarget || !userId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", deleteTarget.id)
        .eq("user_id", userId);

      if (error) throw error;
      onShowToast("Address removed successfully.");
      setDeleteTarget(null);
      onReloadAddresses();
    } catch (err) {
      console.error("[Delete Address Error]", err);
      onShowToast("Failed to delete address.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Saved Addresses">
      {/* Top Bar */}
      <div className="ks-address-topbar">
        <div>
          <h2 className="ks-card-title">
            <MapPin size={20} color="#38BDF8" />
            <span>Saved Addresses</span>
          </h2>
          <p className="ks-card-desc">
            Manage your delivery and billing locations for fast 1-click checkout.
          </p>
        </div>
        <button type="button" className="ks-btn-primary" onClick={handleAddNew}>
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="ks-empty-state-stack">
          <div className="ks-empty-state-icon bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
            <MapPin size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No addresses saved yet</h3>
            <p className="text-xs text-gray-400">
              Add your primary shipping pin code so you can easily check deal shipping eligibility and speed.
            </p>
          </div>
          <button type="button" className="ks-btn-primary ks-empty-state-btn" onClick={handleAddNew}>
            <Plus size={16} />
            <span>Add Delivery Address</span>
          </button>
        </div>
      ) : (
        <div className="ks-address-grid">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`ks-address-card${addr.is_default ? " is-default" : ""}`}
            >
              <div>
                <div className="ks-address-card-header">
                  <span className="ks-address-label-badge">
                    {addr.label === "Home" && <Home size={12} />}
                    {addr.label === "Work" && <Briefcase size={12} />}
                    {addr.label !== "Home" && addr.label !== "Work" && <Tag size={12} />}
                    <span>{addr.label}</span>
                  </span>

                  {addr.is_default && (
                    <span className="ks-address-default-badge">
                      <Check size={12} /> Default
                    </span>
                  )}
                </div>

                <h3 className="ks-address-name">{addr.full_name}</h3>
                <p className="ks-address-phone">{addr.phone}</p>

                <p className="ks-address-lines">
                  {addr.line1}
                  {addr.line2 && <>, {addr.line2}</>}
                  {addr.landmark && <>, Near {addr.landmark}</>}
                  <br />
                  {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  <br />
                  {addr.country}
                </p>
              </div>

              <div className="ks-address-card-actions">
                <button
                  type="button"
                  className="ks-address-act-btn"
                  onClick={() => handleEdit(addr)}
                >
                  <Edit2 size={13} style={{ display: "inline", marginRight: 4 }} />
                  Edit
                </button>

                <button
                  type="button"
                  className="ks-address-act-btn delete"
                  onClick={() => setDeleteTarget(addr)}
                >
                  <Trash2 size={13} style={{ display: "inline", marginRight: 4 }} />
                  Delete
                </button>

                {!addr.is_default && (
                  <button
                    type="button"
                    className="ks-address-act-btn set-default"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Dedicated "Add Address" Card inside the Grid */}
          <button
            type="button"
            onClick={handleAddNew}
            className="ks-address-card flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/15 hover:border-[#38BDF8]/50 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer min-h-[220px] text-center group rounded-2xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Plus size={22} />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-[#38BDF8] transition">Add Another Address</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Save office, warehouse or home addresses for 1-click checkout</p>
          </button>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div
          className="ks-modal-backdrop"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ks-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ks-modal-header">
              <h3 className="ks-modal-title">
                {editingId ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                className="ks-modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {errors.form && (
              <div
                className="ks-input-error"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  padding: "10px 14px",
                  borderRadius: 10,
                  marginBottom: 16
                }}
              >
                <AlertCircle size={15} />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleSave} noValidate>
              {/* Address Label Selector */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                  Address Type
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      className={`ks-filter-chip${formData.label === lbl ? " is-selected" : ""}`}
                      onClick={() => setFormData({ ...formData, label: lbl })}
                    >
                      {lbl === "Home" && <Home size={13} />}
                      {lbl === "Work" && <Briefcase size={13} />}
                      {lbl === "Other" && <Tag size={13} />}
                      <span>{lbl}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ks-form-grid">
                {/* Full Name */}
                <div className="ks-float-group">
                  <input
                    type="text"
                    className="ks-float-input"
                    placeholder=" "
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                  <label className="ks-float-label">Full Name</label>
                  {errors.full_name && (
                    <span className="ks-input-error">
                      <AlertCircle size={12} /> {errors.full_name}
                    </span>
                  )}
                </div>

                {/* 10-digit Phone */}
                <div className="ks-float-group">
                  <input
                    type="tel"
                    className="ks-float-input"
                    placeholder=" "
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                      })
                    }
                  />
                  <label className="ks-float-label">Mobile Number (10 digits)</label>
                  {errors.phone && (
                    <span className="ks-input-error">
                      <AlertCircle size={12} /> {errors.phone}
                    </span>
                  )}
                </div>

                {/* Address Line 1 */}
                <div className="ks-float-group ks-form-col-full">
                  <input
                    type="text"
                    className="ks-float-input"
                    placeholder=" "
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  />
                  <label className="ks-float-label">Flat, House no., Building, Company, Apartment</label>
                  {errors.line1 && (
                    <span className="ks-input-error">
                      <AlertCircle size={12} /> {errors.line1}
                    </span>
                  )}
                </div>

                {/* Address Line 2 */}
                <div className="ks-float-group ks-form-col-full">
                  <input
                    type="text"
                    className="ks-float-input"
                    placeholder=" "
                    value={formData.line2}
                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  />
                  <label className="ks-float-label">Area, Colony, Street, Sector, Village (Optional)</label>
                </div>

                {/* Landmark */}
                <div className="ks-float-group">
                  <input
                    type="text"
                    className="ks-float-input"
                    placeholder=" "
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                  <label className="ks-float-label">Landmark (e.g. Near Apollo Hospital)</label>
                </div>

                {/* City */}
                <div className="ks-float-group">
                  <input
                    type="text"
                    className="ks-float-input"
                    placeholder=" "
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  <label className="ks-float-label">Town / City</label>
                  {errors.city && (
                    <span className="ks-input-error">
                      <AlertCircle size={12} /> {errors.city}
                    </span>
                  )}
                </div>

                {/* State Dropdown (All Indian States) */}
                <div className="ks-float-group">
                  <select
                    className="ks-float-select has-value"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <label className="ks-float-label">State / Province</label>
                  {errors.state && (
                    <span className="ks-input-error">
                      <AlertCircle size={12} /> {errors.state}
                    </span>
                  )}
                </div>

                {/* 6-digit Pincode */}
                <div className="ks-float-group">
                  <input
                    type="text"
                    className="ks-float-input"
                    placeholder=" "
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6)
                      })
                    }
                  />
                  <label className="ks-float-label">6-digit PIN Code</label>
                  {errors.pincode && (
                    <span className="ks-input-error">
                      <AlertCircle size={12} /> {errors.pincode}
                    </span>
                  )}
                </div>
              </div>

              {/* Set as default checkbox */}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    style={{ accentColor: "#22FF88", width: 18, height: 18 }}
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="ks-modal-footer">
                <button
                  type="button"
                  className="ks-btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ks-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="ks-modal-backdrop"
          onClick={() => setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ks-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h3 className="ks-modal-title" style={{ color: "#f87171" }}>
              Delete Address?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: "14px 0 24px" }}>
              Are you sure you want to delete this address? This action cannot be undone.
              <br />
              <strong style={{ color: "#ffffff", display: "block", marginTop: 8 }}>
                {deleteTarget.full_name} ({deleteTarget.label}) - {deleteTarget.city}, {deleteTarget.pincode}
              </strong>
            </p>
            <div className="ks-modal-footer">
              <button
                type="button"
                className="ks-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Keep Address
              </button>
              <button
                type="button"
                className="ks-btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

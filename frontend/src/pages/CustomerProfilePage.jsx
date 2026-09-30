import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Laptop, 
  Building, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  Database 
} from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';

export default function CustomerProfilePage({ currentUser, onLogout }) {
  const [profile, setProfile] = useState(currentUser || {});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [device, setDevice] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setName(data.name || '');
      setDevice(data.device || '');
      setCompany(data.company || '');
      setLocation(data.location || '');
    } catch (e) {
      console.warn('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateProfile({
        name,
        device,
        company,
        location
      });
      setProfile(updated);
      // Update local storage user
      const savedUser = JSON.parse(localStorage.getItem('supportmind_user') || '{}');
      const merged = { ...savedUser, ...updated };
      localStorage.setItem('supportmind_user', JSON.stringify(merged));

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Profile</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your account information and registered hardware</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile details successfully updated!</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header Banner */}
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 flex items-end pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 font-extrabold text-xl flex items-center justify-center shadow-lg border-2 border-white -mb-8">
                {profile.name ? profile.name[0].toUpperCase() : 'C'}
              </div>
              <div className="text-white pb-1">
                <h3 className="text-lg font-bold">{profile.name}</h3>
                <span className="text-xs text-blue-100 font-medium">Customer Account</span>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-8 pt-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Name</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{profile.name}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{profile.email}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Hardware / Device</span>
                </div>
                <div className="text-sm font-bold text-slate-800 font-mono">
                  {profile.device || 'Device not specified'}
                </div>

              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company / Organization</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {profile.company || 'Personal'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {profile.location || 'India'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Support Tier</span>
                </div>
                <div className="text-sm font-bold text-blue-600">
                  {profile.plan || 'Premium Support'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Security & Privacy Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Hindsight Cloud Memory Isolation</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your conversational memories and troubleshooting history are securely stored in an isolated Hindsight memory bank:
            <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded ml-1 text-[11px] font-semibold">
              SupportMind-{profile.customer_id || 'ID'}
            </span>.
            Memories are never leaked across accounts or shared with third parties.
          </p>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Device / Hardware
                </label>
                <input
                  type="text"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="e.g. Dell XPS 15, MacBook Pro M2"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Inc, Personal"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hyderabad, India"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

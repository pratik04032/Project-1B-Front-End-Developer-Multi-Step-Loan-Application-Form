import React, { useState, useEffect } from "react";
import { 
  setDefaulterStatus, 
  updateApplicationStatus,
  getAdminNotes,
  addAdminNote,
  deleteAdminNote
} from "../lib/firebase";
import { 
  ArrowLeft, 
  Search, 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  Calendar,
  X,
  RefreshCw,
  Radio,
  MessageSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AdminDashboardProps {
  applications: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
  currentUser?: { email: string; role: string } | null;
}

export default function AdminDashboard({
  applications,
  isLoading,
  onRefresh,
  onClose,
  currentUser
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [liveUpdates, setLiveUpdates] = useState(false);

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Private Admin Notes states
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, any[]>>({});
  const [loadingNotes, setLoadingNotes] = useState<Record<string, boolean>>({});
  const [newNoteTexts, setNewNoteTexts] = useState<Record<string, string>>({});
  const [addingNote, setAddingNote] = useState<Record<string, boolean>>({});
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const loadNotesForApp = async (appId: string) => {
    setLoadingNotes(prev => ({ ...prev, [appId]: true }));
    try {
      const appNotes = await getAdminNotes(appId);
      setNotes(prev => ({ ...prev, [appId]: appNotes }));
    } catch (err) {
      console.error("Failed to load notes for application:", appId, err);
    } finally {
      setLoadingNotes(prev => ({ ...prev, [appId]: false }));
    }
  };

  const handleToggleExpand = async (appId: string) => {
    if (expandedAppId === appId) {
      setExpandedAppId(null);
    } else {
      setExpandedAppId(appId);
      await loadNotesForApp(appId);
    }
  };

  const handleAddNote = async (appId: string) => {
    const text = newNoteTexts[appId]?.trim();
    if (!text) return;

    setAddingNote(prev => ({ ...prev, [appId]: true }));
    try {
      const adminEmail = currentUser?.email || "admin@lendswift.com";
      const res = await addAdminNote(appId, text, adminEmail);
      if (res.success) {
        setNewNoteTexts(prev => ({ ...prev, [appId]: "" }));
        await loadNotesForApp(appId);
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(prev => ({ ...prev, [appId]: false }));
    }
  };

  const handleDeleteNote = async (appId: string, noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this private note?")) return;
    setDeletingNoteId(noteId);
    try {
      const res = await deleteAdminNote(appId, noteId);
      if (res.success) {
        await loadNotesForApp(appId);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Sync selectedIds with valid application list in case an application is deleted or refreshed out
  useEffect(() => {
    const validIds = applications.map(app => app.id);
    setSelectedIds(prev => prev.filter(id => validIds.includes(id)));
  }, [applications]);

  // Periodic polling for Live Updates
  useEffect(() => {
    if (!liveUpdates) return;

    // Fetch immediately on mount or activation
    onRefresh();

    const interval = setInterval(() => {
      onRefresh();
    }, 6000); // Re-fetch from Firestore every 6 seconds

    return () => clearInterval(interval);
  }, [liveUpdates, onRefresh]);
  
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setStatusUpdatingId(id);
    try {
      await updateApplicationStatus(id, newStatus);
      onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredApps.map(app => app.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      // Deselect all filtered apps
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered apps
      setSelectedIds(prev => {
        const newSelection = [...prev];
        allFilteredIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleBulkStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map(id => updateApplicationStatus(id, newStatus))
      );
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      console.error("Failed to update status in bulk:", err);
    } finally {
      setBulkUpdating(false);
    }
  };
  
  // Custom dialog/modal state for flagging a defaulter
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState("Non-payment of previous loan EMI installments");

  // Calculate stats
  const totalApps = applications.length;
  const activeDefaulters = applications.filter(app => app.isDefaulter).length;
  const totalLoanVolume = applications.reduce((sum, app) => sum + (Number(app.loanAmount) || 0), 0);

  // Filter applications
  const filteredApps = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    return (
      (app.fullName || "").toLowerCase().includes(term) ||
      (app.id || "").toLowerCase().includes(term) ||
      (app.panNumber || "").toLowerCase().includes(term) ||
      (app.aadhaarNumber || "").toLowerCase().includes(term) ||
      (app.loanType || "").toLowerCase().includes(term)
    );
  });

  const handleToggleDefaulter = async (app: any) => {
    if (app.isDefaulter) {
      // Unflagging - direct toggle
      setUpdatingId(app.id);
      try {
        await setDefaulterStatus(app.id, app.panNumber, app.aadhaarNumber, app.fullName, false);
        onRefresh();
      } catch (err) {
        console.error("Failed to unflag", err);
      } finally {
        setUpdatingId(null);
      }
    } else {
      // Flagging - open custom input dialog
      setSelectedApp(app);
      setFlagReason("Defaulted on past EMIs / Outstanding unpaid balances");
      setFlagModalOpen(true);
    }
  };

  const submitFlagDefaulter = async () => {
    if (!selectedApp) return;
    setUpdatingId(selectedApp.id);
    setFlagModalOpen(false);
    try {
      await setDefaulterStatus(
        selectedApp.id, 
        selectedApp.panNumber, 
        selectedApp.aadhaarNumber, 
        selectedApp.fullName, 
        true, 
        flagReason
      );
      onRefresh();
    } catch (err) {
      console.error("Failed to flag", err);
    } finally {
      setUpdatingId(null);
      setSelectedApp(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-dashboard-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Application</span>
          </button>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-600" />
            <span>UtkalCred Defaulter Registry & Admin Dashboard</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor incoming loan requests, review uploaded data, and flag defaulters to secure future lending.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {/* Live Updates Toggle */}
          <button
            type="button"
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              liveUpdates
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs"
                : "bg-zinc-50 text-zinc-600 hover:text-zinc-900 border-zinc-200"
            }`}
          >
            <div className="relative flex h-2 w-2">
              {liveUpdates && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${liveUpdates ? "bg-emerald-500" : "bg-zinc-300"}`}></span>
            </div>
            <Radio className="h-3.5 w-3.5" />
            <span>Live Updates {liveUpdates ? "(On)" : "(Off)"}</span>
          </button>

          {/* Sync Database Button */}
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-400 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync Database</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-10 w-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Total Applications</span>
            <span className="text-xl font-bold text-zinc-900 font-mono">{totalApps}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-10 w-10 rounded bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Flagged Defaulters</span>
            <span className="text-xl font-bold text-red-600 font-mono">{activeDefaulters}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-10 w-10 rounded bg-green-50 text-green-700 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Approved Loan Volume</span>
            <span className="text-xl font-bold text-green-700 font-mono">{formatCurrency(totalLoanVolume)}</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND SEARCH SUMMARY */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 space-y-4 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search registry by Applicant Name, PAN, Aadhaar, Reference ID, or Loan Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans text-xs transition-all"
          />
        </div>

        {/* Bulk Actions Menu Banner */}
        {selectedIds.length > 0 && (
          <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold">
                {selectedIds.length}
              </span>
              <p className="text-xs font-semibold text-purple-950">
                Applications Selected for Bulk Actions
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={bulkUpdating}
                onClick={() => handleBulkStatusUpdate("APPROVED")}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {bulkUpdating ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                <span>Approve Selected</span>
              </button>
              <button
                type="button"
                disabled={bulkUpdating}
                onClick={() => handleBulkStatusUpdate("REJECTED")}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {bulkUpdating ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
                <span>Reject Selected</span>
              </button>
              <button
                type="button"
                disabled={bulkUpdating}
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LIST TABLE */}
        {isLoading ? (
          <div className="text-center py-12 space-y-3">
            <span className="inline-block animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></span>
            <p className="text-xs text-zinc-500 font-medium">Syncing with secured Cloud Firestore Registry...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <ShieldAlert className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-semibold">No applications found matching your filters</p>
            <p className="text-[10px] text-zinc-400 mt-1">Submit new applications or adjust your search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredApps.length > 0 && filteredApps.every(app => selectedIds.includes(app.id))}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-300 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Applicant details</th>
                  <th className="py-3 px-4">Loan Details</th>
                  <th className="py-3 px-4">KYC Registries</th>
                  <th className="py-3 px-4">Registry Status</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredApps.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr className={`hover:bg-zinc-50/60 transition-colors ${selectedIds.includes(app.id) ? "bg-purple-50/35" : ""}`}>
                      <td className="py-4 px-4 text-center w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => handleToggleSelect(app.id)}
                          className="rounded border-zinc-300 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      {/* 1. Name and reference ID */}
                      <td className="py-4 px-4 space-y-1">
                        <p className="font-semibold text-zinc-950 text-sm">{app.fullName || "Unnamed Applicant"}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-600">
                            {app.id}
                          </span>
                          {app.createdAt && (
                            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Loan details */}
                      <td className="py-4 px-4 space-y-1">
                        <p className="font-semibold text-zinc-900">{app.loanType} Loan</p>
                        <p className="font-mono text-[11px] text-zinc-500">
                          {formatCurrency(app.loanAmount)} ({app.loanTenure} mo)
                        </p>
                      </td>

                      {/* 3. KYC registries */}
                      <td className="py-4 px-4 space-y-1 font-mono text-[11px] text-zinc-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400 text-[10px] uppercase font-bold w-12">PAN:</span>
                          <span className="text-zinc-900 font-semibold">{app.panNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400 text-[10px] uppercase font-bold w-12">Aadhaar:</span>
                          <span className="text-zinc-900 font-semibold">{app.aadhaarNumber || "N/A"}</span>
                        </div>
                      </td>

                      {/* 4. Registry Status */}
                      <td className="py-4 px-4">
                        {app.isDefaulter ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded uppercase text-[9px] tracking-wider">
                              <ShieldAlert className="h-3 w-3" />
                              DEFAULTER
                            </span>
                            <p className="text-[9px] text-red-500 italic max-w-[150px] truncate" title={app.reason}>
                              {app.reason || "Past repayment failure"}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 font-bold px-2 py-0.5 rounded uppercase text-[9px] tracking-wider">
                            <CheckCircle className="h-3 w-3" />
                            CLEAN RECORD
                          </span>
                        )}
                      </td>

                      {/* 5. Application Status */}
                      <td className="py-4 px-4">
                        {app.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded uppercase text-[9px] tracking-wider">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            APPROVED
                          </span>
                        ) : app.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded uppercase text-[9px] tracking-wider">
                            <X className="h-3 w-3 text-rose-600" />
                            REJECTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded uppercase text-[9px] tracking-wider">
                            <TrendingUp className="h-3 w-3 text-amber-600" />
                            {app.status || "PRE-APPROVED"}
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                          {/* Private Notes Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleExpand(app.id)}
                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer inline-flex items-center gap-1 border ${
                              expandedAppId === app.id
                                ? "bg-zinc-800 text-white border-zinc-900 shadow-xs"
                                : "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200"
                            }`}
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Notes</span>
                            {expandedAppId === app.id ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>

                          {/* Status Update Buttons */}
                          <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 p-1 rounded-lg">
                            <button
                              onClick={() => handleUpdateStatus(app.id, "APPROVED")}
                              disabled={statusUpdatingId === app.id}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                app.status === "APPROVED"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                              disabled={statusUpdatingId === app.id}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                app.status === "REJECTED"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-zinc-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                              }`}
                            >
                              Reject
                            </button>
                          </div>

                          {/* Defaulter Action Trigger */}
                          <button
                            onClick={() => handleToggleDefaulter(app)}
                            disabled={updatingId === app.id}
                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer inline-flex items-center gap-1 ${
                              app.isDefaulter
                                ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            }`}
                          >
                            {updatingId === app.id ? (
                              <>
                                <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                                <span>Updating...</span>
                              </>
                            ) : app.isDefaulter ? (
                              <span>Clear</span>
                            ) : (
                              <span>Flag Defaulter</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Private Notes Expandable Row */}
                    {expandedAppId === app.id && (
                      <tr className="bg-zinc-50/70 select-none border-b border-zinc-200">
                        <td colSpan={7} className="p-4">
                          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 text-left max-w-4xl mx-auto">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4 text-purple-600" />
                                <span>Private Notes & Comments</span>
                                <span className="font-mono text-[10px] text-zinc-400 font-normal normal-case">
                                  (Visible only to administrators)
                                </span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => loadNotesForApp(app.id)}
                                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded"
                                title="Refresh comments"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${loadingNotes[app.id] ? "animate-spin text-purple-600" : ""}`} />
                              </button>
                            </div>

                            {/* Existing Notes list */}
                            {loadingNotes[app.id] && (!notes[app.id] || notes[app.id].length === 0) ? (
                              <div className="py-6 text-center text-zinc-400 text-xs flex items-center justify-center gap-1.5 font-medium">
                                <span className="animate-spin h-3.5 w-3.5 border-2 border-purple-600 border-t-transparent rounded-full"></span>
                                <span>Retrieving secured notes...</span>
                              </div>
                            ) : !notes[app.id] || notes[app.id].length === 0 ? (
                              <div className="py-6 text-center border border-dashed border-zinc-100 rounded-lg text-zinc-400 text-xs">
                                No private notes have been appended to this application yet.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {notes[app.id].map((note) => (
                                  <div key={note.id} className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 flex justify-between items-start gap-3">
                                    <div className="space-y-1">
                                      <p className="text-xs text-zinc-900 leading-relaxed font-medium whitespace-pre-wrap">
                                        {note.note}
                                      </p>
                                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium font-mono">
                                        <span className="text-purple-600 font-semibold">{note.createdBy}</span>
                                        <span>•</span>
                                        <span>
                                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Just now"}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteNote(app.id, note.id)}
                                      disabled={deletingNoteId === note.id}
                                      className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer shrink-0 p-1"
                                      title="Delete note"
                                    >
                                      {deletingNoteId === note.id ? (
                                        <span className="animate-spin h-3.5 w-3.5 border-2 border-red-600 border-t-transparent rounded-full block"></span>
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Note Input Form */}
                            <div className="space-y-2 pt-2 border-t border-zinc-100">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                Append Private Note
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  placeholder="Type administrative review comment, credit decision notes, verification status updates..."
                                  value={newNoteTexts[app.id] || ""}
                                  onChange={(e) => setNewNoteTexts(prev => ({ ...prev, [app.id]: e.target.value }))}
                                  rows={2}
                                  className="flex-1 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddNote(app.id)}
                                  disabled={addingNote[app.id] || !(newNoteTexts[app.id] || "").trim()}
                                  className="px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 text-white disabled:text-zinc-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 h-auto shrink-0 shadow-xs"
                                >
                                  {addingNote[app.id] ? (
                                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                                  ) : (
                                    <Plus className="h-3.5 w-3.5" />
                                  )}
                                  <span>Append Note</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOM FLAGGING MODAL OVERLAY */}
      {flagModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-base font-bold text-zinc-950">Flag Applicant as Defaulter</h3>
              </div>
              <button 
                onClick={() => setFlagModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Flagging **{selectedApp.fullName}** (PAN: {selectedApp.panNumber}) will black-list this PAN & Aadhaar combo in the central lending registry. Any future loan applications will display a critical warning banner to credit managers.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">Reason for Flagging *</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                placeholder="Describe reason for default (e.g., missed 3 consecutive EMI deadlines, fake passport provided)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFlagDefaulter}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Confirm Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

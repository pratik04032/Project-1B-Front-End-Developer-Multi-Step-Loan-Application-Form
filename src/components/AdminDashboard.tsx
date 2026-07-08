import React, { useState } from "react";
import { setDefaulterStatus, updateApplicationStatus } from "../lib/firebase";
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
  X
} from "lucide-react";

interface AdminDashboardProps {
  applications: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export default function AdminDashboard({
  applications,
  isLoading,
  onRefresh,
  onClose
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  
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
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-400 font-medium text-xs rounded transition-all cursor-pointer flex items-center gap-1.5"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Syncing...</span>
            </>
          ) : (
            <span>Sync Database</span>
          )}
        </button>
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
                  <tr key={app.id} className="hover:bg-zinc-50/60 transition-colors">
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
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
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
                            <span>Mark Clear</span>
                          ) : (
                            <span>Flag Defaulter</span>
                          )}
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

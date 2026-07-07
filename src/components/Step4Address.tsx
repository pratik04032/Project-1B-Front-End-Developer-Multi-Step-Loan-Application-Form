import React, { useState, useEffect } from "react";
import { FormState, ResidenceType } from "../types";
import { pinCodeDataset } from "../utils/pinCodeData";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

export default function Step4Address({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const {
    currentAddressLine1,
    currentAddressLine2,
    currentPinCode,
    currentCity,
    currentState,
    residenceType,
    rentAmount,
    yearsAtCurrentAddress,
    sameAsPermanent,
    permanentAddressLine1,
    permanentAddressLine2,
    permanentPinCode,
    permanentCity,
    permanentState
  } = formState;

  // Local state for PIN Code lookups
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinMatchedOffice, setPinMatchedOffice] = useState("");
  const [originalDerivedState, setOriginalDerivedState] = useState("");
  const [stateDiscrepancyWarning, setStateDiscrepancyWarning] = useState("");

  // Auto-fill trigger when 6 digit PIN is entered
  useEffect(() => {
    if (currentPinCode && /^\d{6}$/.test(currentPinCode)) {
      setPinLookupLoading(true);
      setTimeout(() => {
        const found = pinCodeDataset.find((rec) => rec.pin === currentPinCode);
        if (found) {
          updateFormState({
            currentCity: found.city,
            currentState: found.state
          });
          setPinMatchedOffice(found.office);
          setOriginalDerivedState(found.state);
          setStateDiscrepancyWarning("");
        } else {
          setPinMatchedOffice("");
          setOriginalDerivedState("");
          setStateDiscrepancyWarning("PIN code not found in our directory. Please enter city and state manually.");
        }
        setPinLookupLoading(false);
      }, 800);
    } else {
      setPinMatchedOffice("");
      setOriginalDerivedState("");
      setStateDiscrepancyWarning("");
    }
  }, [currentPinCode]);

  // Check state discrepancy when user modifies the auto-filled state
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateFormState({ currentState: val });

    if (originalDerivedState && val.toLowerCase().trim() !== originalDerivedState.toLowerCase().trim()) {
      setStateDiscrepancyWarning(`Warning: Selected state does not match the state (${originalDerivedState}) derived from PIN Code ${currentPinCode}.`);
    } else {
      setStateDiscrepancyWarning("");
    }
  };

  // Previous address block visibility
  const showPreviousAddress = yearsAtCurrentAddress !== undefined && yearsAtCurrentAddress < 1;

  // Handles same as permanent address copying
  const handleSameAsPermanentToggle = (checked: boolean) => {
    if (checked) {
      updateFormState({
        sameAsPermanent: true,
        permanentAddressLine1: currentAddressLine1,
        permanentAddressLine2: currentAddressLine2,
        permanentPinCode: currentPinCode,
        permanentCity: currentCity,
        permanentState: currentState
      });
    } else {
      updateFormState({
        sameAsPermanent: false,
        permanentAddressLine1: "",
        permanentAddressLine2: "",
        permanentPinCode: "",
        permanentCity: "",
        permanentState: ""
      });
    }
  };

  // Sync permanent fields if toggle is active
  useEffect(() => {
    if (sameAsPermanent) {
      updateFormState({
        permanentAddressLine1: currentAddressLine1,
        permanentAddressLine2: currentAddressLine2,
        permanentPinCode: currentPinCode,
        permanentCity: currentCity,
        permanentState: currentState
      });
    }
  }, [currentAddressLine1, currentAddressLine2, currentPinCode, currentCity, currentState, sameAsPermanent]);

  return (
    <div className="space-y-6" id="step4-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Address Information</h2>
        <p className="text-sm text-slate-500">Provide your primary residential address details.</p>
      </div>

      <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Current Residential Address</h3>
        
        {/* PIN Code Field with Auto-Lookup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="currentPinCode" className="block text-sm font-medium text-slate-700">
              PIN Code *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <input
                type="text"
                id="currentPinCode"
                name="currentPinCode"
                value={currentPinCode}
                onChange={(e) => updateFormState({ currentPinCode: e.target.value.replace(/\D/g, "").substring(0, 6) })}
                onBlur={() => registerBlur("currentPinCode")}
                placeholder="6-digit PIN code"
                maxLength={6}
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.currentPinCode ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
                aria-invalid={errors.currentPinCode ? "true" : "false"}
                aria-describedby={errors.currentPinCode ? "currentPinCode-error" : undefined}
              />
              {pinLookupLoading && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                </div>
              )}
            </div>
            {errors.currentPinCode && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="currentPinCode-error" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.currentPinCode}
              </p>
            )}
            {pinMatchedOffice && (
              <p className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded w-fit animate-fadeIn">
                Auto-detected: {pinMatchedOffice} Post Office
              </p>
            )}
            {stateDiscrepancyWarning && (
              <p className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2.5 py-1.5 rounded border border-amber-100 animate-fadeIn" role="status">
                {stateDiscrepancyWarning}
              </p>
            )}
          </div>

          {/* Residence Type */}
          <div className="space-y-2">
            <label htmlFor="residenceType" className="block text-sm font-medium text-slate-700">
              Residence Type *
            </label>
            <select
              id="residenceType"
              name="residenceType"
              value={residenceType}
              onChange={(e) => updateFormState({ residenceType: e.target.value as ResidenceType })}
              onBlur={() => registerBlur("residenceType")}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.residenceType ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <option value="" disabled>Select Residence Type</option>
              <option value="Owned">Owned</option>
              <option value="Rented">Rented</option>
              <option value="Company">Company Provided</option>
              <option value="Family">Living with Family</option>
            </select>
            {errors.residenceType && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.residenceType}
              </p>
            )}
          </div>
        </div>

        {/* Address Line 1 */}
        <div className="space-y-2">
          <label htmlFor="currentAddressLine1" className="block text-sm font-medium text-slate-700">
            Address Line 1 (Flat, House No., Building, Street) *
          </label>
          <input
            type="text"
            id="currentAddressLine1"
            name="currentAddressLine1"
            value={currentAddressLine1}
            onChange={(e) => updateFormState({ currentAddressLine1: e.target.value })}
            onBlur={() => registerBlur("currentAddressLine1")}
            placeholder="e.g. Flat 402, Sai Enclave"
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.currentAddressLine1 ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.currentAddressLine1 ? "true" : "false"}
            aria-describedby={errors.currentAddressLine1 ? "currentAddressLine1-error" : undefined}
          />
          {errors.currentAddressLine1 && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="currentAddressLine1-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.currentAddressLine1}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <label htmlFor="currentAddressLine2" className="block text-sm font-medium text-slate-700">
            Address Line 2 (Area, Colony, Landmark)
          </label>
          <input
            type="text"
            id="currentAddressLine2"
            name="currentAddressLine2"
            value={currentAddressLine2}
            onChange={(e) => updateFormState({ currentAddressLine2: e.target.value })}
            placeholder="e.g. Near HDFC Bank, Kothapet"
            className="block w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="currentCity" className="block text-sm font-medium text-slate-700">
              City *
            </label>
            <input
              type="text"
              id="currentCity"
              name="currentCity"
              value={currentCity}
              onChange={(e) => updateFormState({ currentCity: e.target.value })}
              onBlur={() => registerBlur("currentCity")}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentCity ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {errors.currentCity && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.currentCity}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="currentState" className="block text-sm font-medium text-slate-700">
              State *
            </label>
            <input
              type="text"
              id="currentState"
              name="currentState"
              value={currentState}
              onChange={handleStateChange}
              onBlur={() => registerBlur("currentState")}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentState ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {errors.currentState && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.currentState}
              </p>
            )}
          </div>
        </div>

        {/* Rent Amount (if Rented) & Years at Current Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {residenceType === "Rented" && (
            <div className="space-y-2 animate-fadeIn">
              <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                id="rentAmount"
                name="rentAmount"
                value={rentAmount || ""}
                onChange={(e) => updateFormState({ rentAmount: parseInt(e.target.value) || 0 })}
                onBlur={() => registerBlur("rentAmount")}
                placeholder="e.g. 15000"
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rentAmount ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.rentAmount && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.rentAmount}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="yearsAtCurrentAddress" className="block text-sm font-medium text-slate-700">
              Years at Current Address *
            </label>
            <input
              type="number"
              id="yearsAtCurrentAddress"
              name="yearsAtCurrentAddress"
              value={yearsAtCurrentAddress !== undefined ? yearsAtCurrentAddress : ""}
              onChange={(e) => updateFormState({ yearsAtCurrentAddress: parseInt(e.target.value) || 0 })}
              onBlur={() => registerBlur("yearsAtCurrentAddress")}
              placeholder="e.g. 3"
              min={0}
              max={50}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearsAtCurrentAddress ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {errors.yearsAtCurrentAddress && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.yearsAtCurrentAddress}
              </p>
            )}
          </div>
        </div>

        {/* Previous address conditional block if < 1 year */}
        {showPreviousAddress && (
          <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-3 animate-fadeIn">
            <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Previous Residential Address Required</h4>
            <p className="text-xs text-amber-700">Since you have lived at your current address for less than a year, please provide your previous address details for complete credit evaluation.</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Previous Address Line 1"
                className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="PIN"
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permanent Address Toggle */}
      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          id="sameAsPermanent"
          name="sameAsPermanent"
          checked={sameAsPermanent}
          onChange={(e) => handleSameAsPermanentToggle(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="sameAsPermanent" className="text-sm text-slate-700 cursor-pointer select-none font-medium">
          Permanent Address is the same as Current Address
        </label>
      </div>

      {/* Permanent Address Fields if unchecked */}
      {!sameAsPermanent && (
        <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Permanent Residential Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="permanentPinCode" className="block text-sm font-medium text-slate-700">
                PIN Code *
              </label>
              <input
                type="text"
                id="permanentPinCode"
                name="permanentPinCode"
                value={permanentPinCode}
                onChange={(e) => updateFormState({ permanentPinCode: e.target.value.replace(/\D/g, "").substring(0, 6) })}
                onBlur={() => registerBlur("permanentPinCode")}
                placeholder="6-digit PIN code"
                maxLength={6}
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.permanentPinCode ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.permanentPinCode && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.permanentPinCode}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="permanentAddressLine1" className="block text-sm font-medium text-slate-700">
              Address Line 1 *
            </label>
            <input
              type="text"
              id="permanentAddressLine1"
              name="permanentAddressLine1"
              value={permanentAddressLine1}
              onChange={(e) => updateFormState({ permanentAddressLine1: e.target.value })}
              onBlur={() => registerBlur("permanentAddressLine1")}
              placeholder="e.g. Flat 402, Sai Enclave"
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.permanentAddressLine1 ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {errors.permanentAddressLine1 && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.permanentAddressLine1}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="permanentAddressLine2" className="block text-sm font-medium text-slate-700">
              Address Line 2
            </label>
            <input
              type="text"
              id="permanentAddressLine2"
              name="permanentAddressLine2"
              value={permanentAddressLine2}
              onChange={(e) => updateFormState({ permanentAddressLine2: e.target.value })}
              placeholder="e.g. Near HDFC Bank, Kothapet"
              className="block w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="permanentCity" className="block text-sm font-medium text-slate-700">
                City *
              </label>
              <input
                type="text"
                id="permanentCity"
                name="permanentCity"
                value={permanentCity}
                onChange={(e) => updateFormState({ permanentCity: e.target.value })}
                onBlur={() => registerBlur("permanentCity")}
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.permanentCity ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.permanentCity && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.permanentCity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="permanentState" className="block text-sm font-medium text-slate-700">
                State *
              </label>
              <input
                type="text"
                id="permanentState"
                name="permanentState"
                value={permanentState}
                onChange={(e) => updateFormState({ permanentState: e.target.value })}
                onBlur={() => registerBlur("permanentState")}
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.permanentState ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.permanentState && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.permanentState}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

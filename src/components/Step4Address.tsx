import React, { useState, useEffect } from "react";
import { FormState, ResidenceType } from "../types";
import { pinCodeDataset } from "../utils/pinCodeData";
import { useLanguage } from "../context/LanguageContext";

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
  const { t, language } = useLanguage();
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
          setStateDiscrepancyWarning(
            language === "hi"
              ? "हमारे निर्देशिका में पिन कोड नहीं मिला। कृपया शहर और राज्य मैन्युअल रूप से दर्ज करें।"
              : language === "or"
              ? "ଆମର ନିର୍ଦ୍ଦେଶିକାରେ ପିନ୍ କୋଡ୍ ମିଳିଲା ନାହିଁ। ଦୟାକରି ସହର ଏବଂ ରାଜ୍ୟ ମାନୁଆଲ୍ ଭାବରେ ପ୍ରବେଶ କରନ୍ତୁ।"
              : "PIN code not found in our directory. Please enter city and state manually."
          );
        }
        setPinLookupLoading(false);
      }, 800);
    } else {
      setPinMatchedOffice("");
      setOriginalDerivedState("");
      setStateDiscrepancyWarning("");
    }
  }, [currentPinCode, language]);

  // Auto-fill trigger when 6 digit permanent PIN is entered
  useEffect(() => {
    if (permanentPinCode && /^\d{6}$/.test(permanentPinCode)) {
      const found = pinCodeDataset.find((rec) => rec.pin === permanentPinCode);
      if (found) {
        updateFormState({
          permanentCity: found.city,
          permanentState: found.state
        });
      }
    }
  }, [permanentPinCode]);

  // Check state discrepancy when user modifies the auto-filled state
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateFormState({ currentState: val });

    if (originalDerivedState && val.toLowerCase().trim() !== originalDerivedState.toLowerCase().trim()) {
      setStateDiscrepancyWarning(
        language === "hi"
          ? `चेतावनी: चयनित राज्य पिन कोड ${currentPinCode} से प्राप्त राज्य (${originalDerivedState}) से मेल नहीं खाता है।`
          : language === "or"
          ? `ସତର୍କତା: ଚୟନିତ ରାଜ୍ୟ ପିନ୍ କୋଡ୍ ${currentPinCode} ରୁ ପ୍ରାପ୍ତ ରାଜ୍ୟ (${originalDerivedState}) ସହିତ ମେଳ ଖାଉନାହିଁ।`
          : `Warning: Selected state does not match the state (${originalDerivedState}) derived from PIN Code ${currentPinCode}.`
      );
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("step4Title")}</h2>
        <p className="text-sm text-slate-500">{t("step4Desc")}</p>
      </div>

      <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
          {language === "hi" ? "वर्तमान आवासीय पता" : language === "or" ? "ବର୍ତ୍ତମାନର ଆବାସିକ ଠିକଣା" : "Current Residential Address"}
        </h3>
        
        {/* Quick Odisha PIN Dropdown */}
        {(() => {
          const odishaPinOptions = pinCodeDataset
            .filter((p) => p.state === "Odisha")
            .sort((a, b) => a.city.localeCompare(b.city));
          return (
            <div className="bg-blue-50/50 dark:bg-zinc-800/40 p-4 rounded-xl border border-blue-100 dark:border-zinc-800 space-y-2">
              <label htmlFor="odishaPinSelector" className="block text-xs font-bold text-blue-800 dark:text-zinc-200 uppercase tracking-wider">
                📍 {language === "hi" ? "ओडिशा पिन कोड त्वरित चयन" : language === "or" ? "ଓଡ଼ିଶା ପିନ୍ କୋଡ୍ ସହଜ ଚୟନ" : "Odisha Quick PIN Selector"}
              </label>
              <select
                id="odishaPinSelector"
                value={currentPinCode && odishaPinOptions.some(p => p.pin === currentPinCode) ? currentPinCode : ""}
                onChange={(e) => {
                  const selectedPin = e.target.value;
                  if (selectedPin) {
                    updateFormState({ currentPinCode: selectedPin });
                  }
                }}
                className="block w-full px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">
                  {language === "hi" 
                    ? "-- ओडिशा का एक जिला/शहर चुनें --" 
                    : language === "or" 
                    ? "-- ଓଡ଼ିଶାର ଏକ ଜିଲ୍ଲା/ସହର ଚୟନ କରନ୍ତୁ --" 
                    : "-- Select an Odisha District/City --"}
                </option>
                {odishaPinOptions.map((item) => (
                  <option key={item.pin} value={item.pin}>
                    {item.city} ({item.pin}) - {item.office}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                {language === "hi" 
                  ? "ओडिशा के आवेदकों के लिए: अपना जिला चुनें और पिन कोड, शहर तथा राज्य स्वचालित रूप से भर जाएंगे।" 
                  : language === "or" 
                  ? "ଓଡ଼ିଶା ଆବେଦନକାରୀଙ୍କ ପାଇଁ: ଆପଣଙ୍କ ଜିଲ୍ଲା ଚୟନ କରନ୍ତୁ ଏବଂ ପିନ୍ କୋଡ୍, ସହର ଏବଂ ରାଜ୍ୟ ସ୍ୱୟଂଚାଳିତ ଭାବରେ ପୂରଣ ହେବ।" 
                  : "For Odisha applicants: Select your district, and PIN code, city, and state will auto-populate."}
              </p>
            </div>
          );
        })()}

        {/* PIN Code Field with Auto-Lookup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="currentPinCode" className="block text-sm font-medium text-slate-700">
              {t("pinCode")} *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <input
                type="text"
                id="currentPinCode"
                name="currentPinCode"
                value={currentPinCode}
                onChange={(e) => updateFormState({ currentPinCode: e.target.value.replace(/\D/g, "").substring(0, 6) })}
                onBlur={() => registerBlur("currentPinCode")}
                placeholder={language === "hi" ? "6-अंकीय पिन कोड" : language === "or" ? "୬-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ କୋଡ୍" : "6-digit PIN code"}
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
                {language === "hi" ? `ऑटो-डिटेक्टेड: ${pinMatchedOffice} पोस्ट ऑफिस` : language === "or" ? `ସ୍ୱୟଂ-ଚିହ୍ନଟ: ${pinMatchedOffice} ପୋଷ୍ଟ ଅଫିସ୍` : `Auto-detected: ${pinMatchedOffice} Post Office`}
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
              {t("residenceType")} *
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
              <option value="" disabled>{language === "hi" ? "आवास प्रकार चुनें" : language === "or" ? "ଆବାସିକ ପ୍ରକାର ଚୟନ କରନ୍ତୁ" : "Select Residence Type"}</option>
              <option value="Owned">{t("Owned")}</option>
              <option value="Rented">{t("Rented")}</option>
              <option value="Company">{language === "hi" ? "कंपनी द्वारा प्रदत्त" : language === "or" ? "କମ୍ପାନୀ ପ୍ରଦତ୍ତ" : "Company Provided"}</option>
              <option value="Family">{language === "hi" ? "परिवार के साथ रहना" : language === "or" ? "ପରିବାର ସହିତ ବାସ" : "Living with Family"}</option>
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
            {t("addressLine1")} *
          </label>
          <input
            type="text"
            id="currentAddressLine1"
            name="currentAddressLine1"
            value={currentAddressLine1}
            onChange={(e) => updateFormState({ currentAddressLine1: e.target.value })}
            onBlur={() => registerBlur("currentAddressLine1")}
            placeholder={language === "hi" ? "जैसे: फ्लैट 402, साईं एन्क्लेव" : language === "or" ? "ଉଦାହରଣ: ଫ୍ଲାଟ ୪୦୨, ସାଈ ଏନକ୍ଲେଭ" : "e.g. Flat 402, Sai Enclave"}
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
            {t("addressLine2")}
          </label>
          <input
            type="text"
            id="currentAddressLine2"
            name="currentAddressLine2"
            value={currentAddressLine2}
            onChange={(e) => updateFormState({ currentAddressLine2: e.target.value })}
            placeholder={language === "hi" ? "जैसे: एचडीएफसी बैंक के पास, कोठापेट" : language === "or" ? "ଉଦାହରଣ: HDFC ବ୍ୟାଙ୍କ ନିକଟରେ, କୋଠାପେଟ" : "e.g. Near HDFC Bank, Kothapet"}
            className="block w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="currentCity" className="block text-sm font-medium text-slate-700">
              {t("city")} *
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
              {t("state")} *
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
                {language === "hi" ? "मासिक किराया (₹) *" : language === "or" ? "ମାସିକ ଭଡା (₹) *" : "Monthly Rent (₹) *"}
              </label>
              <input
                type="number"
                id="rentAmount"
                name="rentAmount"
                value={rentAmount || ""}
                onChange={(e) => updateFormState({ rentAmount: parseInt(e.target.value) || 0 })}
                onBlur={() => registerBlur("rentAmount")}
                placeholder={language === "hi" ? "जैसे: 15000" : language === "or" ? "ଉଦାହରଣ: ୧୫୦୦୦" : "e.g. 15000"}
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
              {language === "hi" ? "वर्तमान पते पर वर्ष *" : language === "or" ? "ବର୍ତ୍ତମାନର ଠିକଣାରେ ବର୍ଷ *" : "Years at Current Address *"}
            </label>
            <input
              type="number"
              id="yearsAtCurrentAddress"
              name="yearsAtCurrentAddress"
              value={yearsAtCurrentAddress !== undefined ? yearsAtCurrentAddress : ""}
              onChange={(e) => updateFormState({ yearsAtCurrentAddress: parseInt(e.target.value) || 0 })}
              onBlur={() => registerBlur("yearsAtCurrentAddress")}
              placeholder={language === "hi" ? "जैसे: 3" : language === "or" ? "ଉଦାହରଣ: ୩" : "e.g. 3"}
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
            <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              {language === "hi" ? "पूर्व आवासीय पता आवश्यक है" : language === "or" ? "ପୂର୍ବ ଆବାସିକ ଠିକଣା ଆବଶ୍ୟକ" : "Previous Residential Address Required"}
            </h4>
            <p className="text-xs text-amber-700">
              {language === "hi"
                ? "चूंकि आप एक वर्ष से कम समय से अपने वर्तमान पते पर रह रहे हैं, कृपया पूर्ण क्रेडिट मूल्यांकन के लिए अपने पिछले पते का विवरण प्रदान करें।"
                : language === "or"
                ? "ଯେହେତୁ ଆପଣ ଗୋଟିଏ ବର୍ଷରୁ କମ୍ ସମୟ ପାଇଁ ଆପଣଙ୍କର ବର୍ଣ୍ଣମାନର ଠିକଣାରେ ରହୁଛନ୍ତି, ଦୟାକରି ସମ୍ପୂର୍ଣ୍ଣ କ୍ରେଡିଟ୍ ମୂଲ୍ୟାଙ୍କନ ପାଇଁ ଆପଣଙ୍କର ପୂର୍ବ ଠିକଣା ବିବରଣୀ ପ୍ରଦାନ କରନ୍ତୁ।"
                : "Since you have lived at your current address for less than a year, please provide your previous address details for complete credit evaluation."}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={language === "hi" ? "पिछला पता पंक्ति 1" : language === "or" ? "ପୂର୍ବ ଠିକଣା ଧାଡି ୧" : "Previous Address Line 1"}
                className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={language === "hi" ? "पिन" : language === "or" ? "ପିନ୍" : "PIN"}
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={language === "hi" ? "शहर" : language === "or" ? "ସହର" : "City"}
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={language === "hi" ? "राज्य" : language === "or" ? "ରାଜ୍ୟ" : "State"}
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
          {language === "hi" ? "स्थायी पता वर्तमान पते के समान है" : language === "or" ? "ସ୍ଥାୟୀ ଠିକଣା ବର୍ତ୍ତମାନର ଠିକଣା ସହିତ ସମାନ" : "Permanent Address is the same as Current Address"}
        </label>
      </div>

      {/* Permanent Address Fields if unchecked */}
      {!sameAsPermanent && (
        <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            {language === "hi" ? "स्थायी आवासीय पता" : language === "or" ? "ସ୍ଥାୟୀ ଆବାସିକ ଠିକଣା" : "Permanent Residential Address"}
          </h3>

          {/* Quick Odisha PIN Dropdown for Permanent */}
          {(() => {
            const odishaPinOptions = pinCodeDataset
              .filter((p) => p.state === "Odisha")
              .sort((a, b) => a.city.localeCompare(b.city));
            return (
              <div className="bg-blue-50/50 dark:bg-zinc-800/40 p-4 rounded-xl border border-blue-100 dark:border-zinc-800 space-y-2">
                <label htmlFor="permanentOdishaPinSelector" className="block text-xs font-bold text-blue-800 dark:text-zinc-200 uppercase tracking-wider">
                  📍 {language === "hi" ? "स्थायी ओडिशा पिन कोड त्वरित चयन" : language === "or" ? "ସ୍ଥାୟୀ ଓଡ଼ିଶା ପିନ୍ କୋଡ୍ ସହଜ ଚୟନ" : "Permanent Odisha Quick PIN Selector"}
                </label>
                <select
                  id="permanentOdishaPinSelector"
                  value={permanentPinCode && odishaPinOptions.some(p => p.pin === permanentPinCode) ? permanentPinCode : ""}
                  onChange={(e) => {
                    const selectedPin = e.target.value;
                    if (selectedPin) {
                      updateFormState({ permanentPinCode: selectedPin });
                    }
                  }}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">
                    {language === "hi" 
                      ? "-- ओडिशा का एक जिला/शहर चुनें --" 
                      : language === "or" 
                      ? "-- ଓଡ଼ିଶାର ଏକ ଜିଲ୍ଲା/ସହର ଚୟନ କରନ୍ତୁ --" 
                      : "-- Select an Odisha District/City --"}
                  </option>
                  {odishaPinOptions.map((item) => (
                    <option key={item.pin} value={item.pin}>
                      {item.city} ({item.pin}) - {item.office}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="permanentPinCode" className="block text-sm font-medium text-slate-700">
                {t("pinCode")} *
              </label>
              <input
                type="text"
                id="permanentPinCode"
                name="permanentPinCode"
                value={permanentPinCode}
                onChange={(e) => updateFormState({ permanentPinCode: e.target.value.replace(/\D/g, "").substring(0, 6) })}
                onBlur={() => registerBlur("permanentPinCode")}
                placeholder={language === "hi" ? "6-अंकीय पिन कोड" : language === "or" ? "୬-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ କୋଡ୍" : "6-digit PIN code"}
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
              {t("addressLine1")} *
            </label>
            <input
              type="text"
              id="permanentAddressLine1"
              name="permanentAddressLine1"
              value={permanentAddressLine1}
              onChange={(e) => updateFormState({ permanentAddressLine1: e.target.value })}
              onBlur={() => registerBlur("permanentAddressLine1")}
              placeholder={language === "hi" ? "जैसे: फ्लैट 402, साईं एन्क्लेव" : language === "or" ? "ଉଦାହରଣ: ଫ୍ଲାଟ ୪୦୨, ସାଈ ଏନକ୍ଲେଭ" : "e.g. Flat 402, Sai Enclave"}
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
              {t("addressLine2")}
            </label>
            <input
              type="text"
              id="permanentAddressLine2"
              name="permanentAddressLine2"
              value={permanentAddressLine2}
              onChange={(e) => updateFormState({ permanentAddressLine2: e.target.value })}
              placeholder={language === "hi" ? "जैसे: एचडीएफसी बैंक के पास, कोठापेट" : language === "or" ? "ଉଦାହରଣ: HDFC ବ୍ୟାଙ୍କ ନିକଟରେ, କୋଠାପେଟ" : "e.g. Near HDFC Bank, Kothapet"}
              className="block w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="permanentCity" className="block text-sm font-medium text-slate-700">
                {t("city")} *
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
                {t("state")} *
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

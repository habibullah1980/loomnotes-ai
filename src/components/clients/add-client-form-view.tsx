"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientFollow } from "@/context/clientfollow-context";

export default function AddClientFormView() {
  const router = useRouter();
  const { addClient } = useClientFollow();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationshipType, setRelationshipType] = useState<
    "Monthly Retainer" | "Fixed Project" | "Discovery Sprint" | "Advisory"
  >("Monthly Retainer");
  const [contractValue, setContractValue] = useState("8,500");
  const [cadenceFrequency, setCadenceFrequency] = useState("weekly");
  const [firstDate, setFirstDate] = useState("2026-10-18");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["#Design-System", "#Tech"]);

  const availableTags = [
    "#Tech",
    "#Q4-Launch",
    "#Design-System",
    "#High-Priority",
    "#Healthcare",
    "#Retainer",
    "#Fintech",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !company || !email) {
      alert("Please fill in required fields: Name, Company, and Email.");
      return;
    }

    const cadenceDays = cadenceFrequency === "weekly" ? 7 : cadenceFrequency === "biweekly" ? 14 : 30;

    const newClient = addClient({
      name: fullName,
      company: company,
      title: jobTitle || "Lead Stakeholder",
      email: email,
      phone: phone || "+1 (555) 000-0000",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "active",
      engagementType: relationshipType,
      retainerAmount: parseFloat(contractValue.replace(/[^0-9.]/g, "")) || 5000,
      monthlyValue: `$${contractValue}/mo`,
      totalRevenue: `$${contractValue}`,
      cadenceDays: cadenceDays,
      lastTouch: "Just created",
      nextFollowUpDate: firstDate,
      nextFollowUpType: "Check-in",
      healthScore: 100,
      tags: selectedTags,
      notes: notes || "Initial onboarding parameters established.",
    });

    alert(`Client profile created for ${newClient.name}!`);
    router.push(`/clients/${newClient.id}`);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Meta / Breadcrumb & Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pt-4">
        <div className="flex flex-col gap-1 max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[#434655] text-xs">
            <Link href="/clients" className="hover:text-[#2563eb] transition-colors flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-sm leading-none">group</span>
              <span>Clients</span>
            </Link>
            <span className="text-[#c3c6d7]">/</span>
            <span className="text-[#004ac6] font-bold">Add New Client</span>
          </nav>
          <div className="mt-1">
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">Create New Client Profile</h1>
            <p className="text-base text-[#434655] mt-1">
              Add comprehensive contact details, commercial project scopes, and configure automated cadences to keep deals moving forward.
            </p>
          </div>
        </div>

        {/* Setup Health */}
        <div className="flex items-center gap-3 bg-[#f2f3ff] px-4 py-2.5 rounded-xl border border-slate-200 self-start lg:self-auto">
          <div className="w-8 h-8 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-lg leading-none">bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#434655] font-bold">Setup Health</span>
            <span className="text-xs text-[#004ac6] font-extrabold">Ready to Provision</span>
          </div>
        </div>
      </div>

      {/* Primary Layout: Asymmetric 12-Column Canvas */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Step 1 & Step 2 */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Client & Organization Details */}
          <section className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-xl leading-none">badge</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#004ac6] font-bold">Step 1</span>
                <h2 className="text-lg font-bold text-[#131b2e]">Client &amp; Organization Details</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e]">
                  Full Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Julianne Thorne"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e]">
                  Company / Studio <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Solstice Health Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e]">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. VP of Marketing"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e]">Direct Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-8901"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-[#131b2e]">
                  Email Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="julianne@solsticehealth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Engagement Scope & Commercial Structure */}
          <section className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-xl leading-none">account_balance_wallet</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#004ac6] font-bold">Step 2</span>
                <h2 className="text-lg font-bold text-[#131b2e]">Commercial Structure</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-2">Relationship Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Monthly Retainer", val: "Monthly Retainer", icon: "autorenew" },
                    { label: "Fixed Scope", val: "Fixed Project", icon: "inventory_2" },
                    { label: "Discovery Sprint", val: "Discovery Sprint", icon: "psychology" },
                    { label: "Advisory", val: "Advisory", icon: "target" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setRelationshipType(item.val as typeof relationshipType)}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        relationshipType === item.val
                          ? "bg-[#2563eb] text-white border-[#2563eb] shadow-xs"
                          : "bg-[#f2f3ff] text-[#131b2e] border-slate-200 hover:bg-[#eaedff]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg mb-1">{item.icon}</span>
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#131b2e]">Estimated Contract Value ($)</label>
                  <input
                    type="text"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="8,500"
                    className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#131b2e]">Cadence Frequency</label>
                  <select
                    value={cadenceFrequency}
                    onChange={(e) => setCadenceFrequency(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  >
                    <option value="weekly">Weekly touchpoint (Every 7 days)</option>
                    <option value="biweekly">Every 2 weeks (14 days)</option>
                    <option value="monthly">Monthly check-in (30 days)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e]">Engagement Scope Brief</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Design sprint for web app relaunch and quarterly asset design..."
                  className="w-full p-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Step 3 & Step 4 & Submit */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Section 3: Smart Cadence Date */}
          <section className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-xl leading-none">auto_schedule</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#004ac6] font-bold">Step 3</span>
                <h2 className="text-lg font-bold text-[#131b2e]">First Scheduled Touchpoint</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e]">Initial Follow-up Date</label>
                <input
                  type="date"
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="p-3 bg-[#bdffdb]/20 rounded-xl border border-[#007d55]/20 flex items-center gap-2 text-xs text-[#006242] font-semibold">
                <span className="material-symbols-outlined text-base">recommend</span>
                <span>Automatic check-ins prevent deals from going cold.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Categorization Tags */}
          <section className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-xl leading-none">label</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#004ac6] font-bold">Step 4</span>
                <h2 className="text-lg font-bold text-[#131b2e]">Categorization Tags</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      selected
                        ? "bg-[#2563eb] text-white shadow-2xs"
                        : "bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]"
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="material-symbols-outlined text-xs">
                      {selected ? "check" : "add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Submit Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="flex-1 text-center py-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-sm font-semibold transition-colors border border-slate-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-extrabold shadow-sm transition-all cursor-pointer"
            >
              Create Client Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

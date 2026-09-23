"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Loader2, Plus, Trash2, GripVertical, UploadCloud, LayoutTemplate, BarChart3, Settings2, Map, ListOrdered, MessageCircleQuestion, Target, Search } from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/admin/PermissionGate";

export default function ProductEditorCMS() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    page_content: {
      heroTitle: "",
      heroSubtitle: "",
      heroBackgroundImage: "",
      heroMockupImage: "",
      stats: [],
      coreCapabilitiesTitle: "",
      coreCapabilitiesSubtitle: "",
      detailedFeatures: [],
      stepsTitle: "",
      stepsSubtitle: "",
      steps: [],
      faqsTitle: "",
      faqsSubtitle: "",
      faqs: [],
      finalCtaTitle: "",
      finalCtaDescription: "",
      finalCtaLink: "",
      heroPrimaryCtaText: "",
      heroPrimaryCtaLink: "",
      heroSecondaryCtaText: "",
      heroSecondaryCtaLink: "",
      pathTag: "",
      pathTitle: "",
      pathSubtitle: "",
      pathItems: []
    }
  });

  const [activeTab, setActiveTab] = useState("hero");

  const tabs = [
    { id: "hero", label: "Hero", icon: LayoutTemplate },
    { id: "stats", label: "Stats Counters", icon: BarChart3 },
    { id: "capabilities", label: "Capabilities", icon: Settings2 },
    { id: "path", label: "Journey/Path", icon: Map },
    { id: "steps", label: "Process Steps", icon: ListOrdered },
    { id: "faqs", label: "FAQs", icon: MessageCircleQuestion },
    { id: "cta", label: "Final CTA", icon: Target },
    { id: "seo", label: "SEO Settings", icon: Search }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const products = await res.json();
        const found = products.find((p: any) => p.product_id === productId || p.slug === productId);
        if (found) {
          setProduct(found);
          const pc = found.page_content || {};
          setFormData({
            ...found,
            page_content: {
              heroTitle: pc.heroTitle || found.title || found.name || "",
              heroSubtitle: pc.heroSubtitle || found.description || "",
              heroBackgroundImage: pc.heroBackgroundImage || "",
              heroMockupImage: pc.heroMockupImage || "",
              stats: pc.stats || [],
              coreCapabilitiesTitle: pc.coreCapabilitiesTitle || "Core Capabilities",
              coreCapabilitiesSubtitle: pc.coreCapabilitiesSubtitle || "",
              detailedFeatures: pc.detailedFeatures || [],
              stepsTitle: pc.stepsTitle || "Clear steps from assessment to optimization.",
              stepsSubtitle: pc.stepsSubtitle || "",
              steps: pc.steps || [],
              faqsTitle: pc.faqsTitle || "Decisions made clearer.",
              faqsSubtitle: pc.faqsSubtitle || "",
              faqs: pc.faqs || [],
              finalCtaTitle: pc.finalCtaTitle || "Ready to get started?",
              finalCtaDescription: pc.finalCtaDescription || "",
              finalCtaLink: pc.finalCtaLink || "#contact",
              heroPrimaryCtaText: pc.heroPrimaryCtaText || "Ready to Start Journey",
              heroPrimaryCtaLink: pc.heroPrimaryCtaLink || "#contact",
              heroSecondaryCtaText: pc.heroSecondaryCtaText || "Explore Expert",
              heroSecondaryCtaLink: pc.heroSecondaryCtaLink || "#capabilities",
              seoTitle: pc.seoTitle || "",
              seoDescription: pc.seoDescription || "",
              seoKeywords: pc.seoKeywords || "",
              pathTag: pc.pathTag || "CLOUD JOURNEY / OUR APPROACH",
              pathTitle: pc.pathTitle || "A practical path from legacy systems to cloud maturity.",
              pathSubtitle: pc.pathSubtitle || "Our framework ensures a smooth transition, reducing risks and accelerating time-to-value for enterprise cloud adoption.",
              pathItems: pc.pathItems || [
                "Enterprise transformation approach 1",
                "Enterprise transformation approach 2",
                "Enterprise transformation approach 3",
                "Enterprise transformation approach 4",
                "Enterprise transformation approach 5",
                "Enterprise transformation approach 6"
              ]
            },
          });
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) return data.url;
      alert(data.message || "Upload failed");
      return null;
    } catch (e) {
      console.error(e);
      alert("Error uploading file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Product page updated successfully!");
      } else {
        alert("Failed to update product page");
      }
    } catch (error) {
      alert("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!product) {
    return <div className="text-center py-12"><h2 className="text-xl font-bold">Product not found</h2><Link href="/admin/products" className="text-primary mt-4 inline-block">Go back</Link></div>;
  }

  const { page_content } = formData;

  const updatePageContent = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      page_content: { ...prev.page_content, [key]: value }
    }));
  };

  return (
    <PermissionGate permission="manage_products">
    <div className="max-w-6xl mx-auto pb-20 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Link href="/admin/products" className="text-muted-foreground hover:text-primary mb-2 flex items-center text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
          </Link>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Horizontal Tab Navigation */}
        <div className="w-full">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto hide-scrollbar px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap border-b-2 py-4 px-3 sm:px-4 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 max-h-[calc(100vh-240px)] overflow-y-auto">

            {/* HERO TAB */}
            {activeTab === "hero" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">Hero Title</label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.heroTitle} onChange={e => updatePageContent("heroTitle", e.target.value)} placeholder="e.g. Cloud Solutions Built for Secure Growth" />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">Hero Subtitle</label>
                  <textarea className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 h-24"
                    value={page_content.heroSubtitle} onChange={e => updatePageContent("heroSubtitle", e.target.value)} placeholder="Detailed hero description..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Background Image</label>
                    <div className="mt-2 flex flex-col gap-3">
                      {page_content.heroBackgroundImage && <img src={page_content.heroBackgroundImage} className="h-32 object-cover rounded-xl border border-border" alt="Preview" />}
                      <label className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border border-border rounded-xl px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
                        <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Background"}
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          if (e.target.files?.[0]) { const url = await handleUpload(e.target.files[0]); if (url) updatePageContent("heroBackgroundImage", url); }
                        }} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Mockup/Hero Image (Optional)</label>
                    <div className="mt-2 flex flex-col gap-3">
                      {page_content.heroMockupImage && <img src={page_content.heroMockupImage} className="h-32 object-contain rounded-xl border border-border bg-slate-50" alt="Preview" />}
                      <label className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border border-border rounded-xl px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
                        <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Mockup Image"}
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          if (e.target.files?.[0]) { const url = await handleUpload(e.target.files[0]); if (url) updatePageContent("heroMockupImage", url); }
                        }} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Primary CTA Text</label>
                    <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                      value={page_content.heroPrimaryCtaText} onChange={e => updatePageContent("heroPrimaryCtaText", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Primary CTA Link</label>
                    <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                      value={page_content.heroPrimaryCtaLink} onChange={e => updatePageContent("heroPrimaryCtaLink", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Secondary CTA Text</label>
                    <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                      value={page_content.heroSecondaryCtaText} onChange={e => updatePageContent("heroSecondaryCtaText", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Secondary CTA Link</label>
                    <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                      value={page_content.heroSecondaryCtaLink} onChange={e => updatePageContent("heroSecondaryCtaLink", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* PATH TAB */}
            {activeTab === "path" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">Tag/Eyebrow</label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.pathTag} onChange={e => updatePageContent("pathTag", e.target.value)} placeholder="e.g. CLOUD JOURNEY / OUR APPROACH" />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">Title</label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.pathTitle} onChange={e => updatePageContent("pathTitle", e.target.value)} placeholder="A practical path..." />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">Subtitle</label>
                  <textarea className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 h-24"
                    value={page_content.pathSubtitle} onChange={e => updatePageContent("pathSubtitle", e.target.value)} placeholder="Our framework ensures a smooth transition..." />
                </div>
                
                <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
                  <h3 className="text-lg font-bold">List Items</h3>
                  <button type="button" onClick={() => updatePageContent("pathItems", [...(page_content.pathItems || []), ""])} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/20 transition-colors">
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                {(!page_content.pathItems || page_content.pathItems.length === 0) && <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-xl">No list items added yet.</p>}
                <div className="space-y-3">
                  {(page_content.pathItems || []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-3 items-center group relative">
                      <input type="text" placeholder="Enter list item..." className="w-full rounded-lg border-input bg-background px-4 py-2.5 text-sm focus:ring-primary pr-10 shadow-sm"
                        value={item} onChange={e => { const arr = [...(page_content.pathItems || [])]; arr[i] = e.target.value; updatePageContent("pathItems", arr); }} />
                      <button type="button" onClick={() => {
                        const arr = [...(page_content.pathItems || [])];
                        arr.splice(i, 1);
                        updatePageContent("pathItems", arr);
                      }} className="absolute right-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-50 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Stat Counters</h3>
                  <button type="button" onClick={() => updatePageContent("stats", [...page_content.stats, { value: "99.9%", label: "Uptime", subtitle: "Global" }])} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/20 transition-colors">
                    <Plus className="h-3 w-3" /> Add Stat
                  </button>
                </div>
                {page_content.stats.length === 0 && <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-xl">No stats added yet.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page_content.stats.map((stat: any, i: number) => (
                    <div key={i} className="bg-muted/30 p-4 rounded-xl border border-border relative group">
                      <button type="button" onClick={() => {
                        const arr = [...page_content.stats];
                        arr.splice(i, 1);
                        updatePageContent("stats", arr);
                      }} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5" /></button>
                      <div className="space-y-3 mt-2">
                        <input type="text" placeholder="Value (e.g. 99.9%)" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary"
                          value={stat.value} onChange={e => { const arr = [...page_content.stats]; arr[i].value = e.target.value; updatePageContent("stats", arr); }} />
                        <input type="text" placeholder="Label (e.g. Uptime)" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary"
                          value={stat.label} onChange={e => { const arr = [...page_content.stats]; arr[i].label = e.target.value; updatePageContent("stats", arr); }} />
                        <input type="text" placeholder="Subtitle (e.g. Global)" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary"
                          value={stat.subtitle} onChange={e => { const arr = [...page_content.stats]; arr[i].subtitle = e.target.value; updatePageContent("stats", arr); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CAPABILITIES TAB */}
            {activeTab === "capabilities" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Section Title</label>
                    <input type="text" className="w-full rounded-xl border-input bg-background px-4 py-3 text-sm focus:ring-primary"
                      value={page_content.coreCapabilitiesTitle} onChange={e => updatePageContent("coreCapabilitiesTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Section Subtitle</label>
                    <input type="text" className="w-full rounded-xl border-input bg-background px-4 py-3 text-sm focus:ring-primary"
                      value={page_content.coreCapabilitiesSubtitle} onChange={e => updatePageContent("coreCapabilitiesSubtitle", e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
                  <h3 className="text-lg font-bold">Feature Grid</h3>
                  <button type="button" onClick={() => updatePageContent("detailedFeatures", [...page_content.detailedFeatures, { title: "", description: "", imageUrl: "" }])} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/20">
                    <Plus className="h-3 w-3" /> Add Feature
                  </button>
                </div>

                <div className="space-y-4">
                  {page_content.detailedFeatures.map((feat: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start bg-muted/30 p-4 rounded-xl border border-border group">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab opacity-50 group-hover:opacity-100" />
                      <div className="flex-1 space-y-3">
                        <input type="text" placeholder="Feature Title" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary font-bold"
                          value={feat.title} onChange={e => { const arr = [...page_content.detailedFeatures]; arr[i].title = e.target.value; updatePageContent("detailedFeatures", arr); }} />
                        <textarea placeholder="Feature Description" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary h-20 resize-none"
                          value={feat.description} onChange={e => { const arr = [...page_content.detailedFeatures]; arr[i].description = e.target.value; updatePageContent("detailedFeatures", arr); }} />
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center justify-center gap-2 bg-background hover:bg-muted border border-border rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors">
                            <UploadCloud className="h-3 w-3" /> {uploading ? "..." : "Icon / Image"}
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              if (e.target.files?.[0]) { const url = await handleUpload(e.target.files[0]); if (url) { const arr = [...page_content.detailedFeatures]; arr[i].imageUrl = url; updatePageContent("detailedFeatures", arr); } }
                            }} disabled={uploading} />
                          </label>
                          {feat.imageUrl && <img src={feat.imageUrl} alt="icon" className="h-8 w-8 object-contain rounded bg-background p-1 border border-border" />}
                        </div>
                      </div>
                      <button type="button" onClick={() => {
                        const arr = [...page_content.detailedFeatures];
                        arr.splice(i, 1);
                        updatePageContent("detailedFeatures", arr);
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROCESS STEPS TAB */}
            {activeTab === "steps" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Steps Title</label>
                    <input type="text" className="w-full rounded-xl border-input bg-background px-4 py-3 text-sm focus:ring-primary"
                      value={page_content.stepsTitle} onChange={e => updatePageContent("stepsTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">Steps Subtitle</label>
                    <input type="text" className="w-full rounded-xl border-input bg-background px-4 py-3 text-sm focus:ring-primary"
                      value={page_content.stepsSubtitle} onChange={e => updatePageContent("stepsSubtitle", e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
                  <h3 className="text-lg font-bold">Process Steps</h3>
                  <button type="button" onClick={() => updatePageContent("steps", [...page_content.steps, { title: "", description: "", tag: "01" }])} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/20">
                    <Plus className="h-3 w-3" /> Add Step
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page_content.steps.map((step: any, i: number) => (
                    <div key={i} className="bg-muted/30 p-4 rounded-xl border border-border relative group">
                      <button type="button" onClick={() => {
                        const arr = [...page_content.steps];
                        arr.splice(i, 1);
                        updatePageContent("steps", arr);
                      }} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5" /></button>
                      <div className="space-y-3 mt-2">
                        <input type="text" placeholder="Tag (e.g. 01 or Assess)" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary font-mono text-primary"
                          value={step.tag} onChange={e => { const arr = [...page_content.steps]; arr[i].tag = e.target.value; updatePageContent("steps", arr); }} />
                        <input type="text" placeholder="Step Title" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary font-bold"
                          value={step.title} onChange={e => { const arr = [...page_content.steps]; arr[i].title = e.target.value; updatePageContent("steps", arr); }} />
                        <textarea placeholder="Step Description" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary h-20 resize-none"
                          value={step.description} onChange={e => { const arr = [...page_content.steps]; arr[i].description = e.target.value; updatePageContent("steps", arr); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQS TAB */}
            {activeTab === "faqs" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">FAQs Title</label>
                    <input type="text" className="w-full rounded-xl border-input bg-background px-4 py-3 text-sm focus:ring-primary"
                      value={page_content.faqsTitle} onChange={e => updatePageContent("faqsTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">FAQs Subtitle</label>
                    <input type="text" className="w-full rounded-xl border-input bg-background px-4 py-3 text-sm focus:ring-primary"
                      value={page_content.faqsSubtitle} onChange={e => updatePageContent("faqsSubtitle", e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
                  <h3 className="text-lg font-bold">Questions</h3>
                  <button type="button" onClick={() => updatePageContent("faqs", [...page_content.faqs, { question: "", answer: "" }])} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/20">
                    <Plus className="h-3 w-3" /> Add FAQ
                  </button>
                </div>

                <div className="space-y-4">
                  {page_content.faqs.map((faq: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start bg-muted/30 p-4 rounded-xl border border-border group">
                      <div className="flex-1 space-y-3">
                        <input type="text" placeholder="Question" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary font-bold"
                          value={faq.question} onChange={e => { const arr = [...page_content.faqs]; arr[i].question = e.target.value; updatePageContent("faqs", arr); }} />
                        <textarea placeholder="Answer" className="w-full rounded-lg border-input bg-background px-3 py-2 text-sm focus:ring-primary h-20 resize-none"
                          value={faq.answer} onChange={e => { const arr = [...page_content.faqs]; arr[i].answer = e.target.value; updatePageContent("faqs", arr); }} />
                      </div>
                      <button type="button" onClick={() => {
                        const arr = [...page_content.faqs];
                        arr.splice(i, 1);
                        updatePageContent("faqs", arr);
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-8"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA TAB */}
            {activeTab === "cta" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">CTA Title</label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.finalCtaTitle} onChange={e => updatePageContent("finalCtaTitle", e.target.value)} placeholder="e.g. Ready to get started?" />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">CTA Description</label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.finalCtaDescription} onChange={e => updatePageContent("finalCtaDescription", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">CTA Button Link</label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.finalCtaLink} onChange={e => updatePageContent("finalCtaLink", e.target.value)} placeholder="e.g. /contact or https://example.com" />
                </div>
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === "seo" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">SEO Title <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.seoTitle || ""} onChange={e => updatePageContent("seoTitle", e.target.value)} placeholder="Custom title for Google and Social Media sharing" />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">SEO Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <textarea className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                    value={page_content.seoDescription || ""} onChange={e => updatePageContent("seoDescription", e.target.value)} placeholder="Custom description for search results" />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">SEO Keywords <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    value={page_content.seoKeywords || ""} onChange={e => updatePageContent("seoKeywords", e.target.value)} placeholder="e.g. cloud, software, enterprise (comma separated)" />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
    </PermissionGate>
  );
}

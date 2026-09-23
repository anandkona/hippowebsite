"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Loader2, UploadCloud, Package, PlusCircle, X, Globe, Smartphone } from "lucide-react";
import { createPortal } from "react-dom";
import PermissionGate from "@/components/admin/PermissionGate";

type Product = {
  id: number;
  product_id: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  image_mode: string;
  logo_url: string;
  features: string[];
  is_active: boolean;
  display_order: number;
  page_content?: any;
};

export default function ProductsCMS() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [userRole, setUserRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    tagline: "",
    description: "",
    image_url: "",
    image_mode: "cover",
    logo_url: "",
    features: [] as string[],
    is_active: true,
    display_order: 0,
    page_content: {
      heroTitle: "",
      heroSubtitle: "",
      heroImage: "",
      detailedFeatures: [] as { title: string, description: string }[],
      screenshots: [] as string[],
      isWebsite: false,
      websiteLink: "",
      isApp: false,
      iosLink: "",
      androidLink: ""
    }
  });

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";

    const generatedProductId = formData.name.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const body = editingProduct
      ? { id: editingProduct.id, ...formData, product_id: generatedProductId }
      : { ...formData, product_id: generatedProductId };

    const res = await fetch("/api/admin/products", {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } else {
      const data = await res.json();
      alert("Error: " + data.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });
    if (res.ok) fetchProducts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isLogo) setUploadingLogo(true);
    else setUploadingImage(true);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: formDataUpload,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (isLogo) {
          setFormData({ ...formData, logo_url: data.url });
        } else {
          setFormData({ ...formData, image_url: data.url });
        }
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      name: "",
      tagline: "",
      description: "",
      image_url: "",
      image_mode: "cover",
      logo_url: "",
      features: [],
      is_active: true,
      display_order: 0,
      page_content: {
        heroTitle: "",
        heroSubtitle: "",
        heroImage: "",
        detailedFeatures: [],
        screenshots: [],
        isWebsite: false,
        websiteLink: "",
        isApp: false,
        iosLink: "",
        androidLink: ""
      }
    });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      image_url: product.image_url,
      image_mode: product.image_mode || "cover",
      logo_url: product.logo_url || "",
      features: product.features || [],
      is_active: product.is_active,
      display_order: product.display_order || 0,
      page_content: {
        heroTitle: product.page_content?.heroTitle || "",
        heroSubtitle: product.page_content?.heroSubtitle || "",
        heroImage: product.page_content?.heroImage || "",
        detailedFeatures: product.page_content?.detailedFeatures || [],
        screenshots: product.page_content?.screenshots || [],
        isWebsite: product.page_content?.isWebsite || false,
        websiteLink: product.page_content?.websiteLink || "",
        isApp: product.page_content?.isApp || false,
        iosLink: product.page_content?.iosLink || "",
        androidLink: product.page_content?.androidLink || ""
      }
    });
    setIsModalOpen(true);
  };

  return (
    <PermissionGate permission="manage_products">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Manage Products</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-x-auto overflow-y-auto max-h-[80vh]">
        <table className="w-full text-left text-sm whitespace-nowrap relative">
          <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium text-foreground w-16">S.No</th>
              <th className="px-6 py-4 font-medium text-foreground">Product</th>
              <th className="px-6 py-4 font-medium text-foreground">Product ID</th>
              <th className="px-6 py-4 font-medium text-foreground">Status</th>
              <th className="px-6 py-4 font-medium text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No products found.</td></tr>
            ) : products.map((product, index) => (
              <tr key={product.id} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => router.push(`/admin/products/${product.product_id}`)}>
                <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg flex-shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      {product.name}
                      <div className="text-xs text-muted-foreground font-normal mt-0.5 truncate max-w-[200px] sm:max-w-xs">{product.tagline}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  <span className="bg-muted px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                    {product.product_id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(product); }} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg mr-2 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">{editingProduct ? "Edit Product" : "Add Product"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Product Name</label>
                    <input required type="text" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Add your product name..." />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Tagline</label>
                  <input required type="text" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} placeholder="Add your tagline..." />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Description</label>
                  <textarea required className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Write a detailed description of your product..." />
                </div>

                {/* Platform Links */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold mb-1">Platform Availability</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Website Card */}
                    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.page_content.isWebsite ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => setFormData({ ...formData, page_content: { ...formData.page_content, isWebsite: !formData.page_content.isWebsite } })}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${formData.page_content.isWebsite ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            <Globe className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-sm">Website</span>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${formData.page_content.isWebsite ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                          {formData.page_content.isWebsite && <div className="h-2 w-2 bg-background rounded-full" />}
                        </div>
                      </div>
                      {formData.page_content.isWebsite && (
                        <div onClick={e => e.stopPropagation()} className="mt-4 pt-4 border-t border-primary/20 space-y-2">
                          <label className="text-xs font-semibold text-primary block">Website URL</label>
                          <input type="url" placeholder="Enter the website URL..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" value={formData.page_content.websiteLink} onChange={e => setFormData({ ...formData, page_content: { ...formData.page_content, websiteLink: e.target.value } })} />
                        </div>
                      )}
                    </div>

                    {/* App Card */}
                    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.page_content.isApp ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => setFormData({ ...formData, page_content: { ...formData.page_content, isApp: !formData.page_content.isApp } })}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${formData.page_content.isApp ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-sm">Mobile App</span>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${formData.page_content.isApp ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                          {formData.page_content.isApp && <div className="h-2 w-2 bg-background rounded-full" />}
                        </div>
                      </div>
                      {formData.page_content.isApp && (
                        <div onClick={e => e.stopPropagation()} className="mt-4 pt-4 border-t border-primary/20 space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-primary block mb-1">iOS App Store URL</label>
                            <input type="url" placeholder="Enter the App Store link..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" value={formData.page_content.iosLink} onChange={e => setFormData({ ...formData, page_content: { ...formData.page_content, iosLink: e.target.value } })} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-primary block mb-1">Google Play URL</label>
                            <input type="url" placeholder="Enter the Google Play link..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" value={formData.page_content.androidLink} onChange={e => setFormData({ ...formData, page_content: { ...formData.page_content, androidLink: e.target.value } })} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold block">Features (Homepage)</label>
                    <button type="button" onClick={() => setFormData({ ...formData, features: [...formData.features, ""] })} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          required
                          type="text"
                          className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={feature}
                          onChange={e => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = e.target.value;
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          placeholder="Add a key feature..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.features.length === 0 && (
                      <div className="text-sm text-muted-foreground italic text-center py-4 border border-dashed border-border rounded-xl">No features added. Click "Add Feature".</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Main Image</label>
                  <div className="flex flex-col gap-2">
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="h-16 w-24 object-cover rounded border border-border" />
                    )}
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden">
                        {uploadingImage ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <UploadCloud className="h-6 w-6 mb-2" />
                            <span className="text-xs font-medium">Click to upload</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, false)} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Logo Image (Optional)</label>
                  <div className="flex flex-col gap-2">
                    {formData.logo_url && (
                      <img src={formData.logo_url} alt="Preview" className="h-16 w-24 object-contain rounded border border-border" />
                    )}
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden">
                        {uploadingLogo ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <UploadCloud className="h-6 w-6 mb-2" />
                            <span className="text-xs font-medium">Click to upload</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, true)} disabled={uploadingLogo} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Display Order</label>
                  <input type="number" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Image Mode</label>
                  <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.image_mode} onChange={e => setFormData({ ...formData, image_mode: e.target.value })}>
                    <option value="cover">Cover (Fills space)</option>
                    <option value="contain">Contain (Shows whole image with padding)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Visible on website)</label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PermissionGate>
  );
}

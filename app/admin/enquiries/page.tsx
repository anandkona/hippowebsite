"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, Trash2, Loader2, RefreshCcw, Download, Eye, X } from "lucide-react";

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
};

export default function EnquiriesAdminPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewEnquiry, setPreviewEnquiry] = useState<Enquiry | null>(null);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/enquiries", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/enquiries?id=${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        if (previewEnquiry?.id === id) {
          setPreviewEnquiry(null);
        }
        fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export directly as a real Excel file (.xls / HTML Workbook format)
  // This opens immediately in Microsoft Excel with distinct columns for Name, Phone, Email, Message, Date, and Time
  const handleExportExcel = () => {
    if (enquiries.length === 0) {
      alert("No enquiries to export.");
      return;
    }

    const escapeXml = (unsafe: string = "") => {
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\r\n|\n|\r/g, '<br style="mso-data-placement:same-cell;"/>');
    };

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Customer Enquiries</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #0284c7; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; font-family: Arial, sans-serif; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; font-family: Arial, sans-serif; vertical-align: top; }
          .num { mso-number-format: "\\@"; text-align: left; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">S.No</th>
              <th style="width: 180px;">Name</th>
              <th style="width: 130px;">Phone</th>
              <th style="width: 220px;">Email</th>
              <th style="width: 350px;">Message</th>
              <th style="width: 100px;">Date</th>
              <th style="width: 90px;">Time</th>
            </tr>
          </thead>
          <tbody>
            ${enquiries.map((item, idx) => {
              const dateObj = new Date(item.created_at);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return `
                <tr>
                  <td align="center">${idx + 1}</td>
                  <td><strong>${escapeXml(item.name || "N/A")}</strong></td>
                  <td class="num">${escapeXml(item.phone || "N/A")}</td>
                  <td>${escapeXml(item.email || "Not provided")}</td>
                  <td>${escapeXml(item.message || "No message")}</td>
                  <td>${escapeXml(dateStr)}</td>
                  <td>${escapeXml(timeStr)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateFormatted = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `customer_enquiries_${dateFormatted}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Customer Enquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage consultation requests from the website.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            disabled={isLoading || enquiries.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            title="Export all enquiries to Excel (.csv)"
          >
            <Download className="h-4 w-4" />
            <span>Export to Excel</span>
          </button>

          <button 
            onClick={fetchEnquiries}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p className="text-sm">Loading enquiries...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No enquiries found</p>
          <p className="text-sm mt-1">When customers submit the consultation form, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/70 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap relative">
            <thead className="bg-muted/70 border-b border-border/70 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14">S.No</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider max-w-xs">Message</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enquiries.map((enquiry, idx) => (
                <tr key={enquiry.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-medium text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground">
                    {enquiry.name}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    <a href={"tel:" + enquiry.phone} className="hover:text-primary transition-colors font-medium">{enquiry.phone}</a>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {enquiry.email ? (
                      <a href={"mailto:" + enquiry.email} className="hover:text-primary transition-colors">{enquiry.email}</a>
                    ) : (
                      <span className="italic opacity-50">Not provided</span>
                    )}
                  </td>
                  <td 
                    onClick={() => setPreviewEnquiry(enquiry)}
                    className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate cursor-pointer hover:text-foreground hover:underline" 
                    title="Click to view complete message"
                  >
                    {enquiry.message ? enquiry.message : <span className="italic opacity-50">No message</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {new Date(enquiry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewEnquiry(enquiry)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
                        title="Preview Complete Enquiry"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(enquiry.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COMPLETE MESSAGE / ENQUIRY PREVIEW MODAL */}
      {previewEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl relative my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {previewEnquiry.name ? previewEnquiry.name.charAt(0).toUpperCase() : "E"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    {previewEnquiry.name}
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span>Received:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(previewEnquiry.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })} at {new Date(previewEnquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewEnquiry(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-sm">
              {/* Contact Info Row in Full-Width Straight Lines */}
              <div className="space-y-2.5">
                <div className="p-3.5 sm:px-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Phone Number:
                    </span>
                  </div>
                  <a
                    href={`tel:${previewEnquiry.phone}`}
                    className="font-bold text-foreground hover:text-primary transition-colors text-sm whitespace-nowrap"
                  >
                    {previewEnquiry.phone || "Not provided"}
                  </a>
                </div>

                <div className="p-3.5 sm:px-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      Email Address:
                    </span>
                  </div>
                  {previewEnquiry.email ? (
                    <a
                      href={`mailto:${previewEnquiry.email}`}
                      className="font-bold text-primary hover:underline transition-colors text-sm whitespace-nowrap select-all text-right"
                      title={previewEnquiry.email}
                    >
                      {previewEnquiry.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">Not provided</span>
                  )}
                </div>
              </div>

              {/* Message Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Client Message
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Full consultation notes
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border text-foreground text-sm leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar select-text selection:bg-primary/20">
                  {previewEnquiry.message ? previewEnquiry.message : (
                    <span className="italic text-muted-foreground">No message text was provided with this enquiry.</span>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDelete(previewEnquiry.id)}
                  className="px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Enquiry</span>
                </button>

                <div className="flex items-center gap-2.5">
                  {previewEnquiry.email && (
                    <a
                      href={`mailto:${previewEnquiry.email}?subject=HippoClouds Consultation Follow-up`}
                      className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Reply via Email</span>
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewEnquiry(null)}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



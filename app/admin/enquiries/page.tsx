"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, Trash2, Loader2, RefreshCcw } from "lucide-react";

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
      if (res.ok) fetchEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Enquiries</h1>
          <p className="text-muted-foreground mt-1">Manage consultation requests from the website.</p>
        </div>
        <button 
          onClick={fetchEnquiries}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>Loading enquiries...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No enquiries found</p>
          <p className="text-sm mt-1">When customers submit the consultation form, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap relative">
              <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">S.No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((enquiry, idx) => (
                  <tr key={enquiry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {enquiry.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <a href={"tel:" + enquiry.phone} className="hover:text-foreground transition-colors">{enquiry.phone}</a>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {enquiry.email ? (
                        <a href={"mailto:" + enquiry.email} className="hover:text-foreground transition-colors">{enquiry.email}</a>
                      ) : (
                        <span className="italic opacity-50">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={enquiry.message}>
                      {enquiry.message ? enquiry.message : <span className="italic opacity-50">No message</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(enquiry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button 
                        onClick={() => handleDelete(enquiry.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-lg inline-flex items-center justify-center"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}



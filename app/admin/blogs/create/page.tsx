"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Loader2, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import PermissionGate from "@/components/admin/PermissionGate";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [readTime, setReadTime] = useState("5 min read");
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userRole, setUserRole] = useState("viewer");

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
  }, []);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");


  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const token = localStorage.getItem('admin_token');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCoverImage(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Upload error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSave = async (isPublished: boolean) => {
    if (!title || !excerpt || !content) {
      alert("Please fill in all required fields (Title, Excerpt, Content)");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          image_url: coverImage,
          read_time: readTime,
          published_date: publishedDate,
          is_active: isPublished,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords
        }),
      });

      if (response.ok) {
        router.push("/admin/blogs");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save post");
      }
    } catch (error) {
      alert("An error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PermissionGate permission="manage_blogs">
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin/blogs" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isLoading || userRole === 'viewer'}
            className="px-4 py-2 border border-input bg-background hover:bg-muted rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isLoading || userRole === 'viewer'}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Post Title <span className="text-red-500">*</span></label>
            <input
              placeholder="e.g. The Future of AI in 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Content <span className="text-red-500">*</span></label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>
          
          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <h4 className="font-semibold text-lg">SEO Settings</h4>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meta Title</label>
              <input
                placeholder="SEO Title..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meta Keywords</label>
              <input
                placeholder="tech, ai, future..."
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meta Description</label>
              <textarea
                placeholder="Brief description for search engines..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full h-24 rounded-md border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <h4 className="font-semibold text-lg">Metadata</h4>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Technology">Technology</option>
                <option value="AI & Enterprise">AI & Enterprise</option>
                <option value="IoT Innovation">IoT Innovation</option>
                <option value="Strategy">Strategy</option>
                <option value="Cloud">Cloud</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Excerpt <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Brief summary for the blog card..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Cover Image</label>
                <input
                  type="file"
                  className="hidden"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="text-xs font-medium flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  {isUploadingCover ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
                  Upload
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  placeholder="https://... or upload"
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>
              {coverImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border aspect-video max-w-sm">
                  <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Read Time</label>
              <input
                placeholder="e.g. 5 min read"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Publish Date</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </PermissionGate>
  );
}

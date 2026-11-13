import Link from "next/link";
import { MapPin, Briefcase, Clock, ArrowRight, IndianRupee, Sparkles } from "lucide-react";

export interface JobCardProps {
  job: {
    id: number;
    job_id: string;
    slug: string;
    title: string;
    department: string;
    business_unit?: string;
    city?: string;
    country?: string;
    work_mode?: string;
    employment_type?: string;
    experience_level?: string;
    min_experience?: number;
    max_experience?: number;
    min_salary?: number;
    max_salary?: number;
    is_salary_public?: boolean;
    required_skills?: string[];
    created_at?: string;
    closing_date?: string;
    openings?: number;
    featured?: boolean;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const toLpa = (val: number) => {
      const lpa = val >= 10000 ? val / 100000 : val;
      return lpa % 1 === 0 ? `${lpa}` : `${lpa.toFixed(1)}`;
    };
    if (min && max) return `₹${toLpa(min)} - ${toLpa(max)} LPA`;
    if (min) return `From ₹${toLpa(min)} LPA`;
    return `Up to ₹${toLpa(max!)} LPA`;
  };

  const experienceText =
    job.experience_level ||
    (job.min_experience !== undefined && job.max_experience
      ? `${job.min_experience} - ${job.max_experience} yrs`
      : job.min_experience
      ? `${job.min_experience}+ yrs`
      : "Experienced");

  return (
    <div
      className={`group relative bg-card rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-7 flex flex-col justify-between ${
        job.featured
          ? "border-primary/50 shadow-md ring-1 ring-primary/20"
          : "border-border hover:border-primary/40"
      }`}
    >
      {job.featured && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-secondary text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3" />
          Featured Position
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
              {job.department}
            </span>
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mt-1 line-clamp-1">
              {job.title}
            </h3>
          </div>
          <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md shrink-0">
            {job.job_id}
          </span>
        </div>

        {/* Key Attributes */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground mb-5">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {job.city || "Visakhapatnam"}, {job.country || "India"}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            {job.work_mode || "Onsite"} • {job.employment_type || "Full Time"}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {experienceText}
          </span>
          {job.is_salary_public && (job.min_salary || job.max_salary) && (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <IndianRupee className="w-3.5 h-3.5" />
              {formatSalary(job.min_salary, job.max_salary)}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {job.required_skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold bg-muted/60 text-foreground/80 px-2.5 py-1 rounded-md border border-border/50"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="text-[11px] font-medium text-muted-foreground px-1 py-1">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {job.openings ? `${job.openings} opening${job.openings > 1 ? "s" : ""}` : "Actively Hiring"}
        </span>

        <Link
          href={`/careers/jobs/${job.slug || job.job_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-primary transition-colors group/btn"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

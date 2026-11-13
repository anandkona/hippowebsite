import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const [
      totalJobsRes,
      activeJobsRes,
      totalAppsRes,
      shortlistedRes,
      interviewsRes,
      offersRes,
      hiredRes,
      deptRes,
      funnelRes,
      recentAppsRes
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM jobs'),
      query("SELECT COUNT(*) as count FROM jobs WHERE status = 'Published'"),
      query('SELECT COUNT(*) as count FROM applications'),
      query("SELECT COUNT(*) as count FROM applications WHERE stage = 'Shortlisted'"),
      query("SELECT COUNT(*) as count FROM interviews WHERE status = 'Scheduled'"),
      query("SELECT COUNT(*) as count FROM offers WHERE status IN ('Sent', 'Accepted')"),
      query("SELECT COUNT(*) as count FROM applications WHERE stage = 'Hired'"),
      query("SELECT department, COUNT(*) as count FROM jobs GROUP BY department ORDER BY count DESC LIMIT 6"),
      query("SELECT stage, COUNT(*) as count FROM applications GROUP BY stage"),
      query(`
        SELECT a.application_id, a.applied_at, a.stage, j.title as job_title, c.first_name, c.last_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN candidates c ON a.candidate_id = c.id
        ORDER BY a.applied_at DESC
        LIMIT 5
      `)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalJobs: parseInt(totalJobsRes.rows[0]?.count || '0'),
          activeJobs: parseInt(activeJobsRes.rows[0]?.count || '0'),
          totalApplications: parseInt(totalAppsRes.rows[0]?.count || '0'),
          shortlisted: parseInt(shortlistedRes.rows[0]?.count || '0'),
          activeInterviews: parseInt(interviewsRes.rows[0]?.count || '0'),
          offersReleased: parseInt(offersRes.rows[0]?.count || '0'),
          hired: parseInt(hiredRes.rows[0]?.count || '0')
        },
        jobsByDepartment: deptRes.rows,
        pipelineFunnel: funnelRes.rows,
        recentApplications: recentAppsRes.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch analytics' }, { status: 500 });
  }
}


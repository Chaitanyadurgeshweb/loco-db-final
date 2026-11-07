import { getAdmin } from "@/lib/auth"; import { buildTemplate } from "@/lib/bulk";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorised", { status: 401 });
  return new Response(buildTemplate(), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="loco_bulk_upload_template.xlsx"', "Cache-Control": "no-store" } });
}

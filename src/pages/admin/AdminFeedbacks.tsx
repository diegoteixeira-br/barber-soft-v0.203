import { AdminLayout } from "@/components/admin/AdminLayout";
import { FeedbacksTable } from "@/components/admin/FeedbacksTable";

export default function AdminFeedbacks() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedbacks</h1>
          <p className="text-slate-400">Central de feedbacks e reportes de bugs</p>
        </div>

        <FeedbacksTable />
      </div>
    </AdminLayout>
  );
}

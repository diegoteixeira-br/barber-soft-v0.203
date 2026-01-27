import { AdminLayout } from "@/components/admin/AdminLayout";
import { CompaniesTable } from "@/components/admin/CompaniesTable";

export default function AdminCompanies() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Barbearias</h1>
          <p className="text-slate-400">Gerencie todas as barbearias cadastradas</p>
        </div>

        <CompaniesTable />
      </div>
    </AdminLayout>
  );
}

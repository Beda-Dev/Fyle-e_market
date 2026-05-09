import { Metadata } from "next";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Tableau de bord | Eburnie Admin",
  description: "Administration de Eburnie",
};

export default function AdminPage() {
  return <AdminDashboard />;
}

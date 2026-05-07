import { Metadata } from "next";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Tableau de bord | FYLE MARKET Admin",
  description: "Administration de FYLE MARKET",
};

export default function AdminPage() {
  return <AdminDashboard />;
}

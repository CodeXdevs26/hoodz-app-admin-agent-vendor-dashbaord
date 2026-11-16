import { redirect } from "next/navigation";

export const metadata = {
  title: "Wallet Transactions - Admin",
  description: "Wallet Transactions page for Admin",
};

// Hidden on purpose: customer wallet top-up records belong to the retired
// online-payment flow (owner decision: cash on delivery only). The page
// components are kept in the codebase but are no longer reachable — anyone
// landing on this route is sent back to the admin dashboard.
export default function page() {
  redirect("/admin/dashboard");
}

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const nav =
    user.role === "ADMIN"
      ? [
          { href: "/panel/admin", label: "Başvurular" },
          { href: "/yorumlar", label: "Yorumlar" },
        ]
      : user.role === "FIRM"
        ? [
            { href: "/panel", label: "İş taleplerim" },
            { href: "/panel/yeni-is", label: "Yeni iş talebi" },
            { href: "/yorumlar", label: "Yorumlar" },
          ]
        : [
            { href: "/panel", label: "Açık işler" },
            { href: "/panel/islerim", label: "İşlerim" },
            { href: "/yorumlar", label: "Yorumlar" },
          ];

  return (
    <AppShell
      user={{ displayName: user.displayName, role: user.role, email: user.email }}
      nav={nav}
    >
      {children}
    </AppShell>
  );
}

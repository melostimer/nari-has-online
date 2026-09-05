"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function StaffGuard() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userRole = (session?.user as any)?.role;
    if (status === "authenticated" && userRole === "STAFF") {
      if (!pathname.startsWith("/admin")) {
        router.replace("/admin/satis");
      }
    }
  }, [status, session, pathname, router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RefreshRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isReload =
        (window.performance?.navigation && window.performance.navigation.type === 1) ||
        window.performance?.getEntriesByType("navigation").some((nav: any) => nav.type === "reload");

      if (isReload && pathname !== "/") {
        window.location.href = "/";
      }
    }
  }, [pathname]);

  return null;
}

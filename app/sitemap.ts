import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { publicNavigation } from "@/lib/navigation/public";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...publicNavigation.map(({ href }) => href), "/help", "/privacy", "/terms"].map(
    (path) => ({ url: `${siteUrl()}${path}` }),
  );
}

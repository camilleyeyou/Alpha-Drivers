import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alpha-drivers.cm";

  const cities = ["douala", "yaounde", "limbe", "buea"];

  const staticPages = [
    { url: baseUrl, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/tarifs`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/login`, changeFrequency: "yearly" as const, priority: 0.4 },
    { url: `${baseUrl}/register`, changeFrequency: "yearly" as const, priority: 0.5 },
  ];

  const cityPages = cities.flatMap((city) => [
    {
      url: `${baseUrl}/chauffeur-${city}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/drivers/${city}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ]);

  return [...staticPages, ...cityPages];
}

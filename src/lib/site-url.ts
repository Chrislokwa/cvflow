export function getSiteUrl(): URL {
  const configuredUrl = process.env.AUTH_URL?.trim();

  if (configuredUrl) return new URL(configuredUrl);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return new URL(`https://${vercelUrl}`);

  return new URL("http://localhost:3000");
}

import { redirect } from "next/navigation";

export default async function WallboardRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ kiosk?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const kiosk = sp.kiosk === "1";
  redirect(`/wallboard-ghosts/${encodeURIComponent(id)}${kiosk ? "?kiosk=1" : ""}`);
}


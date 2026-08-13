import { redirect } from "next/navigation";
export default async function LegacyScreen({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/ui/${id}`); }

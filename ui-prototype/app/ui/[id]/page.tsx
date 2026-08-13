import { notFound } from "next/navigation";
import { ScreenRenderer } from "@/app/components/taskflow-ui";
import { screenById, screens } from "@/app/lib/screens";
export function generateStaticParams() { return screens.map((screen) => ({ id: screen.id })); }
export default async function AtlasScreen({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const screen = screenById.get(id); if (!screen) notFound(); return <ScreenRenderer screen={screen} />; }

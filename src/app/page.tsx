import { HomeFeature } from "@/features/home/home-feature";
import { getCurrentUserIdentity } from "@/server/repositories/current-user-repository";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUserIdentity();
  return <HomeFeature userName={user?.displayName ?? "你"} />;
}

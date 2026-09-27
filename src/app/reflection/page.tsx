import { ReflectionFeature } from "@/features/reflection/reflection-feature";
import { getCurrentReflectionPageData } from "@/server/repositories/reflection-repository";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; sessionId?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.source === "roleplay" ? params.sessionId : undefined;
  const data = await getCurrentReflectionPageData(sessionId);
  if (!data) return <div className="page-content"><p>还没有找到当前用户，请先完成本地演示数据初始化。</p></div>;
  return <ReflectionFeature data={data} />;
}

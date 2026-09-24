import { Suspense } from "react";
import { RoleplayFeature } from "@/features/roleplay/roleplay-feature";
import { getCurrentRoleplayPageData } from "@/server/repositories/roleplay-repository";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getCurrentRoleplayPageData();
  if (!data) return <div className="page-content"><p>还没有找到当前用户，请先完成本地演示数据初始化。</p></div>;
  return <Suspense fallback={<div className="page-content">正在打开练习空间…</div>}><RoleplayFeature data={data}/></Suspense>;
}

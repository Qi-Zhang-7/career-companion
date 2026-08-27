import { SettingsFeature } from "@/features/settings/settings-feature";
import { getCurrentSettingsPageData } from "@/server/repositories/memory-repository";

export const dynamic = "force-dynamic";

export default async function Page(){
  const data = await getCurrentSettingsPageData();
  if (!data) return <div className="page-content"><p>还没有找到当前用户，请先完成本地演示数据初始化。</p></div>;
  return <SettingsFeature data={data}/>;
}

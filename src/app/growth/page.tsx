import { GrowthFeature } from "@/features/growth/growth-feature";
import { getGrowthPageData } from "@/server/repositories/growth-repository";

export const dynamic = "force-dynamic";

export default async function Page(){
  const data = await getGrowthPageData();
  if (!data) return <div className="page-content"><p>还没有成长记录。完成一次事件记录后，这里会开始形成你的时间线。</p></div>;
  return <GrowthFeature data={data}/>;
}

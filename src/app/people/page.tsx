import { PeopleFeature } from "@/features/people/people-feature";
import { getCurrentPeoplePageData } from "@/server/repositories/people-repository";

export const dynamic = "force-dynamic";

export default async function Page(){
  const data = await getCurrentPeoplePageData();
  if (!data) return <div className="page-content"><p>还没有找到当前用户，请先完成本地演示数据初始化。</p></div>;
  return <PeopleFeature data={data}/>;
}

import { CareerFeature } from "@/features/career/career-feature";
import { getCurrentCareerPageData } from "@/server/repositories/career-repository";

export const dynamic = "force-dynamic";

export default async function Page(){
  const data = await getCurrentCareerPageData();
  if (!data) return <div className="page-content"><p>还没有找到当前用户，请先完成本地演示数据初始化。</p></div>;
  return <CareerFeature data={data}/>;
}

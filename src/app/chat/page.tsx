import { Suspense } from "react";
import { ChatFeature } from "@/features/chat/chat-feature";
import { getCurrentChatPageData } from "@/server/repositories/chat-repository";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getCurrentChatPageData();
  if (!data) return <div className="page-content"><p>还没有找到当前用户，请先完成本地演示数据初始化。</p></div>;
  return <Suspense fallback={<div className="page-content">正在打开你的陪伴空间…</div>}><ChatFeature data={data}/></Suspense>;
}

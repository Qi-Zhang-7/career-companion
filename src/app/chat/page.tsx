import { Suspense } from "react";
import { ChatFeature } from "@/features/chat/chat-feature";
export default function Page() { return <Suspense fallback={<div className="page-content">正在打开你的陪伴空间…</div>}><ChatFeature/></Suspense>; }

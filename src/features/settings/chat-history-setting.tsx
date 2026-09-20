"use client";
import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { toggleChatHistory } from "./settings-actions";

export function ChatHistorySetting({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(toggleChatHistory, { message: "" });
  return <Card className="p-5">
    <h2 className="mt-0 text-base font-semibold">聊天历史</h2>
    <form action={action} className="flex items-center justify-between rounded-2xl bg-[#f3f1eb] p-4">
      <span className="text-sm">保存聊天历史</span>
      <input type="hidden" name="enabled" value={String(!enabled)}/>
      <button type="submit" role="switch" aria-checked={enabled} aria-label="保存聊天历史" disabled={pending} className={`relative h-7 w-12 rounded-full border-0 disabled:opacity-50 ${enabled ? "bg-[#466a5b]" : "bg-[#bbbdb9]"}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white ${enabled ? "left-6" : "left-1"}`}/>
      </button>
    </form>
    <p className="text-xs leading-5 text-[#7a8680]">关闭后，新对话仅保留在当前页面，刷新或离开后消失，也不会进入长期记忆。已有历史仍可查看，重新开启后可继续追加消息。</p>
    <p role="status" className="text-xs text-[#466a5b]">{pending ? "正在保存…" : state.message}</p>
  </Card>;
}

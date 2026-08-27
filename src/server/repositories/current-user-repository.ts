import { prisma } from "@/server/db/prisma";

// MVP 暂无登录系统，所有页面暂时通过同一演示账号解析“当前用户”。
// 接入鉴权后，只需在这里把 email 查找替换为 session.user.id。
export const CURRENT_DEMO_USER_EMAIL = "demo@career-companion.local";

export async function getCurrentUserIdentity() {
  return prisma.user.findUnique({
    where: { email: CURRENT_DEMO_USER_EMAIL },
    select: {
      id: true,
      displayName: true,
      email: true,
      memoryEnabled: true,
    },
  });
}

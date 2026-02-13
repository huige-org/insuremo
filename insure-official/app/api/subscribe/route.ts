import { NextRequest, NextResponse } from "next/server";

interface SubscribeData {
  email: string;
}

/**
 * 处理邮件订阅
 *
 * 实现步骤：
 * 1. 验证邮箱
 * 2. 检查是否已订阅
 * 3. 保存到数据库或邮件列表服务
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubscribeData = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: "邮箱地址是必需的" }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "邮箱格式无效" }, { status: 400 });
    }

    // TODO: 集成邮件列表服务（如 Mailchimp、SendGrid）
    // TODO: 检查重复订阅
    // TODO: 发送确认邮件

    console.log("Subscribe request:", body.email);

    return NextResponse.json(
      {
        success: true,
        message: "订阅成功，感谢您的支持",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "订阅失败，请稍后重试" },
      { status: 500 },
    );
  }
}

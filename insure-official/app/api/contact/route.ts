import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * 处理联系表单提交
 *
 * 实现步骤：
 * 1. 验证请求数据
 * 2. 清理和格式化输入
 * 3. 发送邮件或保存到数据库
 * 4. 返回响应
 */
export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // 验证必需字段
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "缺少必需的字段" }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "邮箱格式无效" }, { status: 400 });
    }

    // TODO: 实现以下任一操作：
    // 1. 发送邮件给客服
    // 2. 保存到数据库
    // 3. 集成 Webhook（如 Slack）

    console.log("Contact form submitted:", body);

    return NextResponse.json(
      {
        success: true,
        message: "感谢您的联系，我们会尽快回复，请耐心等待",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "表单提交失败，请稍后重试" },
      { status: 500 },
    );
  }
}

export default async function handler(req, res) {
  const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
  const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
  const appToken = process.env.FEISHU_APP_TOKEN;
  const tableId = process.env.FEISHU_TABLE_ID;
  const viewId = process.env.FEISHU_VIEW_ID;
  const API_SECRET_KEY = process.env.API_SECRET_KEY; // 自定义接口访问密钥

  // 1. 安全校验：检查 API 密钥
  if (req.headers["x-api-key"] !== API_SECRET_KEY) {
    return res.status(403).json({ error: "无权限访问接口" });
  }

  try {
    // 2. 获取飞书 tenant access token
    const authRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: FEISHU_APP_ID,
        app_secret: FEISHU_APP_SECRET
      })
    });

    const authData = await authRes.json();
    const token = authData.tenant_access_token;

    if (!token) {
      console.error("飞书 token 获取失败:", authData?.msg || authData);
      return res.status(500).json({ error: "获取 token 失败" });
    }

    // 3. 请求多维表格数据
    const sheetUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?view_id=${viewId}`;
    const dataRes = await fetch(sheetUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const contentType = dataRes.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await dataRes.text();
      console.error("飞书返回非 JSON 格式：", text);
      return res.status(500).json({ error: "飞书返回异常" });
    }

    const rawData = await dataRes.json();
    const allItems = rawData?.data?.items || [];

    // 4. 过滤指定状态的记录（可选）
    const targetStatus = req.query.status;
    let filteredItems = allItems;

    if (targetStatus) {
      filteredItems = allItems.filter(item => {
        const status = item.fields?.["状态"];
        return status === targetStatus;
      });
    }

    // 5. 只返回需要字段（脱敏处理）
    const resultItems = filteredItems.map(item => ({
      plate: item.fields?.["车牌"],
      qr: item.fields?.["二维码"]
    }));

    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        total: resultItems.length,
        has_more: false,
        items: resultItems
      }
    });

  } catch (e) {
    console.error("接口异常:", e?.message || e);
    res.status(500).json({ error: "服务器异常" });
  }
}

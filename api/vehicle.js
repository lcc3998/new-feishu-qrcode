export default async function handler(req, res) {
  const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
  const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
  const appToken = process.env.FEISHU_APP_TOKEN;
  const tableId = process.env.FEISHU_TABLE_ID;
  const viewId = process.env.FEISHU_VIEW_ID;

  try {
    // 获取 tenant access token
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
      console.error("获取 token 失败", authData);
      return res.status(500).json({ error: "获取 token 失败", detail: authData });
    }

    // 获取记录
    const sheetUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?view_id=${viewId}`;
    const dataRes = await fetch(sheetUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const contentType = dataRes.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await dataRes.text();
      console.error("返回内容不是 JSON：", text);
      return res.status(500).json({ error: "返回内容不是 JSON", detail: text });
    }

    const rawData = await dataRes.json();

    // 筛选状态
    const targetStatus = req.query.status;
    const allItems = rawData?.data?.items || [];

    let filteredItems = allItems;

    if (targetStatus) {
      filteredItems = allItems.filter(item => {
        const status = item.fields?.["车辆状态"];
        return status === targetStatus;
      });
    }

    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        total: filteredItems.length,
        has_more: false,
        items: filteredItems
      }
    });

  } catch (e) {
    console.error("异常：", e);
    res.status(500).json({ error: "服务器异常", detail: e.message });
  }
}

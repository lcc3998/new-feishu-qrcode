export default async function handler(req, res) {
  const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
  const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

  // 获取 tenant_access_token
  const authRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    })
  });

  const authJson = await authRes.json();
  const token = authJson.tenant_access_token;

  if (!token) {
    return res.status(401).json({ error: "获取 access token 失败", detail: authJson });
  }

  // 替换成你的飞书表格信息
  const appToken = "NtUlbkEMGaVhH7sMzyTcbYoJnnd";
  const tableId = "tblIf0x1JXQ0S0pF";
  const viewId = "vewb48WrBR";
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${sheetToken}/tables/${tableId}/records?view_id=${viewId}`;

  const sheetUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?view_id=${viewId}`;

  const dataRes = await fetch(sheetUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const json = await dataRes.json();

  if (!json.data) {
    return res.status(500).json({ error: "获取数据失败", detail: json });
  }

  const records = json.data.items.map(item => ({
    状态: item.fields["状态"],
    车牌: item.fields["车牌"],
    二维码: item.fields["二维码"]
  }));

  res.status(200).json(records);
}

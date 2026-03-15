/*
 報價單 HTML 模板 (備註與總計並排版)
*/

export const getQuoteHtml = (clientName, items, totalAmount, companyInfo, clients = []) => {
  const targetClient = (Array.isArray(clients) && clients.length > 0)
    ? clients.find(c => clientName.includes(c.name)) || {}
    : {};

  const dateStr = new Date().toLocaleDateString('zh-TW');

  let displayName = clientName;
  if (clientName.includes(' - ')) {
    displayName = clientName.split(' - ')[0];
  }

return `
<html>
  <head>

    <style>
      body {font-family: "Microsoft JhengHei", Arial; margin: 0; padding: 20px; background: #f2f2f2;}
      .container { width: 900px; margin: auto; background: #fff; padding: 20px; border: 1px solid #ccc;}
      .header { text-align: center; }
      .company { font-size: 28px; letter-spacing: 4px; font-weight: bold;}
      .subinfo { font-size: 12px; margin-top: 5px; line-height: 1.5; }
      .title { font-size: 22px; margin-top: 8px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 3px; display: inline-block;}
      .title span { margin-right: 10px; }
      .title span:last-child { margin-right: 0; }
      .top-info { margin-top: 20px; font-size: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .items-table th,.items-table td { border-bottom: 1px solid #000; padding: 8px; font-size: 14px; }
      .items-table th { text-align: left; background-color: #f9f9f9; }
      .center { text-align: center; }
      .right { text-align: right;}
      .summary-layout { width: 100%; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
      .note-box { font-size: 13px; color: #333; background: #fafafa; padding: 15px; border-radius: 5px; min-height: 100px; }
      .total-box { font-size: 14px; line-height: 2; }
      .total-row-bold { font-size: 1.1em;   color: #B00020; }
      .bottom { display: flex; margin-top: 20px; gap: 20px; }
      .bank { flex: 1; border: 1px solid #000; padding: 10px; font-size: 13px; }
      .signature { flex: 1; border: 1px solid #000; height: 120px; text-align: center; padding-top: 10px; }
    </style>

  </head>

<body>
  <div class="container">
    <div class="header">
      <div class="company">${companyInfo.name}</div>
      <div class="subinfo">
        地址：${companyInfo.address} | 統編：${companyInfo.taxId}<br>
        電話：${companyInfo.phone}
      </div>
      <div class="title"><span>報</span><span>價</span><span>單</span></div>
    </div>

    <div class="top-info">
      <div><strong>客戶窗口：</strong>${targetClient.name || displayName}</div>
      <div><strong>報價日期：</strong>${dateStr}</div>
      <div><strong>客戶電話：</strong>${targetClient.phone || ""}</div>
      <div><strong>公司名稱：</strong>${targetClient.companyName || "個人"}</div>
      <div><strong>客戶地址：</strong>${targetClient.address || ""}</div>
      <div><strong>公司統編：</strong>${targetClient.taxId || ""}</div>
      <div><strong>付款方式：</strong>未設定</div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 8%;" class="center">項序</th>
          <th style="width: 35%;">工項名稱</th>
          <th class="right">單價</th>
          <th class="center">數量</th>
          <th class="center">單位</th>
          <th class="right">小計</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((i, index) => `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${i.name}</td>
          <td class="right">${Number(i.price).toLocaleString()}</td>
          <td class="center">${i.qty}</td>
          <td class="center">${i.unit}</td>
          <td class="right">${(Number(i.price) * Number(i.qty)).toLocaleString()}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <table class="summary-layout" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="65%" valign="top">
          <div class="note-box">
            <p style="margin-top:0;"><strong>備註事項：</strong></p>
            <p style="margin-bottom:0; white-space: pre-wrap;">${(companyInfo.note || "無")}</p>
          </div>
        </td>

        <td width="35%" valign="top" align="right">
          <table width="100%" class="total-box" border="0">
            <tr>
              <td align="left" style="padding-left: 20px;">未稅總計</td>
              <td align="right">NT$ ${totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td align="left" style="padding-left: 20px;">5% 稅金</td>
              <td align="right">NT$ ${Math.round(totalAmount * 0.05).toLocaleString()}</td>
            </tr>
            <tr class="total-row-bold">
              <td align="left" style="padding-left: 20px;"><strong>含稅總額</strong></td>
              <td align="right"><strong>NT$ ${Math.round(totalAmount * 1.05).toLocaleString()}</strong></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <div class="bottom">

      <div class="bank">
        <strong>【匯款資訊】</strong><br>
        銀行代碼：${companyInfo.bankCode || "---"}<br>
        銀行名稱：${companyInfo.bankName || ""}${companyInfo.bankBranch ? " - " + companyInfo.bankBranch : ""}<br>
        銀行帳號：${companyInfo.bankAccount || "---"}<br>
        帳戶名稱：${companyInfo.accountName || companyInfo.name}
      </div>

      <div class="signature">
        訂單客戶確認回簽<br>
        簽名或公司章
      </div>
    </div>
</body>

</html>
`;
};
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { getQuoteHtml } from './pdfTemplate'; // 引入模板

export const generatePDF = async (
  clientName, 
  items, 
  totalAmount, 
  companyInfo, 
  clients, 
  showDarkAlert
) => {
  try {
    // --- 修正 1：改用 includes 尋找客戶，確保能對應到「姓名 - 公司」的格式 ---
    const targetClient = clients.find(c => clientName.includes(c.name));
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    
    // 檔名處理
    const nameStr = clientName || "未命名";
    const addressStr = targetClient?.address || "未設定地點";
    
    // 過濾掉檔名不合法的字元
    const fileName = `${dateStr}-${nameStr}-${addressStr}.pdf`.replace(/[/\\?%*:|"<>]/g, '-');

    // --- 修正 2：將 clients 陣列傳入模板函數，否則模板內會找不到客戶細節 ---
    const htmlContent = getQuoteHtml(clientName, items, totalAmount, companyInfo, clients);

    const { uri: tempUri } = await Print.printToFileAsync({ html: htmlContent });
    const finalUri = FileSystem.cacheDirectory + fileName;
    
    await FileSystem.moveAsync({ from: tempUri, to: finalUri });
    await Sharing.shareAsync(finalUri);
    
  } catch (error) { 
    showDarkAlert("產生失敗", "錯誤：" + error.message, null, false); 
  }
};
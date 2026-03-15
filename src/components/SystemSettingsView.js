import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, Modal, TextInput, Share, Clipboard } from 'react-native'; 
import { styles } from './GlobalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 版本號比對工具
const shouldUpdate = (local, remote) => {
  if (!local || !remote) return false;
  const vLocal = local.replace('v', '').split('.').map(Number);
  const vRemote = remote.replace('v', '').split('.').map(Number);
  for (let i = 0; i < Math.max(vLocal.length, vRemote.length); i++) {
    const l = vLocal[i] || 0;
    const r = vRemote[i] || 0;
    if (r > l) return true;
    if (l > r) return false;
  }
  return false;
};

const SystemSettingsView = ({ 
  setCurrentPage, showToast, showDarkAlert, 
  APP_VERSION, saveHistoryData, saveClientsData, 
  saveMaterialsData, companyInfo, saveCompanyData, 
  openLegal
}) => {

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');

  // 1. 檢查更新
  const checkUpdate = async () => {
    const TEST_URL = "https://raw.githubusercontent.com/witt3c/Project-quotation/refs/heads/main/version.json"; 
    try {
      const response = await fetch(TEST_URL);
      const data = await response.json();
      if (shouldUpdate(APP_VERSION, data.latestVersion)) {
        showDarkAlert(
          "發現新版本 " + data.latestVersion,
          data.updateLog,
          () => Linking.openURL(data.downloadUrl),
          true,
          "前往更新",
          "稍後再說"
        );
      } else {
        showToast("目前已是最新版本");
      }
    } catch (error) {
      showToast("連線失敗，請檢查網路");
    }
  };

  // 2. 匯出備份 (分享文字)
  const exportData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      const backupObject = {};
      allData.forEach(([key, value]) => {
        try {
          backupObject[key] = value ? JSON.parse(value) : null;
        } catch (e) {
          backupObject[key] = value;
        }
      });

      backupObject.backupTime = new Date().toLocaleString();
      backupObject.appSignature = "QUOTATION_APP_BACKUP";

      const backupString = JSON.stringify(backupObject);
      await Share.share({ title: '報價助手資料備份', message: backupString });
      showToast("✅ 已開啟分享");
    } catch (error) {
      Alert.alert("匯出失敗", error.message);
    }
  };

  // 3. 開啟匯入視窗並偵測剪貼簿
  const handleOpenImport = async () => {
    setImportModalVisible(true);
    try {
      const content = await Clipboard.getString();
      if (content && content.includes("QUOTATION_APP_BACKUP")) {
        Alert.alert(
          "偵測到備份代碼",
          "剪貼簿中似乎有備份資料，要直接貼上嗎？",
          [
            { text: "手動輸入", style: "cancel" },
            { text: "直接貼上", onPress: () => setInputText(content) }
          ]
        );
      }
    } catch (e) {
      console.log("無法讀取剪貼簿");
    }
  };

  // 4. 執行匯入
  const performImport = (inputString) => {
    if (!inputString || inputString.trim() === '') return;
    try {
      const data = JSON.parse(inputString);
      const companyData = data['@company'] || data['COMPANY'];
      const historyData = data['@history'] || data['HISTORY'];
      const clientData = data['@clients'] || data['CLIENTS'];
      const materialData = data['@materials'] || data['MATERIALS'];

      if (!companyData && !historyData && !clientData) {
        Alert.alert("還原失敗", "代碼內容不正確。");
        return;
      }

      setImportModalVisible(false);
      setTimeout(() => {
        showDarkAlert(
          "確定還原？",
          "還原將覆蓋現有資料且無法復原，確定執行？",
          async () => {
            if (companyData) { await AsyncStorage.setItem('@company', JSON.stringify(companyData)); saveCompanyData(companyData); }
            if (materialData) { await AsyncStorage.setItem('@materials', JSON.stringify(materialData)); saveMaterialsData(materialData); }
            if (clientData) { await AsyncStorage.setItem('@clients', JSON.stringify(clientData)); saveClientsData(clientData); }
            if (historyData) { await AsyncStorage.setItem('@history', JSON.stringify(historyData)); saveHistoryData(historyData); }
            showToast("✅ 資料還原成功");
            setInputText('');
          },
          true, "確定還原", "取消"
        );
      }, 400);
    } catch (e) {
      Alert.alert("解析失敗", "請確保貼上的內容是完整的。");
    }
  };

  // 5. 重置邏輯 (修正 Key 值以匹配 @ 格式)
  const performReset = async (type) => {
    try {
      const keys = {
        history: '@history',
        clients: '@clients',
        materials: '@materials',
        company: '@company'
      };

      if (type === 'all') {
        await AsyncStorage.clear();
        saveHistoryData([]); saveClientsData([]); saveMaterialsData([]);
        saveCompanyData({ name: '專業工程行報價助手', address: '', taxId: '', phone: '', note: '' });
      } else {
        await AsyncStorage.removeItem(keys[type]);
        if (type === 'history') saveHistoryData([]);
        if (type === 'clients') saveClientsData([]);
        if (type === 'materials') saveMaterialsData([]);
        if (type === 'company') saveCompanyData({ name: '專業工程行報價助手', address: '', taxId: '', phone: '', note: '' });
      }
      showToast("✅ 已成功重置");
    } catch (e) {
      showToast("重置失敗");
    }
  };

  const confirmAction = (type) => {
    setResetModalVisible(false); 
    setTimeout(() => {
      showDarkAlert("最後確認", "此操作將永久刪除相關資料，確定執行？", () => performReset(type), true, "確定刪除", "取消");
    }, 300);
  };

  // 渲染頁面
  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>系統設定</Text>
      
      <ScrollView>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#888', marginBottom: 10, fontSize: 14 }}>資料管理</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TouchableOpacity 
              style={[styles.itemCard, { flex: 1, marginBottom: 0 }]} 
              onPress={exportData}
            >
              <Text style={{ color: '#FFF',  }}>📤 匯出備份</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TouchableOpacity 
              style={[styles.itemCard, { flex: 1, marginBottom: 0 }]} 
              onPress={() => setImportModalVisible(true)}
            >
              <Text style={{ color: '#FFF',  }}>📥 匯入還原</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.itemCard} onPress={() => setResetModalVisible(true)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#FFF' }}>資料重置中心</Text>
              <Text style={{ color: '#666' }}>＞</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 軟體資訊 */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#888', marginBottom: 10, fontSize: 14 }}>軟體資訊</Text>
          <TouchableOpacity style={styles.itemCard} onPress={checkUpdate}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#FFF' }}>檢查更新</Text>
                <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>點擊檢查伺服器版本</Text>
              </View>
              <Text style={{ color: '#BB86FC', fontWeight: 'bold' }}>{APP_VERSION}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.itemCard} onPress={() => openLegal('tos')}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#FFF' }}>服務條款</Text>
                <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>Terms of Service</Text>
              </View>
              <Text style={{ color: '#666' }}>＞</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.itemCard} onPress={() => openLegal('privacy')}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View> 
                <Text style={{ color: '#FFF' }}>隱私政策</Text>
                <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>Privacy Policy</Text>
              </View> 
              <Text style={{ color: '#666' }}>＞</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.itemCard, { borderColor: '#FFD700', borderWidth: 1 }]} onPress={() => setCurrentPage('upgradePro')} >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>🌟 升級專業版</Text>
                <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>解鎖雲端備份、自定義 Logo 與更多模板</Text>
              </View>
              <Text style={{ color: '#FFD700' }}>＞</Text>
            </View>
          </TouchableOpacity>
        </View>       
      </ScrollView>

      {/* 資料重置 Modal */}
      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ color: '#BB86FC', fontSize: 18, fontWeight: 'bold' }}>貼上備份代碼</Text>
              <TouchableOpacity onPress={async () => setInputText(await Clipboard.getString())}>
                <Text style={{ color: '#BB86FC', fontSize: 14 }}>📋 一鍵貼上</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { height: 180, textAlignVertical: 'top', backgroundColor: '#000', color: '#FFF', padding: 10 }]}
              multiline
              placeholder="請在此處貼上 JSON 字串..."
              placeholderTextColor="#555"
              value={inputText}
              onChangeText={setInputText}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={{ flex: 1, padding: 15, alignItems: 'center' }} onPress={() => { setImportModalVisible(false); setInputText(''); }}>
                <Text style={{ color: '#888' }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: '#BB86FC', padding: 15, borderRadius: 8, alignItems: 'center' }} onPress={() => performImport(inputText)}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>開始還原</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 資料重置 Modal */}
      <Modal visible={resetModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 25 }}>
          <View style={{ backgroundColor: '#1E1E1E', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#333' }}>
            <Text style={{ color: '#BB86FC', fontSize: 18, fontWeight: 'bold', padding: 15, textAlign: 'center' }}>資料重置中心</Text>
            <ResetItem title="清空歷史報價紀錄" onPress={() => confirmAction('history')} />
            <ResetItem title="清空客戶管理資料" onPress={() => confirmAction('clients')} />
            <ResetItem title="清空材料庫資料" onPress={() => confirmAction('materials')} />
            <ResetItem title="重置公司設定" onPress={() => confirmAction('company')} />
            <ResetItem title="一鍵全部重置" onPress={() => confirmAction('all')} isLast />
            <TouchableOpacity style={{ padding: 15, marginTop: 10 }} onPress={() => setResetModalVisible(false)}>
              <Text style={{ color: '#BB86FC', textAlign: 'center', fontSize: 16 }}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentPage('home')}>
        <Text style={{ color: '#FFF' }}>返回主頁</Text>
      </TouchableOpacity>
    </View>
  );
};

const ResetItem = ({ title, onPress, isLast }) => (
  <TouchableOpacity 
    style={{ 
      padding: 18, 
      borderBottomWidth: isLast ? 0 : 1, 
      borderBottomColor: '#333', 
      alignItems: 'center' 
    }} 
    onPress={onPress}
  >
    <Text style={{ color: '#FFF', fontSize: 15 }}>{title}</Text>
  </TouchableOpacity>
);

export default SystemSettingsView;
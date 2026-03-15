import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal} from 'react-native';
import { styles } from './GlobalStyles';

const HistoryView = ({ history, saveHistoryData, setCurrentPage, setEditingHistoryId, setClientName, setItems, 
  setIsSaved, showDarkAlert, showToast, setFromPage }) => {

    const [historyMenuVisible, setHistoryMenuVisible] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const handleHistoryAction = (item) => { setSelectedHistoryItem(item); setHistoryMenuVisible(true);};
  
  return (
    <View style={styles.container}>
      {/* 歷史紀錄標題與統計區 */}
<View style={{ 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  paddingHorizontal: 15, 
  marginBottom: 10 
}}>
  <Text style={styles.pageTitle}>歷史報價紀錄</Text>
  
  <View style={{ alignItems: 'flex-end' }}>
    <Text style={{ 
      fontSize: 12, 
      fontWeight: 'bold',
      // 邏輯統一：20筆紅、18筆橘、其餘灰
      color: history.length >= 20 ? '#CF6679' : (history.length >= 18 ? '#FFAB40' : '#888') 
    }}>
      儲存容量：{history.length} / 20
    </Text>
    
    {/* 狀態提示小字 */}
    {history.length >= 20 ? (
      <TouchableOpacity onPress={() => setCurrentPage('upgradePro')}>
        <Text style={{ fontSize: 10, color: '#CF6679', fontWeight: 'bold', textDecorationLine: 'underline' }}>
          ⚠️ 已滿，點擊升級
        </Text>
      </TouchableOpacity>
    ) : history.length >= 18 ? (
      <Text style={{ fontSize: 10, color: '#FFAB40' }}>快額滿了</Text>
    ) : (
      <Text style={{ fontSize: 10, color: '#888' }}>目前空間充足</Text>
    )}
  </View>
</View>
      <Text style={styles.hintText}>💡 長按項目進行「修改」、「複製」或「刪除」</Text>

      <FlatList data={history} keyExtractor={(item) => item.id.toString()}ListEmptyComponent={
        <Text style={{color:'#666', textAlign:'center', marginTop: 20}}>尚無歷史紀錄</Text>}

        renderItem={({ item }) => ( <TouchableOpacity style={styles.historyCard}onLongPress={() => handleHistoryAction(item)}delayLongPress={300}> 
          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>{item.clientName} - <Text style={{ fontSize: 13, color: '#888' }}>{item.date}</Text></Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: '#AAA' }}>📍 {item.clientAddress || '未設定地址'}</Text></View></View>

          <View style={{ justifyContent: 'center', alignItems: 'flex-end', marginLeft: 10 }}>
            <Text style={{ color: '#FFAB40', fontSize: 16, fontWeight: 'bold' }}> NT$ {Math.round(item.total * 1.05).toLocaleString()}</Text>
            <Text style={{ color: '#888', fontSize: 10 }}>含稅</Text></View></TouchableOpacity>)} 
      />
      

      <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentPage('home')}>
        <Text style={{color:'#FFF'}}>返回主頁</Text>
      </TouchableOpacity>


    <Modal visible={historyMenuVisible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} onPress={() => setHistoryMenuVisible(false)}>
        <View style={styles.contextMenu}>
          <Text style={styles.menuHeader}>操作報價紀錄</Text>

          
          
          <TouchableOpacity style={styles.menuOption} onPress={() => {
            setEditingHistoryId(selectedHistoryItem.id);
            setFromPage('history');
            setClientName(selectedHistoryItem.clientName);
            setItems(selectedHistoryItem.items);
            setIsSaved(true); 
            setHistoryMenuVisible(false);
            setCurrentPage('quote');}}>
            <Text style={{color: '#BB86FC', fontSize: 18}}>✏️ 修改報價單</Text>
          </TouchableOpacity>
            
          <TouchableOpacity style={styles.menuOption} onPress={() => {
            if (history.length >= 20) {
    setHistoryMenuVisible(false); // 關閉選單
    return showDarkAlert(
      "達到免費版上限",
      "免費版最多儲存 20 筆歷史紀錄。\n\n請刪除舊紀錄或升級專業版以繼續複製。",
      () => setCurrentPage('upgradePro'),
      true,
      "了解專業版",
      "先不用"
    );
  }
            setEditingHistoryId(null);
  setFromPage('history');
  setClientName(selectedHistoryItem.clientName);
  setItems(selectedHistoryItem.items.map(i => ({...i, id: Date.now() + Math.random()})));
  setIsSaved(false);
  setHistoryMenuVisible(false);
  setCurrentPage('quote');
  showToast("📋 已複製內容為新報價單");
}}>
            <Text style={{color: '#03DAC6', fontSize: 18}}>👯 複製成新單</Text>
          </TouchableOpacity>
            
          <TouchableOpacity style={styles.menuOption} onPress={() => {
            setHistoryMenuVisible(false);
            showDarkAlert("確認刪除", "確定要刪除這筆紀錄嗎？", () => {const updated = history.filter(h => h.id !== selectedHistoryItem.id);
            saveHistoryData(updated);
            showToast("🗑️ 已刪除紀錄");}, true);
            }}>
            <Text style={{color: '#CF6679', fontSize: 18}}>🗑️ 刪除紀錄</Text>
          </TouchableOpacity>

        </View>      
      </TouchableOpacity>
    </Modal>

    </View>
  );
};

export default HistoryView; 


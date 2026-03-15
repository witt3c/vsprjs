import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Keyboard } from 'react-native';
import { styles } from './GlobalStyles';

const ClientManager = ({ 
  clients, saveClientsData, setCurrentPage, fromPage, previousPage, showDarkAlert, showToast }) => {
    // 1. 初始化狀態新增 companyName
    const [newClient, setNewClient] = useState({ 
      name: '', phone: '', companyName: '', address: '', taxId: '' 
    });
    const [editingId, setEditingId] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const handleSave = () => {
  if (!newClient.name.trim()) 
    return showDarkAlert("無效儲存", "請輸入客戶名稱", null, false);
  
  if (editingId) { 
    // 【編輯模式】不限制筆數
    const updated = clients.map(c => c.id === editingId ? { ...newClient, id: editingId } : c);
    saveClientsData(updated);
    setEditingId(null);
    showToast("✅ 客戶資料已更新");
  } 
  else {
    // 【新增模式】
    if (clients.length >= 20) {
      return showDarkAlert(
        "達到免費版上限", 
        "免費版最多儲存 20 位客戶。\n\n目前儲存空間已滿，建議刪除舊客戶或升級專業版以解除限制。", 
        () => setCurrentPage('upgradePro'),
        true,
        "了解專業版",
        "先不用"
      );
    }

    // 建立新陣列以取得最新長度
    const updatedClients = [...clients, { ...newClient, id: Date.now().toString() }];
    saveClientsData(updatedClients);
    
    // 儲存後的狀態判斷
    const currentCount = updatedClients.length;
    if (currentCount >= 20) {
      showDarkAlert(
        "已達免費版上限",
        `這已經是您的第 20 位客戶。\n\n目前客戶額度已滿，若需繼續新增，請考慮整理名單或升級。`,
        () => setCurrentPage('upgradePro'),
        true,
        "了解專業版",
        "知道了"
      );
    } else if (currentCount >= 18) {
      showToast(`✅ 已新增客戶 (目前：${currentCount}/20，快滿了)`);
    } else {
      showToast("✅ 客戶資料已新增");
    }
  }

  // 重設狀態
  setNewClient({ name: '', phone: '', companyName: '', address: '', taxId: '' });
  Keyboard.dismiss();
};

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.pageTitle}>{editingId ? "修改客戶資料" : "客戶資料管理"}</Text>
  
  {!editingId && (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ 
        fontSize: 12, 
        fontWeight: 'bold',
        color: clients.length >= 20 ? '#CF6679' : (clients.length >= 18 ? '#FFAB40' : '#888') 
      }}>
        已建立：{clients.length} / 20 位
      </Text>
      {clients.length >= 20 ? (
        <Text style={{ fontSize: 10, color: '#CF6679', fontWeight: 'bold' }}>⚠️ 已額滿</Text>
      ) : clients.length >= 18 ? (
        <Text style={{ fontSize: 10, color: '#FFAB40' }}>快額滿了</Text>
      ) : null}
    </View>
  )}
</View>

      <View style={[styles.addMaterialBox, editingId && { borderColor: '#BB86FC', borderLeftWidth: 4 }]}>
        <TextInput style={styles.input} placeholder="客戶名稱" 
          value={newClient.name} 
          onChangeText={v => setNewClient({...newClient, name: v})} 
          placeholderTextColor="#666" 
        />
        <TextInput style={styles.input} placeholder="電話" 
          keyboardType="phone-pad" 
          value={newClient.phone} 
          onChangeText={v => setNewClient({...newClient, phone: v})} 
          placeholderTextColor="#666" 
        />
        
        {/* 3. 在電話與統編之間新增公司名稱欄位 */}
        <TextInput style={styles.input} placeholder="公司名稱 (選填)" 
          value={newClient.companyName} 
          onChangeText={v => setNewClient({...newClient, companyName: v})} 
          placeholderTextColor="#666" 
        />

        <TextInput style={styles.input} placeholder="統編 (選填)" 
          keyboardType="numeric" 
          value={newClient.taxId} 
          onChangeText={v => setNewClient({...newClient, taxId: v})} 
          placeholderTextColor="#666" 
        />
        <TextInput style={styles.input} placeholder="地址" 
          value={newClient.address} 
          onChangeText={v => setNewClient({...newClient, address: v})} 
          placeholderTextColor="#666" 
        />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity 
  style={[
    styles.confirmAddBtn, 
    { 
      backgroundColor: editingId ? '#BB86FC' : (clients.length >= 20 ? '#CF6679' : '#4CAF50'), 
      flex: 0.7
    }
  ]} 
  onPress={handleSave}
> 
  <Text style={{fontWeight:'bold', color: editingId || clients.length >= 20 ? '#000' : '#FFF'}}>
    {editingId ? "儲存修改" : (clients.length >= 20 ? "客戶額滿" : "新增客戶資料")}
  </Text>
</TouchableOpacity>
          
          {editingId && (
            <TouchableOpacity 
              style={[styles.confirmAddBtn, {backgroundColor: '#333', flex: 0.25}]} 
              onPress={() => {
                setEditingId(null); 
                setNewClient({ name: '', phone: '', companyName: '', address: '', taxId: '' });
              }}
            >
              <Text style={{color: '#FFF'}}>取消</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Text style={styles.hintText}>💡 長按項目可進行「編輯」或「刪除」</Text>

      <FlatList data={clients} 
        keyExtractor={item => item.id.toString()} 
        renderItem={({item}) => (
          <TouchableOpacity 
            style={[styles.materialItemCard, editingId === item.id && {opacity: 0.5}]} 
            onLongPress={() => {setSelectedClient(item); setMenuVisible(true);}} 
            delayLongPress={300}
          >
            <View style={{flex: 1}}>
              <Text style={styles.matTitle}>{item.name} - {item.phone}</Text>

              {/* 4. 下方清單顯示公司名稱，樣式與統編一致 */}
              {item.companyName ? 
                <Text style={styles.clientSubDetail}>🏢 公司：{item.companyName}</Text>
              : null}

              {item.taxId ? 
                <Text style={styles.clientSubDetail}>🧾 統編：{item.taxId}</Text>
              : null}

              <Text style={styles.clientSubDetail}>📍 地址：{item.address || '未填寫'}</Text>   
            </View>
          </TouchableOpacity>
        )} 
      />
          
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.contextMenu}>
            <Text style={styles.menuHeader}>對 {selectedClient?.name} 進行操作</Text>
            
              <TouchableOpacity style={styles.menuOption} 
                onPress={() => {
                  setEditingId(selectedClient.id); 
                  // 5. 編輯時會自動帶入 companyName
                  setNewClient({ ...selectedClient }); 
                  setMenuVisible(false);
                }}
              >
                <Text style={{color: '#BB86FC', fontSize: 18}}>✏️ 編輯資料</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOption} 
                onPress={() => {
                  setMenuVisible(false);
                  const idToDelete = selectedClient.id;
                  const nameToDelete = selectedClient.name;
                  setTimeout(() => {
                    showDarkAlert("確認刪除", `確定要刪除客戶 ${nameToDelete} 嗎？`, () => {
                      const updatedClients = clients.filter(c => c.id !== idToDelete);
                      saveClientsData(updatedClients);
                      showToast(`🗑️ 已刪除客戶：${nameToDelete}`);
                    }, true, "確認刪除", "保留客戶");
                  }, 100);
                }}
              >
                <Text style={{color: '#CF6679', fontSize: 18}}>🗑️ 刪除客戶</Text>
              </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity style={styles.backBtn} 
        onPress={() => setCurrentPage(previousPage || 'home')}>
        <Text style={{color:'#FFF'}}>{previousPage === 'quote' ? '返回報價單' : '返回主頁'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClientManager;
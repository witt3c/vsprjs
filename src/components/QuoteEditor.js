import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Keyboard, Modal, FlatList
} from 'react-native';
import { styles } from './GlobalStyles';

const QuoteEditor = ({ 
  clients, materials, history, saveHistoryData, companyInfo, 
  editingHistoryId, setEditingHistoryId, navigateTo,
  initialClientName, initialItems, 
  setCurrentPage, fromPage, showDarkAlert, showToast,
  generatePDF // 建議從 App.js 傳進來，或是在這裡重寫
}) => {
  // 內部狀態管理
  const [clientName, setClientName] = useState(initialClientName || '');
  const [items, setItems] = useState(initialItems || [{ id: Date.now(), name: '', price: '', qty: '1', unit: '式' }]);
  const [isSaved, setIsSaved] = useState(false);
  
  // Modal 控制狀態 (原本在 App.js)
  const [matModalVisible, setMatModalVisible] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [isMenuScrolling, setIsMenuScrolling] = useState(true);

  // 處理搜尋文字高亮變紅的函數
  const renderHighlightedName = (name, query) => {
    if (!query.trim()) return <Text style={{ color: '#FFF', fontSize: 16 }}>{name}</Text>;
    
    // 使用正則表達式拆分，'gi' 代表不區分大小寫且全域搜尋
    const parts = name.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Text style={{ color: '#FFF', fontSize: 16 }}>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <Text key={i} style={{ color: '#FF5252', fontWeight: 'bold' }}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  // 過濾出包含輸入文字的客戶 (排除完全吻合的情況，避免選好後選單不消失)
const filteredClients = (clientName.trim() === '' || clients.some(c => c.name === clientName))
  ? [] 
  : clients.filter(c => 
      c.name.includes(clientName) || 
      (c.companyName && c.companyName.includes(clientName)) // 👈 關鍵：增加公司名稱判斷
    ).slice(0, 10);

  const calculateTotal = () => items.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty) || 0), 0);

  const hasQuoteData = useCallback(() => {
    return items.some(item => item.name.trim() !== '' || item.price.trim() !== '');
  }, [items]);

  const handleAutoSave = () => {
    if (isSaved) return true;
    if (!clientName.trim()) {
      showDarkAlert("提示", "請輸入客戶名稱再存檔", null, false);
      return false;
    }
    const currentClient = clients.find(c => clientName.includes(c.name));
    const currentTime = new Date().toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false 
    });

    if (editingHistoryId) {
      // 【修改模式】直接更新
      const updatedHistory = history.map(h => h.id === editingHistoryId ? {
        ...h, clientName, items, total: calculateTotal(), date: currentTime + " (已修改)" 
      } : h);
      saveHistoryData(updatedHistory);
      showToast("✅ 紀錄已更新");
    } else {
      // 【新建模式】
      // 1. 如果進來前就已經 20 筆，直接擋掉
      if (history.length >= 20) {
        showDarkAlert(
          "儲存失敗", 
          "免費版歷史紀錄上限為 20 筆。\n\n建議刪除舊紀錄，或升級專業版以解除限制。", 
          () => setCurrentPage('upgradePro'), 
          true,
          "了解專業版",
          "先不用"
        );
        return false;
      }

      const newId = Date.now().toString();
      const newRecord = { 
        id: newId, date: currentTime, clientName, 
        clientAddress: currentClient?.address || "未設定地址",
        items, total: calculateTotal() 
      };

      // 2. 執行儲存
      const updatedHistory = [newRecord, ...history];
      saveHistoryData(updatedHistory);
      setEditingHistoryId(newId); 
      
      // 3. 儲存後的提醒邏輯
      const currentCount = updatedHistory.length;
      if (currentCount >= 20) {
        // 剛好滿 20 筆時，彈出大視窗強烈提醒
        showDarkAlert(
          "已達免費版上限",
          `這已經是您的第 20 筆報價單。\n\n目前儲存空間已滿，若需繼續新增，請刪除舊紀錄或升級專業版。`,
          () => setCurrentPage('upgradePro'),
          true,
          "了解專業版",
          "知道了"
        );
      } else if (currentCount >= 18) {
        // 18 或 19 筆時，用 Toast 提醒
        showToast(`✅ 已自動存檔 (目前：${currentCount}/20，快滿了)`);
      } else {
        // 一般存檔
        showToast("✅ 資料已自動存檔");
      }
    }
    setIsSaved(true);
    return true;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled" scrollEnabled={isMenuScrolling}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.pageTitle}>{editingHistoryId ? "修改報價單" : "新建報價單"}</Text>
  
  {!editingHistoryId && (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ 
        fontSize: 12, 
        fontWeight: 'bold',
        // 根據數量切換顏色：滿了紅色、快滿橘色、平常灰色
        color: history.length >= 20 ? '#CF6679' : (history.length >= 18 ? '#FFAB40' : '#888') 
      }}>
        已建立：{history.length} / 20 筆
      </Text>
      
      {/* 根據數量顯示不同狀態文字 */}
      {history.length >= 20 ? (
        <Text style={{ fontSize: 10, color: '#CF6679', fontWeight: 'bold' }}>⚠️ 已額滿</Text>
      ) : history.length >= 18 ? (
        <Text style={{ fontSize: 10, color: '#FFAB40' }}>快額滿了</Text>
      ) : null}
    </View>
  )}
</View>

        {/* 客戶選擇區 */}
        {/* 客戶選擇區 (包含浮動搜尋) */}
        <View style={{  marginBottom: 15 }}>{ /* zIndex: 999, */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]} 
              placeholder="輸入客戶名稱關鍵字..." 
              value={clientName} 
              onChangeText={v => { setClientName(v); setIsSaved(false); }}
              placeholderTextColor="#666" 
            />
            <TouchableOpacity 
              style={{ backgroundColor: '#4CAF50', marginLeft: 10, padding: 12, borderRadius: 8 }} 
              onPress={() => { Keyboard.dismiss(); setClientModalVisible(true); }}>
              <Text style={{ color: '#FFF' }}>完整名單</Text>
            </TouchableOpacity>
          </View>
        </View>
          
{filteredClients.length > 0 && (
  <View style={{
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    maxHeight: 250, 
    elevation: 10,
    zIndex: 9999,
  }}>
      <FlatList
          data={filteredClients}
          keyExtractor={item => item.id.toString()}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#383838',
              }}
              onPress={() => {
            // --- 關鍵修改：判斷是否有公司名稱 ---
            const displayName = item.companyName 
              ? `${item.name} - ${item.companyName}` 
              : item.name;
            
            setClientName(displayName); 
            Keyboard.dismiss();
            setIsSaved(false);
          }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                {renderHighlightedName(item.name, clientName)}
                {item.companyName && (
                  <>
                    <Text style={{ color: '#888', marginHorizontal: 4 }}>-</Text>
                    {renderHighlightedName(item.companyName, clientName)}
                  </>
                )}
              </View>
              <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                📍 {item.address || '未設定地址'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}
        

        {/* 顯示地址資訊 */}
        {clientName ? (
  <View style={{ marginBottom: 15, paddingLeft: 5 }}>
    <Text style={{ color: '#888', fontSize: 13 }}>
      📍 地址：{
        // 關鍵修正：判斷目前的輸入框文字是否「包含」客戶的名字
        clients.find(c => clientName.includes(c.name))?.address || '未設定地址...'
      }
    </Text>
  </View>
) : <View style={{ marginBottom: 15 }} />}

        {/* 工項列表 */}
        {items.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
              <Text style={{color: '#BB86FC', fontWeight: 'bold'}}>項次 ({index + 1})</Text>
              <TouchableOpacity onPress={() => {
                if(items.length > 1) {
                  setItems(items.filter(i => i.id !== item.id));
                  setIsSaved(false);
                } else {
                  showDarkAlert("提醒", "至少需保留一個工項", null, false);
                }
              }}>
                <Text style={{color: '#CF6679', fontSize: 12}}>移除</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.pickerTrigger} 
              onPress={() => { 
                Keyboard.dismiss();
                setActiveItemId(item.id); 
                setMatModalVisible(true); 
              }}
            >
              <Text style={{ color: item.name ? '#FFF' : '#888' }}>{item.name || "點擊選取材料..."}</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1, marginRight: 5 }]} 
                placeholder="單價" keyboardType="numeric" value={item.price} 
                onChangeText={v => {
                  setItems(items.map(i => i.id === item.id ? {...i, price: v} : i));
                  setIsSaved(false);
                }} 
              />
              <TextInput 
                style={[styles.input, { flex: 0.4, marginRight: 5 }]} 
                placeholder="量" keyboardType="numeric" value={item.qty} 
                onChangeText={v => {
                  setItems(items.map(i => i.id === item.id ? {...i, qty: v} : i));
                  setIsSaved(false);
                }} 
              />
              <TextInput 
                style={[styles.input, { flex: 0.4 }]} 
                placeholder="位" value={item.unit} 
                onChangeText={v => {
                  setItems(items.map(i => i.id === item.id ? {...i, unit: v} : i));
                  setIsSaved(false);
                }} 
              />
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => {
            setItems([...items, { id: Date.now(), name: '', price: '', qty: '1', unit: '式' }]);
            setIsSaved(false);
          }}
        >
          <Text style={{color:'#BB86FC'}}>+ 新增工項</Text>
        </TouchableOpacity>

        {/* 總計區 */}
        <View style={{ backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#03DAC6', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#888' }}>工項總計：</Text>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{items.length} 項</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ color: '#888' }}>未稅總計：</Text>
            <Text style={{ color: '#FFF' }}>NT$ {calculateTotal().toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ color: '#888' }}>營業稅 (5%)：</Text>
            <Text style={{ color: '#CF6679' }}>NT$ {Math.round(calculateTotal() * 0.05).toLocaleString()}</Text>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#333', marginTop: 5, paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#888', alignSelf: 'center' }}>含稅總額 (5%)：</Text>
          <Text style={{ color: '#FFAB40', fontSize: 20, fontWeight: 'bold' }}>NT$ {Math.round(calculateTotal() * 1.05).toLocaleString()}</Text>
          </View>
        </View>


        
        <View style={styles.actionRow}>
          <TouchableOpacity 
  style={[
    styles.actionBtn, 
    { 
      // 邏輯：已存檔用灰色，未存檔但額滿用紅色，正常用紫色
      backgroundColor: isSaved ? '#555' : (!editingHistoryId && history.length >= 20 ? '#CF6679' : '#3700B3') 
    }
  ]} 
  onPress={() => { 
    if (isSaved) return showToast("ℹ️ 內容無變動"); 
    handleAutoSave(); 
  }}
>
  <Text style={{ color: isSaved ? '#AAA' : '#FFF' }}>
    {isSaved ? "已存檔" : (!editingHistoryId && history.length >= 20 ? "儲存空間已滿" : "儲存紀錄")}
  </Text>
</TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor:'#03DAC6'}]} 
            onPress={async () => {
              if(handleAutoSave()) {
                await generatePDF(clientName, items, calculateTotal(), companyInfo, clients, showDarkAlert);
              }
            }}
          >
            <Text style={{color:'#000'}}>產生 PDF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => {
            if (hasQuoteData() && !isSaved) {
              showDarkAlert("提醒", "報價單尚未存檔，確定要離開嗎？", () => setCurrentPage(fromPage || 'home'));
            } else {
              setCurrentPage(fromPage || 'home');
            }
          }}
        >
          <Text style={{color:'#FFF'}}>取消並返回</Text>
        </TouchableOpacity>

        {/* ---  --- */}
        {/* 材料選擇 Modal */}
        <Modal visible={matModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>選擇材料</Text>
              <TouchableOpacity style={styles.quickAddBtn} 
                onPress={() => {
                  setMatModalVisible(false); 
                  navigateTo('materials'); 
                }}
              >
                <Text style={{color: '#FFAB40', fontWeight: 'bold'}}>+ 前往材料庫 (管理材料)</Text>
              </TouchableOpacity>
              <FlatList 
                data={materials} 
                keyExtractor={item => item.id.toString()} 
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.matOption} onPress={() => {
                    setItems(items.map(i => i.id === activeItemId ? { ...i, name: item.name, price: item.price, unit: item.unit || '式' } : i));
                    setIsSaved(false);
                    setMatModalVisible(false);
                  }}>
                    <Text style={{color:'#FFF'}}>{item.name}</Text>
                    <Text style={{color:'#03DAC6'}}>${item.price}</Text>
                  </TouchableOpacity>
                )} 
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setMatModalVisible(false)}>
                <Text style={{color:'#FFF'}}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 客戶選擇 Modal */}
        <Modal visible={clientModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>選擇客戶</Text>
              <TouchableOpacity style={styles.quickAddBtn} 
                onPress={() => { 
                  setClientModalVisible(false); 
                  navigateTo('clients'); 
                }}
              >
                <Text style={{color: '#BB86FC', fontWeight: 'bold'}}>+ 前往客戶管理 (管理客戶)</Text>
              </TouchableOpacity>
              <FlatList 
                data={clients} 
                keyExtractor={item => item.id.toString()} 
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.matOption} onPress={() => {
                    setClientName(item.name);
                    setClientModalVisible(false);
                    setIsSaved(false);
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{color:'#FFF', fontSize: 16}}>{item.name} - {item.phone}</Text>
                      <Text style={{color:'#888', fontSize: 12, marginTop: 4}} numberOfLines={1}>📍 {item.address || '未設定地址'}</Text>
                    </View>
                    <Text style={{color:'#4CAF50', marginLeft: 10}}>選取</Text>
                  </TouchableOpacity>
                )} 
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setClientModalVisible(false)}>
                <Text style={{color:'#FFF'}}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuoteEditor;
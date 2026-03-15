import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Keyboard } from 'react-native';
import { styles } from './GlobalStyles';

const MaterialManager = ({ materials, saveMaterialsData, setCurrentPage, previousPage, showDarkAlert, showToast }) => {
  const [newMat, setNewMat] = useState({ name: '', price: '', unit: '式' });
  const [editingMatId, setEditingMatId] = useState(null);
  const [matMenuVisible, setMatMenuVisible] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);

  const handleSaveMaterial = () => { 
  const trimmedName = newMat.name.trim();  
  if (!trimmedName) { 
    showDarkAlert("提示", "請輸入材料名稱", null, false);
    return;
  } 

  if (editingMatId) {
    // 【編輯模式】
    const updated = materials.map(m => m.id === editingMatId ? { ...newMat, id: editingMatId } : m);
    saveMaterialsData(updated);
    setEditingMatId(null);
    showToast("✅ 材料資料已更新");
  } else {
    // 【新增模式】
    if (materials.length >= 50) {
      return showDarkAlert(
        "材料庫已滿", 
        "免費版材料上限為 50 筆。\n\n目前儲存空間已滿，建議刪除不常用的材料，或升級專業版以解鎖無限空間。", 
        () => setCurrentPage('upgradePro'),
        true,
        "了解專業版",
        "先不用"
      );
    }

    const updatedMaterials = [...materials, { ...newMat, id: Date.now().toString() }];
    saveMaterialsData(updatedMaterials);
    
    // 儲存後的提醒邏輯
    const currentCount = updatedMaterials.length;
    if (currentCount >= 50) {
      showDarkAlert(
        "已達免費版上限",
        `這已經是您的第 50 筆材料。\n\n目前材料庫位子已滿，若需繼續新增，請升級專業版或整理舊資料。`,
        () => setCurrentPage('upgradePro'),
        true,
        "了解專業版",
        "知道了"
      );
    } else if (currentCount >= 45) {
      showToast(`✅ 材料已建檔 (目前：${currentCount}/50，快滿了)`);
    } else {
      showToast("✅ 材料資料已建檔");
    }
  }
  
  setNewMat({ name: '', price: '', unit: '式' });
  Keyboard.dismiss();
};

  

  return (
    <View style={styles.container}>
      {/* 修改後的標題與計數區 */}
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
  <Text style={styles.pageTitle}>{editingMatId ? "修改材料資訊" : "材料庫管理"}</Text>
  
  {!editingMatId && (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ 
        fontSize: 12, 
        fontWeight: 'bold',
        // 50筆紅色，45筆橘色，其餘灰色
        color: materials.length >= 50 ? '#CF6679' : (materials.length >= 45 ? '#FFAB40' : '#888') 
      }}>
        已建立：{materials.length} / 50 筆
      </Text>
      {materials.length >= 50 ? (
        <Text style={{ fontSize: 10, color: '#CF6679', fontWeight: 'bold' }}>⚠️ 材料庫已滿</Text>
      ) : materials.length >= 45 ? (
        <Text style={{ fontSize: 10, color: '#FFAB40' }}>快額滿了</Text>
      ) : null}
    </View>
  )}
</View>
      
      <View style={[styles.addMaterialBox, editingMatId && {borderColor: '#FFAB40', borderLeftWidth: 4}]}>
        <TextInput style={styles.input} placeholder="名稱" value={newMat.name} onChangeText={v => 
          setNewMat({...newMat, name: v})} placeholderTextColor="#666" />

      <View style={{ flexDirection: 'row', marginBottom: 10, width: '100%' }}>
        <TextInput 
          style={[styles.input, { flex: 2, marginRight: 8, marginBottom: 0 }]}
          placeholder="單價" 
          keyboardType="numeric" 
          value={newMat.price} 
          onChangeText={v => setNewMat({...newMat, price: v})} 
          placeholderTextColor="#666" 
        />
        <TextInput 
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="單位" 
          value={newMat.unit} 
          onChangeText={v => setNewMat({...newMat, unit: v})} 
          placeholderTextColor="#666" 
        />
      </View>
    
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity 
  style={[
    styles.confirmAddBtn, 
    { 
      backgroundColor: editingMatId ? '#FFAB40' : (materials.length >= 50 ? '#CF6679' : '#03DAC6'), 
      flex: 0.7 
    }
  ]} 
  onPress={handleSaveMaterial}
>
  <Text style={{ fontWeight: 'bold', color: '#000' }}>
    {editingMatId ? "儲存修改" : (materials.length >= 50 ? "材料庫已滿" : "新增材料")}
  </Text>
</TouchableOpacity>

        {editingMatId && (
          <TouchableOpacity style={[styles.confirmAddBtn, {backgroundColor: '#333', flex: 0.25}]} onPress={() => 
            {setEditingMatId(null); setNewMat({ name: '', price: '', unit: '式' });}}>
            <Text style={{color: '#FFF'}}>取消</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
        
    <Text style={styles.hintText}>💡 長按項目可進行「編輯」或「刪除」</Text>
        
        <FlatList data={materials} keyExtractor={item => item.id} renderItem={({item}) => (
            <TouchableOpacity style={[styles.materialItemCard, editingMatId === item.id && {opacity: 0.5}]} onLongPress={() => {setSelectedMat(item); setMatMenuVisible(true);}} delayLongPress={300}>
              <View>
                <Text style={styles.matTitle}>{item.name}</Text>
                <Text style={styles.matDetail}>NT$ {item.price} / {item.unit || '式'}</Text>
              </View>
            </TouchableOpacity>)} 
        />

        <Modal visible={matMenuVisible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setMatMenuVisible(false)}>
                <View style={styles.contextMenu}>
                  <Text style={styles.menuHeader}>對 {selectedMat?.name} 進行操作</Text>
                    <TouchableOpacity style={styles.menuOption} onPress={() => 
                      {setEditingMatId(selectedMat.id); setNewMat({ ...selectedMat, unit: selectedMat.unit || '式' }); setMatMenuVisible(false);}}>
                      <Text style={{color: '#FFAB40', fontSize: 18}}>✏️ 編輯材料</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={() => 
                      {setMatMenuVisible(false);showDarkAlert("確認刪除", `確定要刪除材料 ${selectedMat.name} 嗎？`, () => 
                      {saveMaterialsData(materials.filter(m => m.id !== selectedMat.id));
                      showToast(`🗑️ 已刪除材料：${selectedMat.name}`);},
                      true,"確認刪除","保留材料");}}>
                      <Text style={{color: '#CF6679', fontSize: 18}}>🗑️ 刪除材料</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
              
        <TouchableOpacity style={styles.backBtn} onPress={() =>{ Keyboard.dismiss(); setCurrentPage(previousPage || 'home')}}>
          <Text style={{color:'#FFF'}}>{previousPage === 'quote' ? '返回報價單' : '返回主頁'}</Text>
        </TouchableOpacity>
    </View>
  );
};

export default MaterialManager; 
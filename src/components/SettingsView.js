import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard} from 'react-native';
import { styles } from './GlobalStyles';

const SettingsView = ({ companyInfo, saveCompanyData, setCurrentPage }) => {
  const [isInitial, setIsInitial] = useState(true);
  // 新增：分頁狀態，預設為 'basic'
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>公司資訊設定</Text>
      {/* 分頁切換列：使用簡單的樣式，不影響你原本的 container 內部佈局 */}
      <View style={{ 
    flexDirection: 'row', 
    backgroundColor: '#1E1E1E', // 稍微深一點的背景
    borderRadius: 8,           // 圓角讓它看起來像個控制切換器
    marginBottom: 20, 
    overflow: 'hidden' 
  }}>
    <TouchableOpacity 
      style={{ 
        flex: 1, 
        padding: 12, 
        alignItems: 'center', 
        backgroundColor: activeTab === 'basic' ? '#BB86FC' : 'transparent' // 選中時背景變色
      }}
      onPress={() => setActiveTab('basic')}
    >
      <Text style={{ color: activeTab === 'basic' ? '#000' : '#888', fontWeight: 'bold' }}>公司資訊</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={{ 
        flex: 1, 
        padding: 12, 
        alignItems: 'center', 
        backgroundColor: activeTab === 'bank' ? '#BB86FC' : 'transparent'
      }}
      onPress={() => setActiveTab('bank')}
    >
      <Text style={{ color: activeTab === 'bank' ? '#000' : '#888', fontWeight: 'bold' }}>匯款資訊</Text>
    </TouchableOpacity>
  </View>

      
        
        {activeTab === 'basic' ? (
          /* --- 原本的公司資訊內容 (完全保留你的樣式) --- */
          <View style={styles.settingsCard}>
            <Text style={styles.label}>公司名稱</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.name || ''}
              onChangeText={(v) => saveCompanyData({ ...companyInfo, name: v })}
            />

            <Text style={styles.label}>地址</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.address || ''}
              onChangeText={(v) => saveCompanyData({ ...companyInfo, address: v })}
            />

            <Text style={styles.label}>電話</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.phone || ''}
              keyboardType="phone-pad"
              onChangeText={(v) => saveCompanyData({ ...companyInfo, phone: v })}
            />

            <Text style={styles.label}>統編</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.taxId || ''}
              keyboardType="numeric"
              onChangeText={(v) => saveCompanyData({ ...companyInfo, taxId: v })}
            />

            <Text style={styles.label}>報價備註</Text>
            <View style={{
              borderWidth: 1,
              borderColor: '#333',
              borderRadius: 8,
              backgroundColor: '#1E1E1E',
              marginTop: 5,
              overflow: 'hidden',
            }}>
              <TextInput style={[styles.input,{
                  height: 150,
                  backgroundColor: 'transparent',
                  textAlignVertical: 'top',
                  paddingTop: 12,
                  paddingHorizontal: 10,
                  marginBottom: 0,
                  borderWidth: 0,
                },]}
                value={companyInfo.note || ''}  
                multiline={true}
                numberOfLines={6}
                scrollEnabled={true}
                selection={isInitial ? { start: 0, end: 0 } : undefined}
                onFocus={() => setIsInitial(false)}
                onStartShouldSetResponderCapture={() => true}
                onChangeText={(v) => saveCompanyData({ ...companyInfo, note: v })}
                placeholder="請輸入報價注意事項..."
                placeholderTextColor="#666"
                indicatorStyle="white"
              />
            </View>
          </View>
        ) : (
          /* --- 新增的匯款資訊內容 (沿用你的 styles 確保風格統一) --- */
          <View style={styles.settingsCard}>
            <Text style={styles.label}>銀行代號</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：007"
              placeholderTextColor="#666"
              value={companyInfo.bankCode || ''}
              keyboardType="numeric"
              onChangeText={(v) => saveCompanyData({ ...companyInfo, bankCode: v })}
            />

            <Text style={styles.label}>銀行名稱</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：第一銀行"
              placeholderTextColor="#666"
              value={companyInfo.bankName || ''}
              onChangeText={(v) => saveCompanyData({ ...companyInfo, bankName: v })}
            />

            <Text style={styles.label}>分行名稱</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：某某分行"
              placeholderTextColor="#666"
              value={companyInfo.bankBranch || ''}
              onChangeText={(v) => saveCompanyData({ ...companyInfo, bankBranch: v })}
            />

            <Text style={styles.label}>銀行帳戶 (帳號)</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.bankAccount || ''}
              keyboardType="numeric"
              onChangeText={(v) => saveCompanyData({ ...companyInfo, bankAccount: v })}
            />

            <Text style={styles.label}>帳戶名稱 (戶名)</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.accountName || ''}
              onChangeText={(v) => saveCompanyData({ ...companyInfo, accountName: v })}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.backBtn, { marginTop: 20, marginBottom: 30 }]}
          onPress={() => {
            Keyboard.dismiss();
            setCurrentPage('home');
          }}>
          <Text style={{ color: '#FFF' }}>完成並返回</Text>
        </TouchableOpacity>
      
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsView;
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './GlobalStyles';

const MenuBtn = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.menuCard, { borderColor: color }]} onPress={onPress}>
    <Text style={{ fontSize: 32 }}>{icon}</Text>
    <Text style={{ color: '#FFF', marginTop: 8, fontWeight: 'bold' }}>{title}</Text>
  </TouchableOpacity>
);

const HomeView = ({ companyInfo, setEditingHistoryId, setClientName, setItems, navigateTo, openLegal, APP_VERSION }) => {

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>工程報價助手</Text>
          <Text style={styles.subTitle}>{companyInfo.name}</Text>
        </View>

        <View style={styles.grid}>
          <MenuBtn title="建立報價" icon="📝" color="#BB86FC" 
            onPress={() => { 
              setEditingHistoryId(null); 
              setClientName(''); 
              setItems([{ id: Date.now(), name: '', price: '', qty: '1', unit: '式' }]); 
              navigateTo('quote'); 
            }} 
          />
          <MenuBtn title="客戶管理" icon="👥" color="#4CAF50" onPress={() => navigateTo('clients')} />
          <MenuBtn title="歷史紀錄" icon="📜" color="#03DAC6" onPress={() => navigateTo('history')} />
          <MenuBtn title="材料庫" icon="🛠️" color="#FFAB40" onPress={() => navigateTo('materials')} />
          <MenuBtn title="公司資料" icon="🏢" color="#CF6679" onPress={() => navigateTo('settings')} />
          <MenuBtn title="系統設定" icon="⚙️" color="#607D8B" onPress={() => navigateTo('system_settings')} />
        </View>
      </View>

      <View style={styles.versionFooter}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <TouchableOpacity onPress={() => openLegal('tos')}>
            <Text style={{ color: '#BB86FC' }}>服務條款</Text>
          </TouchableOpacity>
          <Text style={{ color: '#666', marginHorizontal: 10 }}>|</Text>
          <TouchableOpacity onPress={() => openLegal('privacy')}>
            <Text style={{ color: '#BB86FC' }}>隱私政策</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.versionText}>版本號：{APP_VERSION}</Text>
      </View>
    </View>
  );

};

export default HomeView;
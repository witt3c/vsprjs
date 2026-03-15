import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking, StyleSheet } from 'react-native';
import { styles as globalStyles } from './GlobalStyles';

const UpgradeProView = ({ setCurrentPage }) => {
  const purchaseUrl = "https://portaly.cc/witt3c";

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.pageTitle}>專業版升級</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. 圖片介紹區 (建議放 16:9 的宣傳圖) */}
        <View style={localStyles.imagePlaceholder}>
          <Text style={{ color: '#666' }}>[ 專業版預覽圖 ]</Text>
          {/* 如果有圖檔，請改用下面這行 */}
          {/* <Image source={require('./assets/pro_preview.png')} style={localStyles.bannerImage} /> */}
        </View>

        {/* 2. 文字介紹區 */}
        <View style={localStyles.contentBox}>
          <Text style={localStyles.featureTitle}>為什麼選擇專業版？</Text>
          
          <FeatureItem icon="☁️" title="雲端同步與備份" desc="資料自動上傳雲端，換手機也不怕資料遺失。" />
          <FeatureItem icon="🎨" title="自定義報價單 Logo" desc="在 PDF 頂部加入您的公司標誌，提升專業形象。" />
          <FeatureItem icon="📊" title="數據統計報表" desc="自動計算月營收、熱門材料排行，管理更省力。" />
          <FeatureItem icon="♾️" title="無限制客戶與項目" desc="解鎖免費版限制，記錄無限量的客戶資料。" />
        </View>

        {/* 3. 價格提示 */}
        <View style={localStyles.priceSection}>
          <Text style={{ color: '#888', fontSize: 14 }}>限時特價中</Text>
          <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold' }}>NT$ 990 <Text style={{ fontSize: 16, color: '#666', fontWeight: 'normal' }}>/ 終身授權</Text></Text>
        </View>

        {/* 4. 操作按鈕 */}
        <TouchableOpacity 
          style={localStyles.buyBtn} 
          onPress={() => Linking.openURL(purchaseUrl)}
        >
          <Text style={localStyles.buyBtnText}>立即前往購買</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={localStyles.backBtn} 
          onPress={() => setCurrentPage('home')} // 或跳回 settings
        >
          <Text style={{ color: '#888' }}>先不要，返回主頁</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// 內部小組件
const FeatureItem = ({ icon, title, desc }) => (
  <View style={localStyles.featureRow}>
    <Text style={{ fontSize: 24, marginRight: 15 }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
      <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{desc}</Text>
    </View>
  </View>
);

const localStyles = StyleSheet.create({
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333'
  },
  contentBox: {
    marginBottom: 30
  },
  featureTitle: {
    color: '#BB86FC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center'
  },
  priceSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 20
  },
  buyBtn: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  buyBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
  },
  backBtn: {
    padding: 15,
    alignItems: 'center'
  }
});

export default UpgradeProView;
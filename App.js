import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  BackHandler,
  Animated,
  View,
  Text,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// --- 樣式與組件引入 ---
import { styles } from './src/components/GlobalStyles';
import HomeView from './src/components/HomeView';
import QuoteEditor from './src/components/QuoteEditor';
import ClientManager from './src/components/ClientManager';
import MaterialManager from './src/components/MaterialManager';
import HistoryView from './src/components/HistoryView';
import SettingsView from './src/components/SettingsView';
import SystemSettingsView from './src/components/SystemSettingsView';
import LegalModal from './src/components/LegalModal';
import GlobalUI from './src/components/GlobalUI';
import UpgradeProView from './src/components/UpgradeProView';

// --- 工具類引入 ---
import * as storage from './src/utils/storage';
import { generatePDF as pdfTool } from './src/utils/pdfGenerator';

export default function App() {
  // 1. 基本設定與版本
  const APP_VERSION = 'v2.2.4';

  // 2. 資料狀態 (Data States)
  const [companyInfo, setCompanyInfo] = useState({
    name: '專業工程行報價助手',
    address: '', phone: '', taxId: '', note: '1. 報價有效期30天。\n2. 確認施作請預付30%訂金。',
    bankCode: '', bankName: '', bankBranch: '', bankAccount: '', accountName: '',
  });
  const [materials, setMaterials] = useState([]);
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [fromPage, setFromPage] = useState('home');
  const [previousPage, setPreviousPage] = useState('home');
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState([{ id: Date.now(), name: '', price: '', qty: '1', unit: '式' }]);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [legalConfig, setLegalConfig] = useState({ visible: false, type: 'tos' });
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // --------------------------------------------------------
  // 核心功能：資料持久化 (Persistence)
  // --------------------------------------------------------

  const loadAllData = useCallback(async () => {
    const company = await storage.loadData(storage.KEYS.COMPANY);
    if (company) setCompanyInfo(company);

    const mats = await storage.loadData(storage.KEYS.MATERIALS);
    if (mats) setMaterials(mats);

    const hist = await storage.loadData(storage.KEYS.HISTORY);
    if (hist) setHistory(hist);

    const cls = await storage.loadData(storage.KEYS.CLIENTS);
    if (cls) setClients(cls);
  }, []);

  const saveCompanyData = (info) => {
    setCompanyInfo(info);
    storage.saveData(storage.KEYS.COMPANY, info);
  };
  const saveHistoryData = (newHistory) => {
    setHistory(newHistory);
    storage.saveData(storage.KEYS.HISTORY, newHistory);
  };
  const saveClientsData = (newClients) => {
    setClients(newClients);
    storage.saveData(storage.KEYS.CLIENTS, newClients);
  };
  const saveMaterialsData = (mats) => {
    setMaterials(mats);
    storage.saveData(storage.KEYS.MATERIALS, mats);
  };

  // --------------------------------------------------------
  // 業務邏輯 (Business Logic)
  // --------------------------------------------------------

  // 導航控制
  const navigateTo = (page) => {
    if (page === 'clients' || page === 'materials')
      setPreviousPage(currentPage);
    if (currentPage === 'home' || currentPage === 'history')
      setFromPage(currentPage);
    setCurrentPage(page);
  };

  // 彈窗與通知控制
  const showDarkAlert = (
    title,
    message,
    onConfirm = null,
    showCancel = true,
    confirmText = '確定',
    cancelText = '取消'
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      onConfirm,
      showCancel,
      confirmText,
      cancelText,
    });
  };

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setToast({ visible: false, message: '' }));
    }, 2000);
  };

  const openLegal = (type) => setLegalConfig({ visible: true, type });

  // 報價運算與驗證
  const calculateTotal = () =>
    items.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty) || 0), 0);
  const hasQuoteData = useCallback(
    () =>
      items.some((item) => item.name.trim() !== '' || item.price.trim() !== ''),
    [items]
  );

  // PDF 觸發轉接
  const handleGeneratePDF = async (
    overrideClient,
    overrideItems,
    overrideTotal
  ) => {
    const currentClientName = overrideClient || clientName;
    const currentItems = overrideItems || items;
    const currentTotal =
      overrideTotal !== undefined ? overrideTotal : calculateTotal();

    await pdfTool(
      currentClientName,
      currentItems,
      currentTotal,
      companyInfo,
      clients,
      showDarkAlert
    );
  };

  // --------------------------------------------------------
  // 生命週期與監聽 (Effects)
  // --------------------------------------------------------

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const backAction = () => {
      if (currentPage === 'home') return false;

      if (currentPage === 'clients' || currentPage === 'materials') {
        setCurrentPage(previousPage || 'home');
        return true;
      }

      if (currentPage === 'quote') {
        if (hasQuoteData() && !isSaved) {
          showDarkAlert(
            '提醒',
            '報價單尚未存檔，確定要離開嗎？',
            () => {
              setCurrentPage(fromPage || 'home');
            },
            true,
            '確定離開',
            '繼續編輯'
          );
          return true;
        }
        setCurrentPage(fromPage || 'home');
        return true;
      }

      if (currentPage === 'system_settings') {
        setCurrentPage('home');
        return true;
      }

      if (currentPage === 'upgradePro') {
        setCurrentPage('system_settings');
        return true;
      }

      setCurrentPage(fromPage || 'home');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [currentPage, fromPage, previousPage, isSaved, hasQuoteData]);




  // --------------------------------------------------------
  // 渲染區塊 (Render)
  // --------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {currentPage === 'home' && (
        <HomeView companyInfo={companyInfo} setEditingHistoryId={setEditingHistoryId} setClientName={setClientName} setItems={setItems} navigateTo={navigateTo} openLegal={openLegal} APP_VERSION={APP_VERSION} />
      )}
      {currentPage === 'quote' && (
        <QuoteEditor clients={clients} materials={materials} history={history} saveHistoryData={(h)=>setHistory(h)} companyInfo={companyInfo} setCurrentPage={setCurrentPage} fromPage={fromPage} navigateTo={navigateTo} editingHistoryId={editingHistoryId} setEditingHistoryId={setEditingHistoryId} initialClientName={clientName} initialItems={items} showDarkAlert={showDarkAlert} showToast={showToast} generatePDF={handleGeneratePDF} />
      )}
      {currentPage === 'clients' && (
        <ClientManager clients={clients} saveClientsData={(c)=>setClients(c)} setCurrentPage={setCurrentPage} fromPage={fromPage} previousPage={previousPage} showDarkAlert={showDarkAlert} showToast={showToast} />
      )}
      {currentPage === 'materials' && (
        <MaterialManager materials={materials} saveMaterialsData={(m)=>setMaterials(m)} setCurrentPage={setCurrentPage} previousPage={previousPage} showDarkAlert={showDarkAlert} showToast={showToast} />
      )}
      {currentPage === 'history' && (
        <HistoryView history={history} saveHistoryData={(h)=>setHistory(h)} setCurrentPage={setCurrentPage} setEditingHistoryId={setEditingHistoryId} setClientName={setClientName} setItems={setItems} setIsSaved={setIsSaved} showDarkAlert={showDarkAlert} showToast={showToast} setFromPage={setFromPage} />
      )}
      {currentPage === 'settings' && (
        <SettingsView companyInfo={companyInfo} saveCompanyData={(i)=>setCompanyInfo(i)} setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'system_settings' && (
        <SystemSettingsView setCurrentPage={setCurrentPage} showToast={showToast} companyInfo={companyInfo} saveCompanyData={(i)=>setCompanyInfo(i)} saveHistoryData={(h)=>setHistory(h)} saveClientsData={(c)=>setClients(c)} saveMaterialsData={(m)=>setMaterials(m)} showDarkAlert={showDarkAlert} APP_VERSION={APP_VERSION} openLegal={openLegal} />
      )}
      {currentPage === 'upgradePro' && ( <UpgradeProView setCurrentPage={setCurrentPage} /> )}

      <LegalModal visible={legalConfig.visible} type={legalConfig.type} onClose={() => setLegalConfig({ ...legalConfig, visible: false })} />
      <GlobalUI 
        toast={toast} 
        toastOpacity={toastOpacity} 
        alertConfig={alertConfig} 
        setAlertConfig={setAlertConfig} 
      />

    </SafeAreaView>
  );
} 
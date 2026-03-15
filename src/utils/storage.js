import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 基礎儲存函數
 */
export const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`儲存 ${key} 失敗`, e);
    return false;
  }
};

/**
 * 基礎讀取函數
 */
export const loadData = async (key) => {
  try {
    const savedData = await AsyncStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : null;
  } catch (e) {
    console.error(`讀取 ${key} 失敗`, e);
    return null;
  }
};

// 你也可以預定義常用的 Key 避開打錯字
export const KEYS = {
  COMPANY: '@company',
  MATERIALS: '@materials',
  HISTORY: '@history',
  CLIENTS: '@clients',
};
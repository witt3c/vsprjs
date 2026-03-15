import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { styles } from './GlobalStyles';

const GlobalUI = ({ 
  toast, 
  toastOpacity, 
  alertConfig, 
  setAlertConfig 
}) => {
  return (
    <>
      {/* Toast 訊息 */}
      {toast.visible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

      {/* 全域警告彈窗 */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.contextMenu, { alignItems: 'center', padding: 25, width: '80%' }]}>
            <Text style={{ color: '#BB86FC', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              {alertConfig.title}
            </Text>
            <Text style={{ color: '#DDD', fontSize: 15, textAlign: 'center', marginBottom: 25, lineHeight: 22 }}>
              {alertConfig.message}
            </Text>
            
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
              {alertConfig.showCancel ? (
                <>
                  <TouchableOpacity 
                    style={{ flex: 1, padding: 12, alignItems: 'center' }}
                    onPress={() => {
                      const action = alertConfig.onConfirm;
                      setAlertConfig({ ...alertConfig, visible: false });
                      if (action) action();
                    }}
                  >
                    <Text style={{ color: '#CF6679', fontSize: 16 }}>{alertConfig.confirmText || '確定'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: '#BB86FC', padding: 12, borderRadius: 8, alignItems: 'center', marginLeft: 10 }}
                    onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
                  >
                    <Text style={{ color: '#121212', fontWeight: 'bold', fontSize: 16 }}>
                      {alertConfig.cancelText || '取消'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={{ flex: 1, backgroundColor: '#BB86FC', padding: 12, borderRadius: 8, alignItems: 'center' }}
                  onPress={() => {
                    setAlertConfig({ ...alertConfig, visible: false });
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                  }}
                >
                  <Text style={{ color: '#121212', fontWeight: 'bold', fontSize: 16 }}>
                    {alertConfig.confirmText || '確定'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default GlobalUI;
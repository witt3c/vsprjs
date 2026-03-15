import {StyleSheet,Platform} from 'react-native'

export const styles = StyleSheet.create({

  safeArea: { 
    flex: 1, 
    backgroundColor: '#121212', 
    paddingTop: Platform.OS === 'android' ? 25 : 10 
  },

  container: { 
    flex: 1, 
    padding: 20 
  },

  headerBox: { 
    marginVertical: 30, 
    alignItems: 'center' 
  },

  title: { 
    color: '#BB86FC', 
    fontSize: 30, 
    fontWeight: 'bold' 
  },

  subTitle: { 
    color: '#888', 
    fontSize: 16, 
    marginTop: 5 
  },

  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },

  menuCard: { 
    width: '47%', 
    aspectRatio: 1, 
    backgroundColor: '#1E1E1E', 
    borderRadius: 20, 
    borderWidth: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },

  pageTitle: { 
    color: '#BB86FC', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  
  itemCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 15 },
  input: { backgroundColor: '#2C2C2C', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10 },
  pickerTrigger: { backgroundColor: '#333', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#BB86FC' },
  row: { flexDirection: 'row' },
  addBtn: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#BB86FC', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, padding: 15, borderRadius: 10, alignItems: 'center' },
  backBtn: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  addMaterialBox: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#03DAC6' },
  confirmAddBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  materialItemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10 },
  matTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  matDetail: { color: '#03DAC6', fontSize: 13 },
  clientSubDetail: { color: '#888', fontSize: 13, marginTop: 2 },
  hintText: { color: '#888', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  settingsCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, marginBottom: 20 },
  label: { color: '#BB86FC', fontSize: 12, marginBottom: 5, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalOverlayDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  contextMenu: { backgroundColor: '#2C2C2C', width: '80%', borderRadius: 15, padding: 20 },
  menuHeader: { color: '#FFF', fontSize: 14, marginBottom: 15, textAlign: 'center', opacity: 0.6 },
  menuOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E1E1E', height: '70%', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  matOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between' },
  quickAddBtn: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#BB86FC', borderStyle: 'dashed', alignItems: 'center', marginBottom: 15 },
  closeBtn: { marginTop: 10, padding: 15, alignItems: 'center', backgroundColor: '#CF6679', borderRadius: 10 },
  versionFooter: { paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
  versionText: { color: '#555', fontSize: 12 },
  toastContainer: {
  position: 'absolute',
  bottom: 100, // 調整高度，避開底部的返回按鈕
  left: '10%',
  right: '10%',
  backgroundColor: 'rgba(50, 50, 50, 0.9)', // 深色半透明
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 25,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 5, // Android 陰影
  shadowColor: '#000', // iOS 陰影
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
toastText: {
  color: '#FFF',
  fontSize: 14,
  fontWeight: '500',
},
historyCard: {
  backgroundColor: '#1E1E1E',
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderLeftWidth: 4,
  borderLeftColor: '#BB86FC',
},
historyTitle: {
  color: '#FFF',
  fontSize: 16,
  fontWeight: 'bold',
},
});
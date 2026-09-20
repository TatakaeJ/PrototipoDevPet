import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  
  waterBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF', 
    opacity: 0.3,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  
  title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  mlText: { fontSize: 18, color: '#60A5FA', fontWeight: '700', marginTop: 5 },

  mainCounter: {
    backgroundColor: '#FFFFFF', 
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#007AFF',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginBottom: 30,
    borderWidth: 4,
    borderColor: '#DBEAFE'
  },
  
  countNumber: { fontSize: 80, fontWeight: 'bold', color: '#1E40AF' },
  label: { fontSize: 14, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' },

  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 12, 
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
    borderRadius: 30,
    width: '95%'
  },

  glassIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    elevation: 3
  },

  glassFull: { 
    backgroundColor: '#3B82F6', 
    borderWidth: 2, 
    borderColor: '#FFFFFF' 
  },
  glassEmpty: { 
    backgroundColor: '#F1F5F9',
    opacity: 0.9 
  },

  saveBtn: {
    backgroundColor: '#2563EB',
    width: '85%',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    marginBottom: 20
  },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1.5 },
});
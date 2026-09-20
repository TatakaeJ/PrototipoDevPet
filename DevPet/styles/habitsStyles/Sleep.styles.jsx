import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 30, width: '85%', elevation: 5 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1E293B', marginBottom: 20 },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, marginBottom: 12, fontSize: 16 },
  resultBox: { marginVertical: 15, alignItems: 'center', backgroundColor: '#EEF2FF', padding: 10, borderRadius: 15 },
  resultLabel: { color: '#6366F1', fontSize: 12, fontWeight: 'bold' },
  resultText: { fontSize: 24, fontWeight: 'bold', color: '#4338CA' },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  
  // Estilos para mensaje de completado
  completedContainer: { alignItems: 'center', padding: 10 },
  completedTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#10B981', marginBottom: 15 },
  completedMessage: { fontSize: 18, textAlign: 'center', color: '#1E293B', fontWeight: '600', marginBottom: 10 },
  completedSubMessage: { fontSize: 14, textAlign: 'center', color: '#64748B', lineHeight: 20, marginBottom: 20 },
  tipBox: { backgroundColor: '#F0F9FF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#0369A1', marginBottom: 5 },
  tipText: { fontSize: 13, color: '#0C4A6E', textAlign: 'center', lineHeight: 18 },
  loadingText: { fontSize: 16, color: '#64748B', textAlign: 'center', fontStyle: 'italic' }
});
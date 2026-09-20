import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: 'white' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  menuGrid: { flexDirection: 'row', gap: 15 },
  card: { flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3 },
  waterCard: { backgroundColor: '#eff6ff' },
  sleepCard: { backgroundColor: '#faf5ff' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  emoji: { fontSize: 24 },
  cardText: { fontWeight: 'bold', color: '#334155' },
  formBlock: { width: '100%', alignItems: 'center', marginVertical: 20 },
  countText: { fontSize: 40, fontWeight: 'bold', color: '#3b82f6', marginVertical: 10 },
  row: { flexDirection: 'row', gap: 20 },
  btnRound: { backgroundColor: '#3b82f6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  input: { backgroundColor: '#f1f5f9', width: '100%', padding: 15, borderRadius: 10, marginBottom: 10 },
  resultText: { fontStyle: 'italic', color: '#64748b' },
  saveBtn: { backgroundColor: '#10b981', width: '100%', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 10 }
});
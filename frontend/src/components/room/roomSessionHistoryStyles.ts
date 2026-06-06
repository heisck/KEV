import { StyleSheet } from 'react-native';

export const roomSessionHistoryStyles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  title: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  list: { flex: 1 },
  listContent: { gap: 4, paddingBottom: 46 },
  item: { gap: 5 },
  divider: { backgroundColor: 'rgba(255,255,255,0.42)', height: 1, width: '100%' },
  itemBody: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  code: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', minWidth: 60 },
  itemCopy: { flex: 1 },
  meta: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
  total: { color: 'rgba(255,255,255,0.68)', fontSize: 11, marginTop: 1 },
  fadeEdge: {
    backgroundColor: 'rgba(185, 218, 238, 0.22)',
    bottom: 0,
    height: 46,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

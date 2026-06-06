import { StyleSheet } from 'react-native';

export const roomSetupDockStyles = StyleSheet.create({
  dockWrap: {
    alignItems: 'center',
    height: 54,
    position: 'absolute',
    width: 54,
    zIndex: 5,
  },
  mainButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(244,247,251,0.86)',
    borderRadius: 27,
    elevation: 6,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: 52,
  },
  iconRail: {
    backgroundColor: 'rgba(244,247,251,0.92)',
    borderColor: 'rgba(92,158,8,0.14)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 5,
    position: 'absolute',
  },
  railButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});

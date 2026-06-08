import { StyleSheet } from 'react-native';

export const roomSetupDrawerStyles = StyleSheet.create({
  body: {
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 6,
    position: 'absolute',
    right: 0,
  },
  backButton: { left: 12, position: 'absolute', zIndex: 8 },
  container: {
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  stepLeft: {
    backgroundColor: '#F4F7FB',
    borderTopRightRadius: 16,
    left: 0,
    position: 'absolute',
    width: '24.5%',
  },
  stepLeftInner: {
    backgroundColor: '#F4F7FB',
    borderTopRightRadius: 16,
    left: '23.7%',
    position: 'absolute',
    width: '20.8%',
  },
  stepRight: {
    backgroundColor: '#F4F7FB',
    borderTopLeftRadius: 16,
    position: 'absolute',
    right: 0,
    width: '24.5%',
  },
  stepRightInner: {
    backgroundColor: '#F4F7FB',
    borderTopLeftRadius: 16,
    position: 'absolute',
    right: '23.7%',
    width: '20.8%',
  },
});

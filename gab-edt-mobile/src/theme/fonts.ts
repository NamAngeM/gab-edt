import { Platform } from 'react-native';

export const FONTS = {
  regular: Platform.select({ ios: 'Inter_400Regular', android: 'Inter_400Regular', default: 'Inter_400Regular' }),
  medium: Platform.select({ ios: 'Inter_500Medium', android: 'Inter_500Medium', default: 'Inter_500Medium' }),
  semiBold: Platform.select({ ios: 'Inter_600SemiBold', android: 'Inter_600SemiBold', default: 'Inter_600SemiBold' }),
  bold: Platform.select({ ios: 'Inter_700Bold', android: 'Inter_700Bold', default: 'Inter_700Bold' }),
  extraBold: Platform.select({ ios: 'Inter_800ExtraBold', android: 'Inter_800ExtraBold', default: 'Inter_800ExtraBold' }),
  black: Platform.select({ ios: 'Inter_900Black', android: 'Inter_900Black', default: 'Inter_900Black' }),
};

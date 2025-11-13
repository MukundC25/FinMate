import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/themeColors';

export const useThemeColors = () => {
  const { isDark } = useTheme();
  return getThemeColors(isDark);
};

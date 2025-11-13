import { ThemeColors } from './themeColors';

declare module '../constants/theme' {
  export interface TypographySizes {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  }

  export interface Typography {
    fontFamily: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    fontSize: TypographySizes;
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    fontWeight: {
      regular: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  }

  export const Typography: Typography;
  export const Colors: ThemeColors;
  export const Spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  export const BorderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    full: number;
  };
}

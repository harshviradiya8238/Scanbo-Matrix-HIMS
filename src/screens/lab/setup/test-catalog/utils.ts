import { T } from "./tokens";

export const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case "Haematology":
      return { text: T.haemText, bg: T.haemBg, border: T.haemBorder };
    case "Biochemistry":
      return { text: T.bioText, bg: T.bioBg, border: T.bioBorder };
    case "Microbiology":
      return { text: T.microText, bg: T.microBg, border: T.microBorder };
    case "Serology":
      return { text: T.seroText, bg: T.seroBg, border: T.seroBorder };
    case "Histopathology":
      return { text: T.histoText, bg: T.histoBg, border: T.histoBorder };
    default:
      return {
        text: T.defaultText,
        bg: T.defaultBg,
        border: T.defaultBorder,
      };
  }
};

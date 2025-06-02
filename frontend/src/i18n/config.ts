import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import commonTranslationEN from "./en/common.json";
import formTranslationEN from "./en/form.json";
import commonTranslationVN from "./vi/common.json";
import formTranslationVN from "./vi/form.json";

i18next.use(initReactI18next).init({
  lng: "vi",
  debug: true,
  resources: {
    en: {
      common: commonTranslationEN,
      form: formTranslationEN,
    },
    vi: {
      common: commonTranslationVN,
      form: formTranslationVN,
    },
  },
  defaultNS: "common",
  // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
  // set returnNull to false (and also in the i18next.d.ts options)
  // returnNull: false,
});

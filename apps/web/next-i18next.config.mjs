import path from "path";

const isDev = process.env.NODE_ENV === "development";

const nextI18NextConfig = {
  i18n: {
    defaultLocale: "uz",
    locales: ["uz", "ru", "en"]
  },
  localePath: path.resolve("./public/locales"),
  reloadOnPrerender: isDev
};

export default nextI18NextConfig;

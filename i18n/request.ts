import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get(localeCookieName)?.value;
  const locale: Locale = localeValue && isLocale(localeValue) ? localeValue : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

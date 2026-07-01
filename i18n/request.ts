// next-intl request config. Shared package handles cookie locale + base messages;
// this only points at THIS site's catalog.
// See oceandino docs/architecture/oceanleo-theme-and-17-locales.md.
import { createI18nRequest } from "@oceanleo/ui/i18n/server";

export default createI18nRequest(
  async (locale) => (await import(`../messages/${locale}.json`)).default,
);

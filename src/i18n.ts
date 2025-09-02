import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const _locale = locale || 'en';

  return {
    locale: _locale,
    messages: (await import(`../messages/${_locale}.json`)).default,
  };
});

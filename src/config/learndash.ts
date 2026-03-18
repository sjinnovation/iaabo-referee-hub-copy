export const LEARNDASH_CONFIG = {
  baseUrl: 'https://iaabou.org/wp-json/ldlms/v2',
  siteUrl: 'https://iaabou.org',
  auth: {
    username: 'ShahedI',
    password: 'zyl3 O7BJ M5DS aaIy D05E R5dq'
  }
};

export const getAuthHeader = () => {
  const { username, password } = LEARNDASH_CONFIG.auth;
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
};

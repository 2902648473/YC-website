

export const contentPageKeys = Object.freeze(['index', 'services', 'guide', 'facilities', 'about', 'contact']);

class DeploymentConfigError extends Error {}

// Read only explicit settings: a preview host must never become the canonical domain.
/** @param {{ SITE_URL?: string, SITE_INDEXING?: string }} environment */
export function getDeploymentConfig(environment = process.env) {
  if (environment.SITE_INDEXING != null && typeof environment.SITE_INDEXING !== 'string') {
    throw new DeploymentConfigError('SITE_INDEXING must be the text true or false.');
  }
  if (environment.SITE_URL != null && typeof environment.SITE_URL !== 'string') {
    throw new DeploymentConfigError('SITE_URL must be an HTTPS URL stored as text.');
  }
  const indexingValue = (environment.SITE_INDEXING ?? 'false').trim();
  if (!['', 'false', 'true'].includes(indexingValue)) {
    throw new DeploymentConfigError('SITE_INDEXING must be true or false. It defaults to false.');
  }
  const indexing = indexingValue === 'true';
  const input = (environment.SITE_URL ?? '').trim();
  if (!input) {
    if (indexing) throw new DeploymentConfigError('SITE_INDEXING=true requires SITE_URL with the final HTTPS domain.');
    return Object.freeze({ siteUrl: null, indexing });
  }

  let url;
  try { url = new URL(input); }
  catch { throw new DeploymentConfigError('SITE_URL must be an absolute HTTPS domain, for example https://www.example.com.'); }
  // Validate the supplied syntax as well as URL's normalized form; /a/.. must not pass.
  if (!/^https:\/\/[^\s/?#\\]+\/?$/.test(input) || url.protocol !== 'https:'
    || input.includes('@') || url.username || url.password || url.search || url.hash || url.pathname !== '/' || url.port) {
    throw new DeploymentConfigError('SITE_URL must use HTTPS at the domain root, without credentials, a custom port, query, fragment, or subpath. GitHub Pages project subpaths are unsupported.');
  }
  const hostname = url.hostname;
  const labels = hostname.split('.');
  const localSuffix = /(?:^|\.)(?:localhost|local|localdomain|internal|invalid|test|example|lan|home|home\.arpa|onion)$/i;
  if (labels.length < 2 || hostname.length > 253
    || localSuffix.test(hostname) || /^\d+$/.test(labels.at(-1))
    || labels.some((label) => label.length > 63 || !/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label))) {
    throw new DeploymentConfigError('SITE_URL must use a public domain name; local hosts, IP addresses, and reserved local domains are unsupported.');
  }
  return Object.freeze({ siteUrl: url.origin, indexing });
}

export function pageMetadata(config, key) {
  if (!contentPageKeys.includes(key) && key !== '404') throw new Error(`Unknown page: ${key}`);
  const isContent = key !== '404';
  return {
    robots: config.indexing && isContent ? 'index, follow' : 'noindex, nofollow',
    canonical: config.siteUrl && isContent ? `${config.siteUrl}/${key === 'index' ? '' : `${key}.html`}` : null,
  };
}

/** Apply indexing only on the configured public origin, never on preview URLs.
 * @param {{ SITE_URL?: string, SITE_INDEXING?: string }} environment
 * @param {string | URL} requestUrl
 */
export function getRequestDeploymentConfig(environment, requestUrl) {
  let config;
  try {
    config = getDeploymentConfig(environment);
  } catch (error) {
    if (!(error instanceof DeploymentConfigError)) throw error;
    // Invalid SEO bindings must not take the site offline or enable indexing.
    // Validation messages contain no submitted values or credentials.
    console.error(`[site-config] Search indexing disabled: ${error.message}`);
    return { siteUrl: null, indexing: false };
  }
  return { ...config, indexing: config.indexing && new URL(requestUrl).origin === config.siteUrl };
}

export function robotsText(config) {
  if (!config.indexing) return '# Search indexing is disabled for this site.\nUser-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
}

export function sitemapXml(config) {
  if (!config.indexing) return null;
  const urls = contentPageKeys.map((key) => `  <url><loc>${pageMetadata(config, key).canonical}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

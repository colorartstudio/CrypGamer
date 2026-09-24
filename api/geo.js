const PORTUGUESE = {
  BR: true, PT: true, AO: true, MZ: true, CV: true, GW: true, ST: true, TL: true,
};

const SPANISH = {
  ES: true, MX: true, AR: true, CO: true, CL: true, PE: true, VE: true, EC: true,
  GT: true, CU: true, BO: true, DO: true, HN: true, PY: true, SV: true, NI: true,
  CR: true, PA: true, UY: true, GQ: true, PR: true,
};

function localeFromCountry(country) {
  if (PORTUGUESE[country]) return 'pt';
  if (SPANISH[country]) return 'es';
  return 'en';
}

export default function handler(req, res) {
  const raw = req.headers['x-vercel-ip-country'];
  const country = String(Array.isArray(raw) ? raw[0] : raw || '').toUpperCase();
  const locale = country ? localeFromCountry(country) : 'pt';

  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country, locale });
}

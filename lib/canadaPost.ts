/**
 * Canada Post APIs: Tracking (Get Details) + Non-Contract Shipping (Create Shipment / Label).
 * Requires Canada Post Developer Program credentials.
 * Env: CANADA_POST_API_USER, CANADA_POST_API_PASSWORD, CANADA_POST_CUSTOMER_NUMBER (for create shipment; can match API user).
 * Sender (for labels): CANADA_POST_SENDER_COMPANY, CANADA_POST_SENDER_ADDRESS, CANADA_POST_SENDER_CITY, CANADA_POST_SENDER_PROVINCE, CANADA_POST_SENDER_POSTAL_CODE, CANADA_POST_SENDER_PHONE; optional CANADA_POST_SENDER_NAME.
 * Production: https://soa-gw.canadapost.ca  Sandbox: https://ct.soa-gw.canadapost.ca
 */

import type { ShippingAddress } from '@/types/address';

export interface TrackingEvent {
  date: string;
  time?: string;
  description: string;
  location?: string;
  province?: string;
}

export interface CanadaPostTrackingResult {
  pin: string;
  serviceName?: string;
  expectedDeliveryDate?: string;
  events: TrackingEvent[];
  /** Latest event description for "status" display */
  latestStatus?: string;
  delivered: boolean;
  error?: string;
}

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://soa-gw.canadapost.ca'
    : 'https://ct.soa-gw.canadapost.ca';

function getAuthHeader(): string {
  const user = process.env.CANADA_POST_API_USER ?? '';
  const pass = process.env.CANADA_POST_API_PASSWORD ?? '';
  if (!user || !pass) return '';
  return 'Basic ' + Buffer.from(`${user}:${pass}`, 'utf-8').toString('base64');
}

/** Extract text between XML tags (first match). */
function extractTag(xml: string, tagName: string): string {
  const open = `<${tagName}>`;
  const close = `</${tagName}>`;
  const start = xml.indexOf(open);
  if (start === -1) return '';
  const end = xml.indexOf(close, start);
  if (end === -1) return '';
  return xml.slice(start + open.length, end).trim();
}

/** Extract all occurrences of a block and run fn on each. */
function extractBlocks(xml: string, blockTag: string, fn: (block: string) => TrackingEvent | null): TrackingEvent[] {
  const results: TrackingEvent[] = [];
  const open = `<${blockTag}>`;
  const close = `</${blockTag}>`;
  let pos = 0;
  for (;;) {
    const start = xml.indexOf(open, pos);
    if (start === -1) break;
    const end = xml.indexOf(close, start);
    if (end === -1) break;
    const block = xml.slice(start + open.length, end);
    const event = fn(block);
    if (event) results.push(event);
    pos = end + close.length;
  }
  return results;
}

/** Map Canada Post event identifier to "delivered" (e.g. 1496 = Item successfully delivered). */
function isDeliveredEvent(description: string, eventId?: string): boolean {
  const d = (description || '').toLowerCase();
  if (d.includes('successfully delivered') || d.includes('item delivered')) return true;
  if (eventId === '1496') return true; // Canada Post code for delivered
  return false;
}

/**
 * Fetch tracking details for a Canada Post PIN.
 * Returns events (oldest first in API; we reverse for display) and latest status.
 */
export async function getCanadaPostTracking(pin: string): Promise<CanadaPostTrackingResult> {
  const auth = getAuthHeader();
  if (!auth) {
    return {
      pin,
      events: [],
      delivered: false,
      error: 'Canada Post API credentials not configured (CANADA_POST_API_USER, CANADA_POST_API_PASSWORD)',
    };
  }

  const trimmedPin = String(pin).trim().replace(/\s/g, '');
  if (!trimmedPin) {
    return { pin: trimmedPin, events: [], delivered: false, error: 'Invalid PIN' };
  }

  const url = `${BASE_URL}/vis/track/pin/${encodeURIComponent(trimmedPin)}/detail`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.cpc.track-v2+xml',
        'Accept-language': 'en-CA',
        Authorization: auth,
      },
    });

    const text = await res.text();

    if (!res.ok) {
      const code = extractTag(text, 'code') || String(res.status);
      const desc = extractTag(text, 'description') || res.statusText;
      return {
        pin: trimmedPin,
        events: [],
        delivered: false,
        error: `Canada Post: ${code} - ${desc}`,
      };
    }

    const events = extractBlocks(text, 'occurrence', (block) => {
      const description = extractTag(block, 'event-description');
      if (!description) return null;
      const date = extractTag(block, 'event-date');
      const time = extractTag(block, 'event-time');
      const site = extractTag(block, 'event-site');
      const province = extractTag(block, 'event-province');
      const eventId = extractTag(block, 'event-identifier');
      return {
        date: date || '',
        time: time || undefined,
        description,
        location: site || undefined,
        province: province || undefined,
      };
    });

    // Canada Post returns chronological (oldest first). We keep that order; UI can reverse for "newest first".
    const latest = events.length > 0 ? events[events.length - 1] : null;
    const delivered = latest ? isDeliveredEvent(latest.description, undefined) : false;

    return {
      pin: trimmedPin,
      serviceName: extractTag(text, 'service-name') || undefined,
      expectedDeliveryDate: extractTag(text, 'expected-delivery-date') || undefined,
      events,
      latestStatus: latest?.description,
      delivered,
    };
  } catch (e: any) {
    return {
      pin: trimmedPin,
      events: [],
      delivered: false,
      error: e?.message || 'Failed to fetch tracking',
    };
  }
}

// --- Create shipment (label) ---

export interface CreateShipmentParams {
  /** Order ID for customer-ref-1 */
  orderId: string;
  destination: ShippingAddress;
  /** Weight in kg (e.g. 1.5). Default 1 */
  weightKg?: number;
  /** Length, width, height in cm. Optional. */
  dimensions?: { length: number; width: number; height: number };
  /** Canada Post service code. Default DOM.EP (Expedited Parcel domestic). */
  serviceCode?: string;
}

export interface CreateShipmentResult {
  trackingPin: string;
  shipmentId: string;
  /** URL to fetch label PDF (Get Artifact). */
  labelHref?: string;
  labelMediaType?: string;
  error?: string;
}

function getCustomerNumber(): string {
  return (process.env.CANADA_POST_CUSTOMER_NUMBER || process.env.CANADA_POST_API_USER || '').trim();
}

function getSender(): {
  company: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
} | null {
  const company = (process.env.CANADA_POST_SENDER_COMPANY || '').trim();
  const address = (process.env.CANADA_POST_SENDER_ADDRESS || '').trim();
  const city = (process.env.CANADA_POST_SENDER_CITY || '').trim();
  const province = (process.env.CANADA_POST_SENDER_PROVINCE || '').trim();
  const postalCode = (process.env.CANADA_POST_SENDER_POSTAL_CODE || '').trim().replace(/\s/g, '').toUpperCase();
  const phone = (process.env.CANADA_POST_SENDER_PHONE || '').trim();
  const name = (process.env.CANADA_POST_SENDER_NAME || company || '').trim();
  if (!company || !address || !city || !province || !postalCode || !phone) return null;
  return { company, name, phone, address, city, province, postalCode };
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Build domestic Canada destination; 2-char province required. */
function formatProvince(state: string): string {
  const s = (state || '').trim().toUpperCase();
  if (s.length === 2) return s;
  const map: Record<string, string> = {
    ONTARIO: 'ON', QUEBEC: 'QC', 'BRITISH COLUMBIA': 'BC', ALBERTA: 'AB', MANITOBA: 'MB',
    SASKATCHEWAN: 'SK', 'NOVA SCOTIA': 'NS', 'NEW BRUNSWICK': 'NB', 'NEWFOUNDLAND AND LABRADOR': 'NL',
    'PRINCE EDWARD ISLAND': 'PE', 'NORTHWEST TERRITORIES': 'NT', YUKON: 'YT', NUNAVUT: 'NU',
  };
  return map[s] || s.slice(0, 2);
}

function buildCreateShipmentXml(params: CreateShipmentParams): string {
  const sender = getSender();
  if (!sender) throw new Error('Canada Post sender not configured (CANADA_POST_SENDER_*)');

  const dest = params.destination;
  const weight = Math.max(0.1, Math.min(999.999, params.weightKg ?? 1));
  const dims = params.dimensions;
  const serviceCode = params.serviceCode || 'DOM.EP';
  const orderRef = escapeXml(String(params.orderId).slice(-35)); // max 35 chars

  const destProvince = formatProvince(dest.state);
  const destPostal = (dest.zipCode || '').trim().replace(/\s/g, '').toUpperCase();
  const destCountry = (dest.country || 'CA').toUpperCase() === 'CANADA' ? 'CA' : (dest.country || 'CA').slice(0, 2).toUpperCase();

  let parcelXml = `<weight>${weight}</weight>`;
  if (dims && dims.length > 0 && dims.width > 0 && dims.height > 0) {
    parcelXml += `<dimensions><length>${Math.min(999.9, dims.length)}</length><width>${Math.min(999.9, dims.width)}</width><height>${Math.min(999.9, dims.height)}</height></dimensions>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<non-contract-shipment xmlns="http://www.canadapost.ca/ws/ncshipment-v4">
  <requested-shipping-point>${escapeXml(sender.postalCode)}</requested-shipping-point>
  <delivery-spec>
    <service-code>${escapeXml(serviceCode)}</service-code>
    <sender>
      <name>${escapeXml(sender.name)}</name>
      <company>${escapeXml(sender.company)}</company>
      <contact-phone>${escapeXml(sender.phone)}</contact-phone>
      <address-details>
        <address-line-1>${escapeXml(sender.address)}</address-line-1>
        <city>${escapeXml(sender.city)}</city>
        <prov-state>${escapeXml(sender.province)}</prov-state>
        <postal-zip-code>${escapeXml(sender.postalCode)}</postal-zip-code>
      </address-details>
      <country-code>CA</country-code>
    </sender>
    <destination>
      <name>${escapeXml(dest.fullName || 'Recipient')}</name>
      <client-voice-number>${escapeXml(dest.phone || '')}</client-voice-number>
      <address-details>
        <address-line-1>${escapeXml(dest.address || '')}</address-line-1>
        <city>${escapeXml(dest.city || '')}</city>
        <prov-state>${escapeXml(destProvince)}</prov-state>
        <country-code>${escapeXml(destCountry)}</country-code>
        <postal-zip-code>${escapeXml(destPostal)}</postal-zip-code>
      </address-details>
    </destination>
    <parcel-characteristics>
      ${parcelXml}
    </parcel-characteristics>
    <preferences>
      <show-packing-instructions>false</show-packing-instructions>
    </preferences>
    <references>
      <customer-ref-1>${orderRef}</customer-ref-1>
    </references>
  </delivery-spec>
</non-contract-shipment>`;
}

/** Extract link href by rel from response XML. */
function extractLinkHref(xml: string, rel: string): { href: string; mediaType: string } | null {
  const re = new RegExp(`<link\\s+[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["'][^>]*(?:media-type=["']([^"']+)["'])?[^>]*>`, 'i');
  const m = xml.match(re);
  if (m) return { href: m[1], mediaType: m[2] || '' };
  const linkRe = /<link\s+rel="([^"]+)"\s+href="([^"]+)"\s+media-type="([^"]+)"/gi;
  let match;
  while ((match = linkRe.exec(xml)) !== null) {
    if (match[1].toLowerCase() === rel.toLowerCase()) return { href: match[2], mediaType: match[3] || '' };
  }
  return null;
}

/**
 * Create a non-contract shipment (get a label and tracking PIN).
 * Domestic Canada only with default service DOM.EP. Requires sender env vars.
 */
export async function createCanadaPostShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
  const auth = getAuthHeader();
  if (!auth) {
    return {
      trackingPin: '',
      shipmentId: '',
      error: 'Canada Post API credentials not configured',
    };
  }
  const customerNumber = getCustomerNumber();
  if (!customerNumber) {
    return {
      trackingPin: '',
      shipmentId: '',
      error: 'Canada Post customer number not configured (CANADA_POST_CUSTOMER_NUMBER or CANADA_POST_API_USER)',
    };
  }
  if (!getSender()) {
    return {
      trackingPin: '',
      shipmentId: '',
      error: 'Canada Post sender address not configured (CANADA_POST_SENDER_*)',
    };
  }

  const url = `${BASE_URL}/rs/${encodeURIComponent(customerNumber)}/ncshipment`;
  let xml: string;
  try {
    xml = buildCreateShipmentXml(params);
  } catch (e: any) {
    return { trackingPin: '', shipmentId: '', error: e?.message || 'Build request failed' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.cpc.ncshipment-v4+xml',
        Accept: 'application/vnd.cpc.ncshipment-v4+xml',
        'Accept-language': 'en-CA',
        Authorization: auth,
      },
      body: xml,
    });

    const text = await res.text();

    if (!res.ok) {
      const code = extractTag(text, 'code') || String(res.status);
      const desc = extractTag(text, 'description') || res.statusText;
      return {
        trackingPin: '',
        shipmentId: '',
        error: `Canada Post: ${code} - ${desc}`,
      };
    }

    const trackingPin = extractTag(text, 'tracking-pin').trim();
    const shipmentId = extractTag(text, 'shipment-id').trim();
    const labelLink = extractLinkHref(text, 'label');

    return {
      trackingPin,
      shipmentId,
      labelHref: labelLink?.href,
      labelMediaType: labelLink?.mediaType || 'application/pdf',
    };
  } catch (e: any) {
    return {
      trackingPin: '',
      shipmentId: '',
      error: e?.message || 'Create shipment failed',
    };
  }
}

/**
 * Fetch artifact (e.g. label PDF) from Canada Post. Returns PDF as base64.
 */
export async function getCanadaPostArtifact(artifactUrl: string, acceptMediaType = 'application/pdf'): Promise<{ dataBase64: string; error?: string }> {
  const auth = getAuthHeader();
  if (!auth) return { dataBase64: '', error: 'Canada Post API credentials not configured' };

  try {
    const res = await fetch(artifactUrl, {
      method: 'GET',
      headers: {
        Accept: acceptMediaType,
        'Accept-language': 'en-CA',
        Authorization: auth,
      },
    });

    if (!res.ok) return { dataBase64: '', error: `Artifact: ${res.status} ${res.statusText}` };

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { dataBase64: base64 };
  } catch (e: any) {
    return { dataBase64: '', error: e?.message || 'Failed to fetch artifact' };
  }
}

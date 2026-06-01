import { headers } from 'next/headers';
import { validateTimezone } from './timezone';

/**
 * Server-side timezone detection using request headers
 * This should only be used in Server Components or API routes
 */
export async function detectTimezoneFromHeaders(): Promise<string | null> {
  try {
    const headersList = await headers();
    
    // Check for custom timezone header (sent from client)
    const timezoneHeader = headersList.get('x-user-timezone');
    if (timezoneHeader && validateTimezone(timezoneHeader)) {
      return timezoneHeader;
    }
    
    // Check Accept-Language header as a fallback hint
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      // Extract region from accept-language (e.g., en-US -> US)
      const match = acceptLanguage.match(/[a-z]{2}-([A-Z]{2})/);
      if (match) {
        const regionTimezone = getTimezoneFromRegion(match[1]);
        if (regionTimezone) return regionTimezone;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting timezone from headers:', error);
    return null;
  }
}

function getTimezoneFromRegion(region: string): string | null {
  // Common region to timezone mappings
  const regionTimezones: Record<string, string> = {
    US: 'America/New_York',
    GB: 'Europe/London',
    FR: 'Europe/Paris',
    DE: 'Europe/Berlin',
    JP: 'Asia/Tokyo',
    CN: 'Asia/Shanghai',
    IN: 'Asia/Kolkata',
    AU: 'Australia/Sydney',
    CA: 'America/Toronto',
    BR: 'America/Sao_Paulo',
    MX: 'America/Mexico_City',
    ES: 'Europe/Madrid',
    IT: 'Europe/Rome',
    RU: 'Europe/Moscow',
    KR: 'Asia/Seoul',
    NL: 'Europe/Amsterdam',
    SE: 'Europe/Stockholm',
    NO: 'Europe/Oslo',
    DK: 'Europe/Copenhagen',
    FI: 'Europe/Helsinki',
    PL: 'Europe/Warsaw',
    CH: 'Europe/Zurich',
    AT: 'Europe/Vienna',
    BE: 'Europe/Brussels',
    PT: 'Europe/Lisbon',
    GR: 'Europe/Athens',
    TR: 'Europe/Istanbul',
    IL: 'Asia/Jerusalem',
    AE: 'Asia/Dubai',
    SA: 'Asia/Riyadh',
    EG: 'Africa/Cairo',
    ZA: 'Africa/Johannesburg',
    NG: 'Africa/Lagos',
    KE: 'Africa/Nairobi',
    AR: 'America/Argentina/Buenos_Aires',
    CL: 'America/Santiago',
    CO: 'America/Bogota',
    PE: 'America/Lima',
    VE: 'America/Caracas',
    NZ: 'Pacific/Auckland',
    SG: 'Asia/Singapore',
    HK: 'Asia/Hong_Kong',
    TW: 'Asia/Taipei',
    TH: 'Asia/Bangkok',
    VN: 'Asia/Ho_Chi_Minh',
    PH: 'Asia/Manila',
    ID: 'Asia/Jakarta',
    MY: 'Asia/Kuala_Lumpur',
    PK: 'Asia/Karachi',
    BD: 'Asia/Dhaka',
    UA: 'Europe/Kiev',
    CZ: 'Europe/Prague',
    HU: 'Europe/Budapest',
    RO: 'Europe/Bucharest',
    BG: 'Europe/Sofia',
    HR: 'Europe/Zagreb',
    RS: 'Europe/Belgrade',
    SK: 'Europe/Bratislava',
    SI: 'Europe/Ljubljana',
    IE: 'Europe/Dublin',
  };
  
  return regionTimezones[region] || null;
}
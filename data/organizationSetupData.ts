// ─── Countries compact dataset ───────────────────────────────────────────────

interface CountryEntry {
  name: string;
  currency: string;
  currencyLabel: string;
}

// Core countries used for location + currency auto-fill
const COUNTRIES: CountryEntry[] = [
  { name: 'Pakistan', currency: 'PKR', currencyLabel: 'PKR - Pakistani Rupee' },
  { name: 'United States', currency: 'USD', currencyLabel: 'USD - US Dollar' },
  { name: 'United Kingdom', currency: 'GBP', currencyLabel: 'GBP - British Pound' },
  { name: 'United Arab Emirates', currency: 'AED', currencyLabel: 'AED - UAE Dirham' },
  { name: 'Saudi Arabia', currency: 'SAR', currencyLabel: 'SAR - Saudi Riyal' },
  { name: 'Canada', currency: 'CAD', currencyLabel: 'CAD - Canadian Dollar' },
  { name: 'Australia', currency: 'AUD', currencyLabel: 'AUD - Australian Dollar' },
  { name: 'India', currency: 'INR', currencyLabel: 'INR - Indian Rupee' },
  { name: 'Germany', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'France', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'China', currency: 'CNY', currencyLabel: 'CNY - Chinese Yuan' },
  { name: 'Japan', currency: 'JPY', currencyLabel: 'JPY - Japanese Yen' },
  { name: 'Brazil', currency: 'BRL', currencyLabel: 'BRL - Brazilian Real' },
  { name: 'Turkey', currency: 'TRY', currencyLabel: 'TRY - Turkish Lira' },
  { name: 'South Africa', currency: 'ZAR', currencyLabel: 'ZAR - South African Rand' },
  { name: 'Nigeria', currency: 'NGN', currencyLabel: 'NGN - Nigerian Naira' },
  { name: 'Egypt', currency: 'EGP', currencyLabel: 'EGP - Egyptian Pound' },
  { name: 'Spain', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Italy', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Netherlands', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Singapore', currency: 'SGD', currencyLabel: 'SGD - Singapore Dollar' },
  { name: 'Malaysia', currency: 'MYR', currencyLabel: 'MYR - Malaysian Ringgit' },
  { name: 'Indonesia', currency: 'IDR', currencyLabel: 'IDR - Indonesian Rupiah' },
  { name: 'Bangladesh', currency: 'BDT', currencyLabel: 'BDT - Bangladeshi Taka' },
  { name: 'Russia', currency: 'RUB', currencyLabel: 'RUB - Russian Ruble' },
  { name: 'New Zealand', currency: 'NZD', currencyLabel: 'NZD - New Zealand Dollar' },
  { name: 'Mexico', currency: 'MXN', currencyLabel: 'MXN - Mexican Peso' },
  { name: 'Argentina', currency: 'ARS', currencyLabel: 'ARS - Argentine Peso' },
  { name: 'Afghanistan', currency: 'AFN', currencyLabel: 'AFN - Afghan Afghani' },
  { name: 'Iran', currency: 'IRR', currencyLabel: 'IRR - Iranian Rial' },
  { name: 'Nepal', currency: 'NPR', currencyLabel: 'NPR - Nepalese Rupee' },
  { name: 'Sri Lanka', currency: 'LKR', currencyLabel: 'LKR - Sri Lankan Rupee' },
  { name: 'Oman', currency: 'OMR', currencyLabel: 'OMR - Omani Rial' },
  { name: 'Qatar', currency: 'QAR', currencyLabel: 'QAR - Qatari Rial' },
  { name: 'Kuwait', currency: 'KWD', currencyLabel: 'KWD - Kuwaiti Dinar' },
  { name: 'Bahrain', currency: 'BHD', currencyLabel: 'BHD - Bahraini Dinar' },
  { name: 'Ireland', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Switzerland', currency: 'CHF', currencyLabel: 'CHF - Swiss Franc' },
  { name: 'Austria', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Belgium', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Sweden', currency: 'SEK', currencyLabel: 'SEK - Swedish Krona' },
  { name: 'Norway', currency: 'NOK', currencyLabel: 'NOK - Norwegian Krone' },
  { name: 'Denmark', currency: 'DKK', currencyLabel: 'DKK - Danish Krone' },
  { name: 'Finland', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Poland', currency: 'PLN', currencyLabel: 'PLN - Polish Zloty' },
  { name: 'Greece', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Portugal', currency: 'EUR', currencyLabel: 'EUR - Euro' },
  { name: 'Philippines', currency: 'PHP', currencyLabel: 'PHP - Philippine Peso' },
  { name: 'Thailand', currency: 'THB', currencyLabel: 'THB - Thai Baht' },
  { name: 'Vietnam', currency: 'VND', currencyLabel: 'VND - Vietnamese Dong' },
  { name: 'South Korea', currency: 'KRW', currencyLabel: 'KRW - South Korean Won' },
  { name: 'Kenya', currency: 'KES', currencyLabel: 'KES - Kenyan Shilling' },
  { name: 'Other', currency: 'USD', currencyLabel: 'USD - US Dollar' },
];

// ─── Static Lists ─────────────────────────────────────────────────────────────

export const INDUSTRIES: string[] = [
  'Web Development',
  'Software & Technology',
  'Consulting & Professional Services',
  'Design, Agency & Media',
  'Retail & E-commerce',
  'Financial Services & Accounting',
  'Construction & Real Estate',
  'Healthcare & Wellness',
  'Education & Training',
  'Other',
];

export const LOCATIONS: string[] = COUNTRIES.map((c) => c.name);

export const CURRENCIES: { value: string; label: string }[] = (() => {
  const seen = new Set<string>();
  return COUNTRIES.filter((c) => {
    if (seen.has(c.currency)) return false;
    seen.add(c.currency);
    return true;
  }).map((c) => ({ value: c.currency, label: c.currencyLabel }));
})();

export const GLOBAL_TIMEZONES: string[] = [
  '(GMT +5:00) Pakistan Time (Asia/Karachi)',
  '(GMT -5:00) Eastern Time (US & Canada)',
  '(GMT -6:00) Central Time (US & Canada)',
  '(GMT -7:00) Mountain Time (US & Canada)',
  '(GMT -8:00) Pacific Time (US & Canada)',
  '(GMT 0:00) Greenwich Mean Time (Europe/London)',
  '(GMT +1:00) Central European Time (Europe/Paris)',
  '(GMT +1:00) Central European Time (Europe/Berlin)',
  '(GMT +2:00) Eastern European Time (Europe/Helsinki)',
  '(GMT +3:00) Arabian Standard Time (Asia/Riyadh)',
  '(GMT +3:00) Turkey Time (Europe/Istanbul)',
  '(GMT +4:00) Gulf Standard Time (Asia/Dubai)',
  '(GMT +4:30) Afghanistan Time (Asia/Kabul)',
  '(GMT +5:30) India Standard Time (Asia/Kolkata)',
  '(GMT +5:45) Nepal Time (Asia/Kathmandu)',
  '(GMT +6:00) Bangladesh Standard Time (Asia/Dhaka)',
  '(GMT +7:00) Indochina Time (Asia/Bangkok)',
  '(GMT +8:00) Singapore / Malaysia Time (Asia/Singapore)',
  '(GMT +8:00) China Standard Time (Asia/Shanghai)',
  '(GMT +9:00) Japan Standard Time (Asia/Tokyo)',
  '(GMT +10:00) Australian Eastern Time (Sydney)',
  '(GMT +12:00) New Zealand Standard Time (Pacific/Auckland)',
  '(GMT -3:00) Brasília Time (America/Sao_Paulo)',
];

export const TIMEZONES: string[] = GLOBAL_TIMEZONES;

// ─── Country-specific States / Provinces ─────────────────────────────────────

const COUNTRY_STATES: Record<string, string[]> = {
  Pakistan: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir', 'Other'],
  'United States': ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts', 'Colorado', 'Other'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Greater London', 'Other'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Other'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Other'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Other'],
  'Saudi Arabia': ['Riyadh', 'Makkah', 'Eastern Province', 'Madinah', 'Asir', 'Tabuk', 'Al Qassim', 'Hail', 'Other'],
  India: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Telangana', 'Rajasthan', 'Kerala', 'Punjab', 'Haryana', 'Other'],
  Germany: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Lower Saxony', 'Hesse', 'Saxony', 'Berlin', 'Hamburg', 'Other'],
  France: ["Île-de-France", 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', "Provence-Alpes-Côte d'Azur", 'Other'],
  China: ['Guangdong', 'Jiangsu', 'Shandong', 'Zhejiang', 'Henan', 'Beijing', 'Shanghai', 'Sichuan', 'Other'],
  Japan: ['Tokyo', 'Osaka', 'Kanagawa', 'Aichi', 'Hokkaido', 'Fukuoka', 'Kyoto', 'Other'],
  Brazil: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul', 'Other'],
  Turkey: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Other'],
  'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Other'],
  Nigeria: ['Lagos', 'Kano', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kaduna', 'Other'],
  Egypt: ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Other'],
  Spain: ['Community of Madrid', 'Catalonia', 'Andalusia', 'Valencian Community', 'Basque Country', 'Other'],
  Italy: ['Lombardy', 'Lazio', 'Campania', 'Veneto', 'Sicily', 'Tuscany', 'Other'],
  Netherlands: ['North Holland', 'South Holland', 'North Brabant', 'Utrecht', 'Gelderland', 'Other'],
  Singapore: ['Central Region', 'East Region', 'North Region', 'West Region', 'Other'],
  Malaysia: ['Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak', 'Sabah', 'Sarawak', 'Other'],
  Indonesia: ['Jakarta', 'West Java', 'East Java', 'Central Java', 'Bali', 'North Sumatra', 'Other'],
  Bangladesh: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Other'],
};

const DEFAULT_STATES = ['Capital District', 'Central Region', 'Northern Region', 'Southern Region', 'Eastern Region', 'Western Region', 'Other'];

const COUNTRY_TIMEZONES: Record<string, string> = {
  Pakistan: '(GMT +5:00) Pakistan Time (Asia/Karachi)',
  'United States': '(GMT -5:00) Eastern Time (US & Canada)',
  'United Kingdom': '(GMT 0:00) Greenwich Mean Time (Europe/London)',
  'United Arab Emirates': '(GMT +4:00) Gulf Standard Time (Asia/Dubai)',
  'Saudi Arabia': '(GMT +3:00) Arabian Standard Time (Asia/Riyadh)',
  Canada: '(GMT -5:00) Eastern Time (US & Canada)',
  Australia: '(GMT +10:00) Australian Eastern Time (Sydney)',
  Germany: '(GMT +1:00) Central European Time (Europe/Berlin)',
  France: '(GMT +1:00) Central European Time (Europe/Paris)',
  India: '(GMT +5:30) India Standard Time (Asia/Kolkata)',
  China: '(GMT +8:00) China Standard Time (Asia/Shanghai)',
  Japan: '(GMT +9:00) Japan Standard Time (Asia/Tokyo)',
  Turkey: '(GMT +3:00) Turkey Time (Europe/Istanbul)',
  Brazil: '(GMT -3:00) Brasília Time (America/Sao_Paulo)',
  'South Africa': '(GMT +2:00) South Africa Standard Time (Africa/Johannesburg)',
  Egypt: '(GMT +2:00) Eastern European Time (Africa/Cairo)',
  Nigeria: '(GMT +1:00) West Africa Time (Africa/Lagos)',
  Spain: '(GMT +1:00) Central European Time (Europe/Madrid)',
  Italy: '(GMT +1:00) Central European Time (Europe/Rome)',
  Netherlands: '(GMT +1:00) Central European Time (Europe/Amsterdam)',
  Singapore: '(GMT +8:00) Singapore Time (Asia/Singapore)',
  Malaysia: '(GMT +8:00) Malaysia Time (Asia/Kuala_Lumpur)',
  Indonesia: '(GMT +7:00) Western Indonesia Time (Asia/Jakarta)',
  Bangladesh: '(GMT +6:00) Bangladesh Standard Time (Asia/Dhaka)',
  Russia: '(GMT +3:00) Moscow Time (Europe/Moscow)',
  'New Zealand': '(GMT +12:00) New Zealand Standard Time (Pacific/Auckland)',
  Mexico: '(GMT -6:00) Central Standard Time (America/Mexico_City)',
  Argentina: '(GMT -3:00) Argentina Standard Time (America/Argentina/Buenos_Aires)',
  Afghanistan: '(GMT +4:30) Afghanistan Time (Asia/Kabul)',
  Nepal: '(GMT +5:45) Nepal Time (Asia/Kathmandu)',
  'Sri Lanka': '(GMT +5:30) India Standard Time (Asia/Colombo)',
  Oman: '(GMT +4:00) Gulf Standard Time (Asia/Muscat)',
  Qatar: '(GMT +3:00) Arabian Standard Time (Asia/Qatar)',
  Kuwait: '(GMT +3:00) Arabian Standard Time (Asia/Kuwait)',
  Bahrain: '(GMT +3:00) Arabian Standard Time (Asia/Bahrain)',
  Ireland: '(GMT 0:00) Greenwich Mean Time (Europe/Dublin)',
  Switzerland: '(GMT +1:00) Central European Time (Europe/Zurich)',
  Austria: '(GMT +1:00) Central European Time (Europe/Vienna)',
  Belgium: '(GMT +1:00) Central European Time (Europe/Brussels)',
  Sweden: '(GMT +1:00) Central European Time (Europe/Stockholm)',
  Norway: '(GMT +1:00) Central European Time (Europe/Oslo)',
  Denmark: '(GMT +1:00) Central European Time (Europe/Copenhagen)',
  Finland: '(GMT +2:00) Eastern European Time (Europe/Helsinki)',
  Poland: '(GMT +1:00) Central European Time (Europe/Warsaw)',
  Greece: '(GMT +2:00) Eastern European Time (Europe/Athens)',
  Portugal: '(GMT 0:00) Western European Time (Europe/Lisbon)',
  Philippines: '(GMT +8:00) Philippine Time (Asia/Manila)',
  Thailand: '(GMT +7:00) Indochina Time (Asia/Bangkok)',
  Vietnam: '(GMT +7:00) Indochina Time (Asia/Ho_Chi_Minh)',
  'South Korea': '(GMT +9:00) Korea Standard Time (Asia/Seoul)',
  Kenya: '(GMT +3:00) East Africa Time (Africa/Nairobi)',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getStatesForCountry = (countryName: string): string[] => {
  if (!countryName) return DEFAULT_STATES;
  return COUNTRY_STATES[countryName] || DEFAULT_STATES;
};

export const getTimezoneForCountry = (countryName: string): string => {
  if (!countryName) return GLOBAL_TIMEZONES[0];
  return COUNTRY_TIMEZONES[countryName] || GLOBAL_TIMEZONES[0];
};

export const getCurrencyForCountry = (countryName: string): string => {
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return match ? match.currency : 'PKR';
};

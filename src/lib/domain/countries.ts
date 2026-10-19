import type { Lang } from "@/lib/domain/types";

/** ISO 3166-1 alpha-2 list focused on K-BUS HUB buyer markets, then common import destinations. */
export type CountryOption = {
  code: string;
  en: string;
  ko: string;
  /** ITU E.164 country calling code digits, without leading +. */
  dial: string | null;
};

export const countries: readonly CountryOption[] = [
  { code: "KR", en: "South Korea", ko: "대한민국", dial: "82" },
  { code: "GH", en: "Ghana", ko: "가나", dial: "233" },
  { code: "KH", en: "Cambodia", ko: "캄보디아", dial: "855" },
  { code: "MN", en: "Mongolia", ko: "몽골", dial: "976" },
  { code: "DO", en: "Dominican Republic", ko: "도미니카공화국", dial: "1" },
  { code: "NG", en: "Nigeria", ko: "나이지리아", dial: "234" },
  { code: "KE", en: "Kenya", ko: "케냐", dial: "254" },
  { code: "TZ", en: "Tanzania", ko: "탄자니아", dial: "255" },
  { code: "UG", en: "Uganda", ko: "우간다", dial: "256" },
  { code: "ET", en: "Ethiopia", ko: "에티오피아", dial: "251" },
  { code: "ZA", en: "South Africa", ko: "남아프리카공화국", dial: "27" },
  { code: "SN", en: "Senegal", ko: "세네갈", dial: "221" },
  { code: "CI", en: "Côte d'Ivoire", ko: "코트디부아르", dial: "225" },
  { code: "CM", en: "Cameroon", ko: "카메룬", dial: "237" },
  { code: "AO", en: "Angola", ko: "앙골라", dial: "244" },
  { code: "MZ", en: "Mozambique", ko: "모잠비크", dial: "258" },
  { code: "RW", en: "Rwanda", ko: "르완다", dial: "250" },
  { code: "ZM", en: "Zambia", ko: "잠비아", dial: "260" },
  { code: "ZW", en: "Zimbabwe", ko: "짐바브웨", dial: "263" },
  { code: "CD", en: "DR Congo", ko: "콩고민주공화국", dial: "243" },
  { code: "CG", en: "Congo", ko: "콩고공화국", dial: "242" },
  { code: "GA", en: "Gabon", ko: "가봉", dial: "241" },
  { code: "BJ", en: "Benin", ko: "베냉", dial: "229" },
  { code: "TG", en: "Togo", ko: "토고", dial: "228" },
  { code: "BF", en: "Burkina Faso", ko: "부르키나파소", dial: "226" },
  { code: "ML", en: "Mali", ko: "말리", dial: "223" },
  { code: "NE", en: "Niger", ko: "니제르", dial: "227" },
  { code: "GN", en: "Guinea", ko: "기니", dial: "224" },
  { code: "LR", en: "Liberia", ko: "라이베리아", dial: "231" },
  { code: "SL", en: "Sierra Leone", ko: "시에라리온", dial: "232" },
  { code: "GM", en: "Gambia", ko: "감비아", dial: "220" },
  { code: "EG", en: "Egypt", ko: "이집트", dial: "20" },
  { code: "MA", en: "Morocco", ko: "모로코", dial: "212" },
  { code: "DZ", en: "Algeria", ko: "알제리", dial: "213" },
  { code: "TN", en: "Tunisia", ko: "튀니지", dial: "216" },
  { code: "LY", en: "Libya", ko: "리비아", dial: "218" },
  { code: "SD", en: "Sudan", ko: "수단", dial: "249" },
  { code: "PH", en: "Philippines", ko: "필리핀", dial: "63" },
  { code: "VN", en: "Vietnam", ko: "베트남", dial: "84" },
  { code: "TH", en: "Thailand", ko: "태국", dial: "66" },
  { code: "MY", en: "Malaysia", ko: "말레이시아", dial: "60" },
  { code: "ID", en: "Indonesia", ko: "인도네시아", dial: "62" },
  { code: "SG", en: "Singapore", ko: "싱가포르", dial: "65" },
  { code: "LA", en: "Laos", ko: "라오스", dial: "856" },
  { code: "MM", en: "Myanmar", ko: "미얀마", dial: "95" },
  { code: "BD", en: "Bangladesh", ko: "방글라데시", dial: "880" },
  { code: "PK", en: "Pakistan", ko: "파키스탄", dial: "92" },
  { code: "IN", en: "India", ko: "인도", dial: "91" },
  { code: "LK", en: "Sri Lanka", ko: "스리랑카", dial: "94" },
  { code: "NP", en: "Nepal", ko: "네팔", dial: "977" },
  { code: "AF", en: "Afghanistan", ko: "아프가니스탄", dial: "93" },
  { code: "AE", en: "United Arab Emirates", ko: "아랍에미리트", dial: "971" },
  { code: "SA", en: "Saudi Arabia", ko: "사우디아라비아", dial: "966" },
  { code: "QA", en: "Qatar", ko: "카타르", dial: "974" },
  { code: "OM", en: "Oman", ko: "오만", dial: "968" },
  { code: "KW", en: "Kuwait", ko: "쿠웨이트", dial: "965" },
  { code: "BH", en: "Bahrain", ko: "바레인", dial: "973" },
  { code: "JO", en: "Jordan", ko: "요르단", dial: "962" },
  { code: "IQ", en: "Iraq", ko: "이라크", dial: "964" },
  { code: "IR", en: "Iran", ko: "이란", dial: "98" },
  { code: "TR", en: "Türkiye", ko: "튀르키예", dial: "90" },
  { code: "UZ", en: "Uzbekistan", ko: "우즈베키스탄", dial: "998" },
  { code: "KZ", en: "Kazakhstan", ko: "카자흐스탄", dial: "7" },
  { code: "KG", en: "Kyrgyzstan", ko: "키르기스스탄", dial: "996" },
  { code: "TJ", en: "Tajikistan", ko: "타지키스탄", dial: "992" },
  { code: "TM", en: "Turkmenistan", ko: "투르크메니스탄", dial: "993" },
  { code: "RU", en: "Russia", ko: "러시아", dial: "7" },
  { code: "CN", en: "China", ko: "중국", dial: "86" },
  { code: "TW", en: "Taiwan", ko: "대만", dial: "886" },
  { code: "HK", en: "Hong Kong", ko: "홍콩", dial: "852" },
  { code: "JP", en: "Japan", ko: "일본", dial: "81" },
  { code: "AU", en: "Australia", ko: "호주", dial: "61" },
  { code: "NZ", en: "New Zealand", ko: "뉴질랜드", dial: "64" },
  { code: "FJ", en: "Fiji", ko: "피지", dial: "679" },
  { code: "PG", en: "Papua New Guinea", ko: "파푸아뉴기니", dial: "675" },
  { code: "US", en: "United States", ko: "미국", dial: "1" },
  { code: "CA", en: "Canada", ko: "캐나다", dial: "1" },
  { code: "MX", en: "Mexico", ko: "멕시코", dial: "52" },
  { code: "GT", en: "Guatemala", ko: "과테말라", dial: "502" },
  { code: "HN", en: "Honduras", ko: "온두라스", dial: "504" },
  { code: "NI", en: "Nicaragua", ko: "니카라과", dial: "505" },
  { code: "CR", en: "Costa Rica", ko: "코스타리카", dial: "506" },
  { code: "PA", en: "Panama", ko: "파나마", dial: "507" },
  { code: "CU", en: "Cuba", ko: "쿠바", dial: "53" },
  { code: "HT", en: "Haiti", ko: "아이티", dial: "509" },
  { code: "JM", en: "Jamaica", ko: "자메이카", dial: "1" },
  { code: "TT", en: "Trinidad and Tobago", ko: "트리니다드토바고", dial: "1" },
  { code: "BR", en: "Brazil", ko: "브라질", dial: "55" },
  { code: "AR", en: "Argentina", ko: "아르헨티나", dial: "54" },
  { code: "CL", en: "Chile", ko: "칠레", dial: "56" },
  { code: "PE", en: "Peru", ko: "페루", dial: "51" },
  { code: "CO", en: "Colombia", ko: "콜롬비아", dial: "57" },
  { code: "EC", en: "Ecuador", ko: "에콰도르", dial: "593" },
  { code: "BO", en: "Bolivia", ko: "볼리비아", dial: "591" },
  { code: "PY", en: "Paraguay", ko: "파라과이", dial: "595" },
  { code: "UY", en: "Uruguay", ko: "우루과이", dial: "598" },
  { code: "VE", en: "Venezuela", ko: "베네수엘라", dial: "58" },
  { code: "GB", en: "United Kingdom", ko: "영국", dial: "44" },
  { code: "IE", en: "Ireland", ko: "아일랜드", dial: "353" },
  { code: "FR", en: "France", ko: "프랑스", dial: "33" },
  { code: "DE", en: "Germany", ko: "독일", dial: "49" },
  { code: "ES", en: "Spain", ko: "스페인", dial: "34" },
  { code: "PT", en: "Portugal", ko: "포르투갈", dial: "351" },
  { code: "IT", en: "Italy", ko: "이탈리아", dial: "39" },
  { code: "NL", en: "Netherlands", ko: "네덜란드", dial: "31" },
  { code: "BE", en: "Belgium", ko: "벨기에", dial: "32" },
  { code: "PL", en: "Poland", ko: "폴란드", dial: "48" },
  { code: "RO", en: "Romania", ko: "루마니아", dial: "40" },
  { code: "UA", en: "Ukraine", ko: "우크라이나", dial: "380" },
  { code: "OTHER", en: "Other / Not listed", ko: "기타·목록에 없음", dial: null },
] as const;

const byCode = new Map(countries.map((item) => [item.code, item]));

export function isKnownCountry(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

/** Regional-indicator flag emoji from ISO alpha-2 (🌐 for OTHER / unknown). */
export function countryFlag(code: string): string {
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return "🌐";
  return String.fromCodePoint(...[...cc].map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0)));
}

export function countryDial(code: string): string | null {
  return byCode.get(code.trim().toUpperCase())?.dial ?? null;
}

export function countryLabel(code: string, lang: Lang): string {
  const item = byCode.get(code.trim().toUpperCase());
  if (!item) return code;
  return lang === "ko" ? item.ko : item.en;
}

/** Option / display line: 🇰🇷 대한민국 (+82) */
export function countryOptionLabel(code: string, lang: Lang): string {
  const item = byCode.get(code.trim().toUpperCase());
  if (!item) return code;
  const name = lang === "ko" ? item.ko : item.en;
  const flag = countryFlag(item.code);
  if (!item.dial) return `${flag} ${name}`;
  return `${flag} ${name} (+${item.dial})`;
}

export function normalizeCountryCode(value: string): string {
  return value.trim().toUpperCase();
}

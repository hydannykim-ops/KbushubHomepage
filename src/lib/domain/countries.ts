import type { Lang } from "@/lib/domain/types";

/** ISO 3166-1 alpha-2 list focused on K-BUS HUB buyer markets, then common import destinations. */
export type CountryOption = {
  code: string;
  en: string;
  ko: string;
};

export const countries: readonly CountryOption[] = [
  { code: "KR", en: "South Korea", ko: "대한민국" },
  { code: "GH", en: "Ghana", ko: "가나" },
  { code: "KH", en: "Cambodia", ko: "캄보디아" },
  { code: "MN", en: "Mongolia", ko: "몽골" },
  { code: "DO", en: "Dominican Republic", ko: "도미니카공화국" },
  { code: "NG", en: "Nigeria", ko: "나이지리아" },
  { code: "KE", en: "Kenya", ko: "케냐" },
  { code: "TZ", en: "Tanzania", ko: "탄자니아" },
  { code: "UG", en: "Uganda", ko: "우간다" },
  { code: "ET", en: "Ethiopia", ko: "에티오피아" },
  { code: "ZA", en: "South Africa", ko: "남아프리카공화국" },
  { code: "SN", en: "Senegal", ko: "세네갈" },
  { code: "CI", en: "Côte d'Ivoire", ko: "코트디부아르" },
  { code: "CM", en: "Cameroon", ko: "카메룬" },
  { code: "AO", en: "Angola", ko: "앙골라" },
  { code: "MZ", en: "Mozambique", ko: "모잠비크" },
  { code: "RW", en: "Rwanda", ko: "르완다" },
  { code: "ZM", en: "Zambia", ko: "잠비아" },
  { code: "ZW", en: "Zimbabwe", ko: "짐바브웨" },
  { code: "CD", en: "DR Congo", ko: "콩고민주공화국" },
  { code: "CG", en: "Congo", ko: "콩고공화국" },
  { code: "GA", en: "Gabon", ko: "가봉" },
  { code: "BJ", en: "Benin", ko: "베냉" },
  { code: "TG", en: "Togo", ko: "토고" },
  { code: "BF", en: "Burkina Faso", ko: "부르키나파소" },
  { code: "ML", en: "Mali", ko: "말리" },
  { code: "NE", en: "Niger", ko: "니제르" },
  { code: "GN", en: "Guinea", ko: "기니" },
  { code: "LR", en: "Liberia", ko: "라이베리아" },
  { code: "SL", en: "Sierra Leone", ko: "시에라리온" },
  { code: "GM", en: "Gambia", ko: "감비아" },
  { code: "EG", en: "Egypt", ko: "이집트" },
  { code: "MA", en: "Morocco", ko: "모로코" },
  { code: "DZ", en: "Algeria", ko: "알제리" },
  { code: "TN", en: "Tunisia", ko: "튀니지" },
  { code: "LY", en: "Libya", ko: "리비아" },
  { code: "SD", en: "Sudan", ko: "수단" },
  { code: "PH", en: "Philippines", ko: "필리핀" },
  { code: "VN", en: "Vietnam", ko: "베트남" },
  { code: "TH", en: "Thailand", ko: "태국" },
  { code: "MY", en: "Malaysia", ko: "말레이시아" },
  { code: "ID", en: "Indonesia", ko: "인도네시아" },
  { code: "SG", en: "Singapore", ko: "싱가포르" },
  { code: "LA", en: "Laos", ko: "라오스" },
  { code: "MM", en: "Myanmar", ko: "미얀마" },
  { code: "BD", en: "Bangladesh", ko: "방글라데시" },
  { code: "PK", en: "Pakistan", ko: "파키스탄" },
  { code: "IN", en: "India", ko: "인도" },
  { code: "LK", en: "Sri Lanka", ko: "스리랑카" },
  { code: "NP", en: "Nepal", ko: "네팔" },
  { code: "AF", en: "Afghanistan", ko: "아프가니스탄" },
  { code: "AE", en: "United Arab Emirates", ko: "아랍에미리트" },
  { code: "SA", en: "Saudi Arabia", ko: "사우디아라비아" },
  { code: "QA", en: "Qatar", ko: "카타르" },
  { code: "OM", en: "Oman", ko: "오만" },
  { code: "KW", en: "Kuwait", ko: "쿠웨이트" },
  { code: "BH", en: "Bahrain", ko: "바레인" },
  { code: "JO", en: "Jordan", ko: "요르단" },
  { code: "IQ", en: "Iraq", ko: "이라크" },
  { code: "IR", en: "Iran", ko: "이란" },
  { code: "TR", en: "Türkiye", ko: "튀르키예" },
  { code: "UZ", en: "Uzbekistan", ko: "우즈베키스탄" },
  { code: "KZ", en: "Kazakhstan", ko: "카자흐스탄" },
  { code: "KG", en: "Kyrgyzstan", ko: "키르기스스탄" },
  { code: "TJ", en: "Tajikistan", ko: "타지키스탄" },
  { code: "TM", en: "Turkmenistan", ko: "투르크메니스탄" },
  { code: "RU", en: "Russia", ko: "러시아" },
  { code: "CN", en: "China", ko: "중국" },
  { code: "TW", en: "Taiwan", ko: "대만" },
  { code: "HK", en: "Hong Kong", ko: "홍콩" },
  { code: "JP", en: "Japan", ko: "일본" },
  { code: "AU", en: "Australia", ko: "호주" },
  { code: "NZ", en: "New Zealand", ko: "뉴질랜드" },
  { code: "FJ", en: "Fiji", ko: "피지" },
  { code: "PG", en: "Papua New Guinea", ko: "파푸아뉴기니" },
  { code: "US", en: "United States", ko: "미국" },
  { code: "CA", en: "Canada", ko: "캐나다" },
  { code: "MX", en: "Mexico", ko: "멕시코" },
  { code: "GT", en: "Guatemala", ko: "과테말라" },
  { code: "HN", en: "Honduras", ko: "온두라스" },
  { code: "NI", en: "Nicaragua", ko: "니카라과" },
  { code: "CR", en: "Costa Rica", ko: "코스타리카" },
  { code: "PA", en: "Panama", ko: "파나마" },
  { code: "CU", en: "Cuba", ko: "쿠바" },
  { code: "HT", en: "Haiti", ko: "아이티" },
  { code: "JM", en: "Jamaica", ko: "자메이카" },
  { code: "TT", en: "Trinidad and Tobago", ko: "트리니다드토바고" },
  { code: "BR", en: "Brazil", ko: "브라질" },
  { code: "AR", en: "Argentina", ko: "아르헨티나" },
  { code: "CL", en: "Chile", ko: "칠레" },
  { code: "PE", en: "Peru", ko: "페루" },
  { code: "CO", en: "Colombia", ko: "콜롬비아" },
  { code: "EC", en: "Ecuador", ko: "에콰도르" },
  { code: "BO", en: "Bolivia", ko: "볼리비아" },
  { code: "PY", en: "Paraguay", ko: "파라과이" },
  { code: "UY", en: "Uruguay", ko: "우루과이" },
  { code: "VE", en: "Venezuela", ko: "베네수엘라" },
  { code: "GB", en: "United Kingdom", ko: "영국" },
  { code: "IE", en: "Ireland", ko: "아일랜드" },
  { code: "FR", en: "France", ko: "프랑스" },
  { code: "DE", en: "Germany", ko: "독일" },
  { code: "ES", en: "Spain", ko: "스페인" },
  { code: "PT", en: "Portugal", ko: "포르투갈" },
  { code: "IT", en: "Italy", ko: "이탈리아" },
  { code: "NL", en: "Netherlands", ko: "네덜란드" },
  { code: "BE", en: "Belgium", ko: "벨기에" },
  { code: "PL", en: "Poland", ko: "폴란드" },
  { code: "RO", en: "Romania", ko: "루마니아" },
  { code: "UA", en: "Ukraine", ko: "우크라이나" },
  { code: "OTHER", en: "Other / Not listed", ko: "기타·목록에 없음" },
] as const;

const byCode = new Map(countries.map((item) => [item.code, item]));

export function isKnownCountry(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function countryLabel(code: string, lang: Lang): string {
  const item = byCode.get(code.trim().toUpperCase());
  if (!item) return code;
  return lang === "ko" ? item.ko : item.en;
}

export function normalizeCountryCode(value: string): string {
  return value.trim().toUpperCase();
}

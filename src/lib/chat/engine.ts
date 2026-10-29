import type { Lang } from "@/lib/domain/types";

export type ChatLink = { href: string; label: string };
export type ChatReply = {
  text: string;
  links?: ChatLink[];
  suggestions?: string[];
};

type IntentId =
  | "greeting"
  | "inventory"
  | "county"
  | "export"
  | "domestic"
  | "sell"
  | "wanted"
  | "contact"
  | "price"
  | "agent"
  | "admin"
  | "fallback";

type Intent = {
  id: IntentId;
  keywords: string[];
};

const intents: Intent[] = [
  {
    id: "greeting",
    keywords: ["안녕", "hello", "hi", "hola", "bonjour", "헬로", "반가", "hey", "좋은", "사와디", "сайн"],
  },
  {
    id: "inventory",
    keywords: ["매물", "재고", "리스트", "inventory", "stock", "browse", "차량 보", "버스 보", "목록", "disponible", "stock", "voir"],
  },
  {
    id: "county",
    keywords: ["카운티", "county", "현대 카운티", "hyundai county"],
  },
  {
    id: "export",
    keywords: ["수출", "export", "exportación", "cotización", "해상", "freight", "cif", "fob", "해외", "abroad", "destination", "수출 절차", "견적 문의"],
  },
  {
    id: "domestic",
    keywords: ["국내", "domestic", "내수", "한국에서", "방문", "인도"],
  },
  {
    id: "sell",
    keywords: ["팔", "매입", "판매", "sell", "dealer", "딜러", "내 차", "등록", "사업자"],
  },
  {
    id: "wanted",
    keywords: ["원하", "찾아", "요청", "wanted", "request", "구해", "필요", "조건"],
  },
  {
    id: "contact",
    keywords: ["연락", "전화", "이메일", "주소", "회사", "contact", "email", "phone", "address", "오산", "상담"],
  },
  {
    id: "price",
    keywords: ["가격", "얼마", "price", "견적", "quote", "비용", "budget"],
  },
  {
    id: "agent",
    keywords: ["에이전트", "agent", "파트너", "partner", "추천", "referral"],
  },
  {
    id: "admin",
    keywords: ["관리자", "admin", "승인", "검토"],
  }];

const replies: Record<Lang, Record<IntentId, ChatReply>> = {
  ko: {
    greeting: {
      text: "안녕하세요. K-BUS HUB 안내 챗봇입니다. 매물·수출·판매·연락처를 짧게 도와드릴게요.",
      suggestions: ["매물 보기", "견적 문의", "내 차 팔기", "회사 연락처"],
    },
    inventory: {
      text: "회사 확인 매물은 매물 보기에서 차급 → 제조사 → 차종류 → 차모델 순으로 고를 수 있습니다. 국내 거래와 수출은 같은 재고입니다.",
      links: [{ href: "/vehicles", label: "매물 보기" }],
      suggestions: ["카운티", "견적 문의", "가격 문의"],
    },
    county: {
      text: "현대 카운티는 차급에서 카운티를 고른 뒤 제조사·모델로 좁히면 됩니다.",
      links: [{ href: "/vehicles?class=county", label: "카운티 매물" }],
      suggestions: ["매물 보기", "원하는 차량 요청"],
    },
    export: {
      text: "수출은 목적국·목적항을 남겨 주시면 담당자가 차량대금·국내운송·수출비용·해상운임·보험·검사를 구분해 견적합니다. 확인되지 않은 비용은 총액에 넣지 않고, 운임 자동 계산은 하지 않습니다.",
      links: [
        { href: "/inquiry", label: "견적·문의" }],
      suggestions: ["매물 보기", "회사 연락처"],
    },
    domestic: {
      text: "국내 거래는 매물을 고른 뒤 구매 상담 또는 방문 예약을 남기면 담당자가 상태와 일정을 안내합니다. 계약·인도 조건은 상담 후 정합니다.",
      links: [
        { href: "/vehicles", label: "매물 보기" },
        { href: "/inquiry", label: "상담 남기기" }],
      suggestions: ["견적 문의", "내 차 팔기"],
    },
    sell: {
      text: "판매 사업자(딜러)는 회원가입 후 정면·정측면·후면 사진으로 매물을 등록합니다. 관리자 검토 후에만 공개됩니다. 일반 고객은 매입 상담만 남길 수 있습니다.",
      links: [
        { href: "/sell", label: "내 차 팔기" },
        { href: "/account/signup", label: "회원가입" }],
      suggestions: ["회사 연락처", "매물 보기"],
    },
    wanted: {
      text: "재고에 없어도 원하는 조건(모델·대수·목적국 등)을 남기면 상담 목록으로 접수됩니다.",
      links: [{ href: "/wanted", label: "원하는 차량 요청" }],
      suggestions: ["매물 보기", "견적 문의"],
    },
    contact: {
      text: "K-BUS HUB · 전화/WhatsApp +82 10 3452 1321 · 사업자등록번호 445-08-03206 · 경기도 오산시 역광장로 46-1, 206호. 이메일은 도메인 등록 후 안내합니다.",
      links: [
        { href: "/inquiry", label: "문의 폼" },
        { href: "/privacy", label: "개인정보 안내" }],
      suggestions: ["매물 보기", "견적 문의"],
    },
    price: {
      text: "표시 가격이 없으면 가격 문의입니다. 수출 견적은 목적국·항을 알려 주시면 항목별로 작성하고, 미확인 비용은 합산하지 않습니다.",
      links: [
        { href: "/inquiry", label: "견적 요청" },
        { href: "/vehicles", label: "매물 보기" }],
      suggestions: ["견적 문의", "회사 연락처"],
    },
    agent: {
      text: "해외 에이전트는 파트너 가입 후 관리자 승인을 받으면 매물별 공유 링크를 만들고, 본인이 소개한 문의 상태만 볼 수 있습니다.",
      links: [{ href: "/partner", label: "파트너 가입" }],
      suggestions: ["매물 보기", "회사 연락처"],
    },
    admin: {
      text: "관리자·에이전트 화면은 승인된 계정만 사용합니다. 일반 고객 문의는 문의 폼이나 이 챗봇 안내 링크를 이용해 주세요.",
      links: [{ href: "/inquiry", label: "문의 폼" }],
      suggestions: ["매물 보기", "회사 연락처"],
    },
    fallback: {
      text: "아직 그 내용은 자동으로 답하기 어렵습니다. 아래 중에서 고르시거나, 문의 폼으로 남겨 주시면 담당자가 확인합니다.",
      links: [
        { href: "/inquiry", label: "문의 남기기" },
        { href: "/vehicles", label: "매물 보기" }],
      suggestions: ["매물 보기", "견적 문의", "내 차 팔기", "회사 연락처"],
    },
  },
  en: {
    greeting: {
      text: "Hi — I’m the K-BUS HUB guide bot. I can point you to inventory, quotes, selling, and contact details.",
      suggestions: ["Browse inventory", "Ask for a quote", "Sell a bus", "Company contact"],
    },
    inventory: {
      text: "Browse company-checked stock under Inventory. Pick class → maker → series → model. Domestic and export share one inventory.",
      links: [{ href: "/vehicles", label: "Browse inventory" }],
      suggestions: ["County", "Ask for a quote", "Price"],
    },
    county: {
      text: "For Hyundai County, choose the County class first, then maker and model.",
      links: [{ href: "/vehicles?class=county", label: "County stock" }],
      suggestions: ["Browse inventory", "Request a vehicle"],
    },
    export: {
      text: "For export, leave a destination country and port. Staff quote vehicle, inland, export costs, ocean freight, and insurance/inspection separately. Unknown costs are not rolled into a total, and freight is not auto-calculated.",
      links: [
        { href: "/inquiry", label: "Ask for a quote" }],
      suggestions: ["Browse inventory", "Company contact"],
    },
    domestic: {
      text: "For domestic deals, pick a vehicle and leave a purchase or visit request. Staff confirm known condition and schedule; contract terms come after consultation.",
      links: [
        { href: "/vehicles", label: "Browse inventory" },
        { href: "/inquiry", label: "Leave a request" }],
      suggestions: ["Ask for a quote", "Sell a bus"],
    },
    sell: {
      text: "Dealers sign up, then register with front, front three-quarter, and rear photos. Listings go public only after admin review. Customers can leave a buy-back consultation instead.",
      links: [
        { href: "/sell", label: "Sell your bus" },
        { href: "/account/signup", label: "Sign up" }],
      suggestions: ["Company contact", "Browse inventory"],
    },
    wanted: {
      text: "If it’s not in stock, leave model, quantity, destination, and other needs — it stays on the consultation list.",
      links: [{ href: "/wanted", label: "Request a vehicle" }],
      suggestions: ["Browse inventory", "Ask for a quote"],
    },
    contact: {
      text: "K-BUS HUB · Phone/WhatsApp +82 10 3452 1321 · Business Reg. No. 445-08-03206 · 206, 46-1 Yeokgwangjang-ro, Osan-si. Email will be listed after the domain is ready.",
      links: [
        { href: "/inquiry", label: "Inquiry form" },
        { href: "/privacy", label: "Privacy" }],
      suggestions: ["Browse inventory", "Ask for a quote"],
    },
    price: {
      text: "If no price is shown, ask for pricing. Export quotes are itemized once you share destination country/port; unknown costs are not summed automatically.",
      links: [
        { href: "/inquiry", label: "Request a quote" },
        { href: "/vehicles", label: "Browse inventory" }],
      suggestions: ["Ask for a quote", "Company contact"],
    },
    agent: {
      text: "Overseas agents apply, wait for approval, then get share links per vehicle and see only inquiries they introduced.",
      links: [{ href: "/partner", label: "Partner signup" }],
      suggestions: ["Browse inventory", "Company contact"],
    },
    admin: {
      text: "Admin and agent areas need approved accounts. For customer help, use the inquiry form or the links below.",
      links: [{ href: "/inquiry", label: "Inquiry form" }],
      suggestions: ["Browse inventory", "Company contact"],
    },
    fallback: {
      text: "I can’t answer that automatically yet. Pick a topic below or leave an inquiry for staff.",
      links: [
        { href: "/inquiry", label: "Leave an inquiry" },
        { href: "/vehicles", label: "Browse inventory" }],
      suggestions: ["Browse inventory", "Ask for a quote", "Sell a bus", "Company contact"],
    },
  },
  es: {
    greeting: {
      text: "Hola. Soy el asistente de K-BUS HUB. Puedo ayudarle con el inventario, cotizaciones, venta y contacto.",
      suggestions: ["Ver inventario", "Pedir cotización", "Vender", "Contacto"],
    },
    inventory: {
      text: "En Inventario elija clase → marca → serie → modelo. Hay un solo stock para venta nacional y exportación.",
      links: [{ href: "/vehicles", label: "Ver inventario" }],
      suggestions: ["County", "Pedir cotización", "Precio"],
    },
    county: {
      text: "Para Hyundai County, elija primero la clase County y después la marca y el modelo.",
      links: [{ href: "/vehicles?class=county", label: "Stock County" }],
      suggestions: ["Ver inventario", "Solicitar vehículo"],
    },
    export: {
      text: "Para exportación, indique país y puerto. El personal cotiza por separado el vehículo, el transporte interno, los costos de exportación, el flete y la inspección. Los costos sin confirmar no se suman automáticamente.",
      links: [{ href: "/inquiry", label: "Pedir cotización" }],
      suggestions: ["Ver inventario", "Contacto"],
    },
    domestic: {
      text: "En compra nacional, elija un vehículo y deje una consulta o visita. El personal confirma el estado y la agenda; el contrato se acuerda después.",
      links: [
        { href: "/vehicles", label: "Ver inventario" },
        { href: "/inquiry", label: "Dejar consulta" },
      ],
      suggestions: ["Pedir cotización", "Vender"],
    },
    sell: {
      text: "Los concesionarios se registran y suben fotos frontal, tres cuartos y trasera. Solo se publica tras la revisión del administrador.",
      links: [
        { href: "/sell", label: "Vender su bus" },
        { href: "/account/signup", label: "Registrarse" },
      ],
      suggestions: ["Contacto", "Ver inventario"],
    },
    wanted: {
      text: "Si no hay stock, deje modelo, cantidad y destino; la solicitud queda en la lista de consulta.",
      links: [{ href: "/wanted", label: "Solicitar vehículo" }],
      suggestions: ["Ver inventario", "Pedir cotización"],
    },
    contact: {
      text: "K-BUS HUB · Reg. 445-08-03206 · Osan, Gyeonggi · kbushub@naver.com.",
      links: [
        { href: "/inquiry", label: "Formulario" },
        { href: "/privacy", label: "Privacidad" },
      ],
      suggestions: ["Ver inventario", "Pedir cotización"],
    },
    price: {
      text: "Si no hay precio publicado, pida una cotización. En exportación el detalle va por ítem según país y puerto.",
      links: [
        { href: "/inquiry", label: "Pedir cotización" },
        { href: "/vehicles", label: "Ver inventario" },
      ],
      suggestions: ["Pedir cotización", "Contacto"],
    },
    agent: {
      text: "Los agentes solicitan el alta, esperan la aprobación y reciben enlaces por vehículo.",
      links: [{ href: "/partner", label: "Ser socio" }],
      suggestions: ["Ver inventario", "Contacto"],
    },
    admin: {
      text: "Admin y agentes requieren cuentas aprobadas. Para clientes, use el formulario.",
      links: [{ href: "/inquiry", label: "Formulario" }],
      suggestions: ["Ver inventario", "Contacto"],
    },
    fallback: {
      text: "Aún no puedo responder eso automáticamente. Elija un tema o deje una consulta.",
      links: [
        { href: "/inquiry", label: "Consulta" },
        { href: "/vehicles", label: "Inventario" },
      ],
      suggestions: ["Ver inventario", "Pedir cotización", "Vender", "Contacto"],
    },
  },
  fr: {
    greeting: {
      text: "Bonjour. Je suis l’assistant K-BUS HUB : stock, export, vente et contact.",
      suggestions: ["Voir le stock", "Export", "Vendre", "Contact"],
    },
    inventory: {
      text: "Dans le stock, choisissez classe → marque → série → modèle. Un seul inventaire pour national et export.",
      links: [{ href: "/vehicles", label: "Voir le stock" }],
      suggestions: ["County", "Export", "Prix"],
    },
    county: {
      text: "Pour Hyundai County, choisissez d’abord la classe County.",
      links: [{ href: "/vehicles?class=county", label: "Stock County" }],
      suggestions: ["Voir le stock", "Demander un véhicule"],
    },
    export: {
      text: "Pour l’export, indiquez pays et port. Le devis sépare véhicule, transport intérieur, frais d’export, fret et inspection. Les coûts inconnus ne sont pas totalisés automatiquement.",
      links: [
        { href: "/inquiry", label: "Demander un devis" }],
      suggestions: ["Voir le stock", "Contact"],
    },
    domestic: {
      text: "En achat national, choisissez un véhicule puis laissez une demande. Le contrat se décide après consultation.",
      links: [
        { href: "/vehicles", label: "Voir le stock" },
        { href: "/inquiry", label: "Laisser une demande" }],
      suggestions: ["Export", "Vendre"],
    },
    sell: {
      text: "Les concessionnaires s’inscrivent et envoient photos avant, trois-quarts et arrière. Publication après validation admin.",
      links: [
        { href: "/sell", label: "Vendre votre bus" },
        { href: "/account/signup", label: "Inscription" }],
      suggestions: ["Contact", "Voir le stock"],
    },
    wanted: {
      text: "Hors stock, laissez modèle, quantité et destination — la demande reste en consultation.",
      links: [{ href: "/wanted", label: "Demander un véhicule" }],
      suggestions: ["Voir le stock", "Export"],
    },
    contact: {
      text: "K-BUS HUB · n° 445-08-03206 · Osan · kbushub@naver.com.",
      links: [
        { href: "/inquiry", label: "Formulaire" },
        { href: "/privacy", label: "Confidentialité" }],
      suggestions: ["Voir le stock", "Export"],
    },
    price: {
      text: "Sans prix affiché, demandez un devis. L’export est détaillé par poste selon pays/port.",
      links: [
        { href: "/inquiry", label: "Demander un devis" },
        { href: "/vehicles", label: "Voir le stock" }],
      suggestions: ["Export", "Contact"],
    },
    agent: {
      text: "Les agents s’inscrivent, attendent l’approbation, puis reçoivent des liens par véhicule.",
      links: [{ href: "/partner", label: "Devenir partenaire" }],
      suggestions: ["Voir le stock", "Contact"],
    },
    admin: {
      text: "Admin et agents : comptes approuvés uniquement. Clients : formulaire de demande.",
      links: [{ href: "/inquiry", label: "Formulaire" }],
      suggestions: ["Voir le stock", "Contact"],
    },
    fallback: {
      text: "Je ne peux pas répondre automatiquement. Choisissez un sujet ou laissez une demande.",
      links: [
        { href: "/inquiry", label: "Demande" },
        { href: "/vehicles", label: "Stock" }],
      suggestions: ["Voir le stock", "Export", "Vendre", "Contact"],
    },
  },
  km: {
    greeting: {
      text: "សួស្តី។ ខ្ញុំជាជំនួយការ K-BUS HUB សម្រាប់ស្តុក នាំចេញ លក់ និងទំនាក់ទំនង។",
      suggestions: ["មើលស្តុក", "នាំចេញ", "លក់", "ទំនាក់ទំនង"],
    },
    inventory: {
      text: "នៅស្តុក ជ្រើសថ្នាក់ → ក្រុមហ៊ុនផលិត → ប្រភេទ → ម៉ូដែល។ ស្តុកតែមួយសម្រាប់ក្នុងស្រុក និងនាំចេញ។",
      links: [{ href: "/vehicles", label: "មើលស្តុក" }],
      suggestions: ["County", "នាំចេញ", "តម្លៃ"],
    },
    county: {
      text: "សម្រាប់ Hyundai County ជ្រើសថ្នាក់ County មុន។",
      links: [{ href: "/vehicles?class=county", label: "ស្តុក County" }],
      suggestions: ["មើលស្តុក", "ស្នើយានយន្ត"],
    },
    export: {
      text: "សម្រាប់នាំចេញ បញ្ចូលប្រទេស និងច្រក។ បុគ្គលិកបំបែកថ្លៃយានយន្ត ការដឹកក្នុងស្រុក ថ្លៃនាំចេញ ថ្លៃសមុទ្រ និងការត្រួតពិនិត្យ។",
      links: [
        { href: "/inquiry", label: "ស្នើសម្រង់" }],
      suggestions: ["មើលស្តុក", "ទំនាក់ទំនង"],
    },
    domestic: {
      text: "ទិញក្នុងស្រុក៖ ជ្រើសយានយន្ត រួចទុកសំណួរ។ កិច្ចសន្យាក្រោយពិគ្រោះ។",
      links: [
        { href: "/vehicles", label: "មើលស្តុក" },
        { href: "/inquiry", label: "ទុកសំណួរ" }],
      suggestions: ["នាំចេញ", "លក់"],
    },
    sell: {
      text: "អ្នកលក់ចុះឈ្មោះ រួចផ្ទុករូបខាងមុខ បីភាគបួន និងខាងក្រោយ។ ផ្សាយបន្ទាប់ពីអ្នកគ្រប់គ្រងពិនិត្យ។",
      links: [
        { href: "/sell", label: "លក់ឡាន" },
        { href: "/account/signup", label: "ចុះឈ្មោះ" }],
      suggestions: ["ទំនាក់ទំនង", "មើលស្តុក"],
    },
    wanted: {
      text: "បើគ្មានស្តុក ទុកម៉ូដែល ចំនួន និងទិសដៅ — នៅក្នុងបញ្ជីពិគ្រោះ។",
      links: [{ href: "/wanted", label: "ស្នើយានយន្ត" }],
      suggestions: ["មើលស្តុក", "នាំចេញ"],
    },
    contact: {
      text: "K-BUS HUB · 445-08-03206 · Osan · kbushub@naver.com។",
      links: [
        { href: "/inquiry", label: "ទម្រង់សំណួរ" },
        { href: "/privacy", label: "ឯកជនភាព" }],
      suggestions: ["មើលស្តុក", "នាំចេញ"],
    },
    price: {
      text: "បើគ្មានតម្លៃ ស្នើសម្រង់។ នាំចេញបំបែកតាមប្រទេស/ច្រក។",
      links: [
        { href: "/inquiry", label: "ស្នើសម្រង់" },
        { href: "/vehicles", label: "មើលស្តុក" }],
      suggestions: ["នាំចេញ", "ទំនាក់ទំនង"],
    },
    agent: {
      text: "ភ្នាក់ងារដាក់ពាក្យ រង់ចាំការយល់ព្រម រួចទទួលតំណតាមយានយន្ត។",
      links: [{ href: "/partner", label: "ដៃគូ" }],
      suggestions: ["មើលស្តុក", "ទំនាក់ទំនង"],
    },
    admin: {
      text: "Admin ត្រូវគណនីដែលបានយល់ព្រម។ អតិថិជនប្រើទម្រង់សំណួរ។",
      links: [{ href: "/inquiry", label: "ទម្រង់សំណួរ" }],
      suggestions: ["មើលស្តុក", "ទំនាក់ទំនង"],
    },
    fallback: {
      text: "មិនអាចឆ្លើយស្វ័យប្រវត្តិទេ។ ជ្រើសប្រធានបទ ឬទុកសំណួរ។",
      links: [
        { href: "/inquiry", label: "សំណួរ" },
        { href: "/vehicles", label: "ស្តុក" }],
      suggestions: ["មើលស្តុក", "នាំចេញ", "លក់", "ទំនាក់ទំនង"],
    },
  },
  mn: {
    greeting: {
      text: "Сайн байна уу. Би K-BUS HUB-ийн туслах бот. Нөөц, экспорт, борлуулалт, холбоо барихад тусална.",
      suggestions: ["Нөөц үзэх", "Экспорт", "Зарах", "Холбоо барих"],
    },
    inventory: {
      text: "Нөөцөд ангилал → үйлдвэрлэгч → төрөл → загвар сонгоно. Дотоод/экспорт нэг нөөцтэй.",
      links: [{ href: "/vehicles", label: "Нөөц үзэх" }],
      suggestions: ["County", "Экспорт", "Үнэ"],
    },
    county: {
      text: "Hyundai County-д эхлээд County ангиллыг сонгоно.",
      links: [{ href: "/vehicles?class=county", label: "County нөөц" }],
      suggestions: ["Нөөц үзэх", "Хүсэлт илгээх"],
    },
    export: {
      text: "Экспортод очих улс, боомтыг үлдээнэ. Үнийн санал тээврийн хэрэгсэл, дотоод тээвэр, экспортын зардал, далайн тээвэр, шалгалтыг тусад нь гаргана.",
      links: [
        { href: "/inquiry", label: "Үнийн санал" }],
      suggestions: ["Нөөц үзэх", "Холбоо барих"],
    },
    domestic: {
      text: "Дотоод худалдан авалтад машин сонгоод асуулга үлдээнэ. Гэрээг зөвлөгөөний дараа тохирно.",
      links: [
        { href: "/vehicles", label: "Нөөц үзэх" },
        { href: "/inquiry", label: "Асуулга" }],
      suggestions: ["Экспорт", "Зарах"],
    },
    sell: {
      text: "Дилер бүртгүүлж урд/гурван дөрөв/ард зураг илгээнэ. Админ шалгасны дараа нийтлэнэ.",
      links: [
        { href: "/sell", label: "Автобусаа зараарай" },
        { href: "/account/signup", label: "Бүртгүүлэх" }],
      suggestions: ["Холбоо барих", "Нөөц үзэх"],
    },
    wanted: {
      text: "Нөөцгүй бол загвар, тоо, чиглэлээ үлдээнэ — зөвлөгөөний жагсаалтад үлдэнэ.",
      links: [{ href: "/wanted", label: "Хүсэлт илгээх" }],
      suggestions: ["Нөөц үзэх", "Экспорт"],
    },
    contact: {
      text: "K-BUS HUB · 445-08-03206 · Osan · kbushub@naver.com.",
      links: [
        { href: "/inquiry", label: "Асуулгын маягт" },
        { href: "/privacy", label: "Нууцлал" }],
      suggestions: ["Нөөц үзэх", "Экспорт"],
    },
    price: {
      text: "Үнэ байхгүй бол үнийн санал авна. Экспорт улс/боомтоор задална.",
      links: [
        { href: "/inquiry", label: "Үнийн санал" },
        { href: "/vehicles", label: "Нөөц үзэх" }],
      suggestions: ["Экспорт", "Холбоо барих"],
    },
    agent: {
      text: "Агент хүсэлт гаргаж, зөвшөөрөл авсны дараа машин бүрийн холбоос авна.",
      links: [{ href: "/partner", label: "Түнш болох" }],
      suggestions: ["Нөөц үзэх", "Холбоо барих"],
    },
    admin: {
      text: "Админ/агент зөвхөн зөвшөөрөгдсөн бүртгэл. Үйлчлүүлэгч асуулгын маягт ашиглана.",
      links: [{ href: "/inquiry", label: "Асуулгын маягт" }],
      suggestions: ["Нөөц үзэх", "Холбоо барих"],
    },
    fallback: {
      text: "Автоматаар хариулж чадахгүй байна. Сэдэв сонгох эсвэл асуулга үлдээнэ үү.",
      links: [
        { href: "/inquiry", label: "Асуулга" },
        { href: "/vehicles", label: "Нөөц" }],
      suggestions: ["Нөөц үзэх", "Экспорт", "Зарах", "Холбоо барих"],
    },
  },
};

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchChatIntent(message: string): IntentId {
  const text = normalize(message);
  if (!text) return "greeting";
  let best: { id: IntentId; score: number } | null = null;
  for (const intent of intents) {
    let score = 0;
    for (const keyword of intent.keywords) {
      if (text.includes(keyword.toLowerCase())) score += keyword.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { id: intent.id, score };
  }
  return best?.id ?? "fallback";
}

export function chatReply(lang: Lang, message: string): ChatReply & { intent: IntentId } {
  const intent = matchChatIntent(message);
  const pack = replies[lang] ?? replies.en;
  return { intent, ...pack[intent] };
}

export function chatWelcome(lang: Lang): ChatReply {
  return (replies[lang] ?? replies.en).greeting;
}

export const chatUi = {
  ko: {
    title: "K-BUS HUB 안내",
    subtitle: "매물·수출·판매 짧은 안내",
    open: "챗봇 열기",
    close: "닫기",
    placeholder: "무엇이 궁금하신가요?",
    send: "보내기",
    you: "나",
    bot: "안내",
  },
  en: {
    title: "K-BUS HUB guide",
    subtitle: "Inventory, export, selling",
    open: "Open chat",
    close: "Close",
    placeholder: "Ask a question…",
    send: "Send",
    you: "You",
    bot: "Guide",
  },
  es: {
    title: "Guía K-BUS HUB",
    subtitle: "Inventario, exportación, venta",
    open: "Abrir chat",
    close: "Cerrar",
    placeholder: "Escriba su pregunta…",
    send: "Enviar",
    you: "Usted",
    bot: "Guía",
  },
  fr: {
    title: "Guide K-BUS HUB",
    subtitle: "Stock, export, vente",
    open: "Ouvrir le chat",
    close: "Fermer",
    placeholder: "Votre question…",
    send: "Envoyer",
    you: "Vous",
    bot: "Guide",
  },
  km: {
    title: "មគ្គុទ្ទេសក៍ K-BUS HUB",
    subtitle: "ស្តុក · នាំចេញ · លក់",
    open: "បើកជជែក",
    close: "បិទ",
    placeholder: "សំណួររបស់អ្នក…",
    send: "ផ្ញើ",
    you: "អ្នក",
    bot: "មគ្គុទ្ទេសក៍",
  },
  mn: {
    title: "K-BUS HUB туслах",
    subtitle: "Нөөц · экспорт · борлуулалт",
    open: "Чат нээх",
    close: "Хаах",
    placeholder: "Асуултаа бичнэ үү…",
    send: "Илгээх",
    you: "Та",
    bot: "Туслах",
  },
} as const;

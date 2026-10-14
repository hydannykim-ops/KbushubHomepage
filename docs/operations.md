# K-BUS HUB 실행과 운영 연결

이 문서는 로컬에서 화면을 확인하고, 영업 전에 무엇을 채워야 하는지 적습니다. 샘플 매물은 데모이며 실제 재고가 아닙니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 `/ko` 로 이동합니다. 영어는 `/en` 입니다.

거래 방식은 주소의 `trade=domestic` 또는 `trade=export` 입니다. 언어와 따로 바뀝니다.

데모 관리자: `admin@kbushub.demo` / `demo-admin-only`  
데모 에이전트: `agent@kbushub.demo` / `demo-agent-only`

비밀번호는 데모 로그인 화면에만 표시합니다.

## 환경변수

`.env.example` 을 복사해 `.env.local` 로 둡니다.

| 변수 | 의미 |
| --- | --- |
| `DATA_MODE` | `demo` 는 로컬 샘플. `live` 는 샘플로 대체하지 않고 연결 오류를 보여 줍니다. |
| `AUTH_SECRET` | 세션 서명. live에서는 필수입니다. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | live 관리자. 비우면 live 로그인이 되지 않습니다. |
| `NEXT_PUBLIC_SITE_URL` | 공유 주소와 sitemap의 기준 주소입니다. |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | 이후 연결용. 아직 앱이 이 키로 데이터를 읽지 않습니다. |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용. `NEXT_PUBLIC_` 를 붙이지 않습니다. |

데모 저장 파일은 `data/runtime.json` 입니다. 저장소에 올리지 않습니다. 매입 상담 사진은 `data/private-uploads`, 공개 차량 사진은 `public/stock` 입니다.

## 확인한 명령

구현 후 `npm run verify`, `npm run typecheck`, `npm run lint`, `npm run build` 를 실행합니다. 결과 숫자는 작업 보고에 적습니다. 실행하지 않은 항목은 완료로 적지 않습니다.

## 데이터베이스

`supabase/migrations/0001_init.sql` 에 테이블과 RLS가 있습니다. 이 앱은 아직 Supabase 클라이언트로 그 테이블을 읽고 쓰지 않습니다. `DATA_MODE=live` 로 두면 데모 재고를 보여 주지 않고, 연결되지 않았다는 화면을 냅니다.

최초 관리자는 SQL로 `profiles.role = 'admin'` 을 **service role** 로만 넣습니다. 사용자는 자기 권한을 admin으로 바꿀 수 없게 트리거를 두었습니다.

공개 매물과 `vehicle_internal`(매입원가, 실제 판매금액, 부대비용, 수수료)은 테이블을 나눴습니다.

## 영업 전에 넣을 것

관리자 설정의 값이 비어 있으면 사이트는 번호를 만들지 않습니다.

- 회사명, 대표, 사업자번호
- 주소, 영업시간
- 전화, 이메일
- 카카오톡은 `https://` 로 시작하는 주소만 버튼이 됩니다
- WhatsApp은 국가번호를 포함한 번호만 버튼이 됩니다
- 개인정보 처리방침 확정. 확정 전에는 `privacyIntakeEnabled` 를 켜지 않습니다
- 실제 매물 사진, 연식, 주행거리, 인승, 가격, 통화, 포함 조건, 재고 확인일
- 모르는 항목은 비워 둡니다. 화면은 미확인으로 표시합니다

## 이번 버전에 없는 것

외부 판매자 입점, 경매, 온라인 결제, 실시간 채팅, 운임 자동 계산, 국가별 수입 규정 판정, 수수료 자동 정산, 마케팅 메시지 발송, Supabase 실연결.

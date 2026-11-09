# 복권번호 생성기

로또 6/45와 연금복권 720+ 번호를 생성·복사하고 현재 브라우저에 저장하는 무료 정적 웹사이트입니다. 복권 판매·결제·베팅·구매 예약·당첨 예측 서비스가 아닙니다.

- 공개 사이트: https://yohi604.github.io/lottery-number-generator/
- GitHub 저장소: https://github.com/yohi604/lottery-number-generator
- HTML / CSS / JavaScript, 빌드·서버·외부 API·유료 서비스 없음
- 공개 테스트용 GitHub Pages. 광고·분석 스크립트 없음

## 공개 및 검증 상태

2026-11-09 GitHub Pages `main /docs` 배포 완료. 공개 URL에서 생성·복사·저장·새로고침 유지·삭제를 확인했습니다. 자동 테스트 10개와 총 20,000게임 형식 검증도 통과했습니다. 실제 휴대폰 및 Safari 검증, Search Console 인증, 광고 승인은 수행하지 않았습니다. 자세한 내용은 [TESTING.md](TESTING.md), 운영 순서는 [LAUNCH.md](LAUNCH.md)를 참고하세요.

## 기능

- 로또: 1~45 중 서로 다른 6개, 오름차순. 보너스 번호는 구매자 선택 대상이 아니므로 생성하지 않습니다.
- 연금복권: 1~5조와 여섯 자리 0~9를 각각 독립 생성. 앞자리 0과 반복 숫자 허용.
- 각각 1·5·10게임 생성, 다시 생성, 한 게임/전체 복사
- 복권별 보관함, 날짜 표시, 중복 저장 방지, 개별 삭제, 확인 후 해당 보관함 전체 삭제
- 같은 기기·같은 브라우저 localStorage 저장. 타 기기 동기화 없음.
- 저장 차단/용량 오류 안내, 복사 차단 시 직접 복사 창, 키보드 조작 및 동작 줄이기 설정 지원
- 한국어 title·description·H1/H2, canonical·OG PNG·favicon, sitemap, robots.txt, 안내/FAQ/소개/개인정보 안내

## 파일 구성

```text
docs/                    ← GitHub Pages 공개 폴더
  index.html             메인 화면·규칙·FAQ
  about.html             서비스 소개
  privacy.html           개인정보 처리 안내
  404.html               없는 페이지 안내
  assets/
    styles.css           반응형 디자인
    app.js               화면 동작·복사·보관함
    lottery.js           난수·번호 규칙
    storage.js           저장 데이터 검증·저장·삭제
    favicon.svg
    apple-touch-icon.png
    og-image.png
  sitemap.xml
  robots.txt
  .nojekyll
tests/lottery.test.js     번호 생성과 저장 검증
TESTING.md               실제 실행한 테스트와 남은 검증
LAUNCH.md                배포·검색 등록·광고 검토 순서
```

## GitHub Pages로 배포

1. `lottery-number-generator` 공개 저장소를 만듭니다. 같은 이름의 기존 저장소가 있다면 내용을 확인하고 덮어쓰지 않습니다.
2. 이 프로젝트의 파일과 폴더를 저장소에 올려 `main` 브랜치에 커밋합니다. 웹 업로드라면 ZIP 파일 자체가 아니라 압축을 푼 내용을 올립니다.
3. 저장소 **Settings → Pages → Build and deployment → Source: Deploy from a branch**를 선택합니다.
4. **main /docs**를 선택하고 **Save**를 누릅니다.
5. Actions의 `pages build and deployment` 성공을 확인한 후 위 배포 주소를 엽니다. 초기 반영에는 수 분이 걸릴 수 있습니다.

GitHub Free의 Pages는 공개 저장소에서 사용합니다. `.nojekyll`은 불필요한 Jekyll 처리를 방지합니다. 배포용 GitHub Actions 파일을 직접 작성할 필요가 없습니다.

## 수정 후 다시 배포

문구는 `docs/index.html`, 디자인은 `docs/assets/styles.css`, 동작은 `docs/assets/app.js`를 수정하고 main에 커밋하면 Pages가 다시 배포합니다. GitHub에서 파일의 연필 버튼으로 수정해도 됩니다. 이 채팅에 원하는 변경을 요청해도 됩니다.

배포 주소를 바꾸면 세 페이지의 canonical·OG URL, 메인 OG 이미지 URL, `sitemap.xml`, `robots.txt`, README 링크를 함께 수정합니다. 공개 폴더 전체를 다른 정적 호스팅으로 그대로 옮길 수 있습니다. 도메인이 바뀌면 이전 도메인의 localStorage는 자동 이전되지 않으므로 번호를 미리 복사해 보관해야 합니다.

## 개발·테스트 (선택)

사이트 배포에는 Node나 설치 과정이 필요 없습니다. 자동 테스트만 Node.js 22 이상에서 `npm test` 또는 `node --test tests/*.test.js`로 실행합니다. 의존성 패키지는 없습니다.

로컬에서 확인할 때는 프로젝트 루트에서 `python3 -m http.server 8000 --directory docs`를 실행하고 `http://localhost:8000/`으로 접속합니다. 모듈을 사용하므로 `index.html`을 파일로 직접 더블클릭하는 대신 웹서버로 확인하세요. Python 설치가 없다면 VS Code Live Server로 `docs` 폴더를 열 수 있습니다.

## 난수와 데이터

`crypto.getRandomValues`의 32비트 난수를 사용합니다. 나머지 연산 편향을 없애기 위해 범위를 벗어나는 샘플을 버리고 다시 뽑는 방식(rejection sampling)을 적용합니다. 로또는 partial Fisher–Yates로 6개를 선택합니다. 안전한 난수 기능이 없으면 오류를 안내하며 `Math.random`으로 대체하지 않습니다.

각 게임은 독립적이어서 서로 다른 게임에 동일한 조합이 나올 수 있습니다. 통계나 과거 당첨 결과를 사용하지 않습니다. 테스트는 형식·경계·저장 동작 검증이며 특정 사용자의 당첨이나 난수 분포에 대한 실험적 보증이 아닙니다.

`lottery-number-generator:v1` 키에 버전·복권 유형·번호·ISO 저장 시간을 저장합니다. 해당 키만 수정하고 다른 서비스의 저장 데이터는 삭제하지 않습니다. 같은 출처의 다른 탭 변경은 storage 이벤트로 반영합니다. localStorage는 동시 트랜잭션을 제공하지 않으므로 여러 탭에서 정확히 동시에 저장하는 경우 충돌 가능성은 있습니다.

## 공식 참고 자료

- [동행복권 로또 6/45](https://www.dhlottery.co.kr/lt645/intro)
- [동행복권 연금복권 720+](https://www.dhlottery.co.kr/pt720/intro)
- [GitHub Pages 만들기](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Pages 사용 제한](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Search Console 소유권 확인](https://support.google.com/webmasters/answer/9008080?hl=ko)

본 사이트는 동행복권의 공식 서비스가 아니며, 번호 생성 기능은 오락과 편의를 위한 것입니다. 모든 유효한 번호 조합의 당첨 확률은 동일하며, 번호 생성 방식이 당첨 가능성을 높여주지 않습니다.

## 블랙·골드 디자인

- 기본 레이아웃은 `docs/assets/styles.css`, 블랙·골드 테마는 `docs/assets/lounge.css`에서 수정합니다.
- 왕관·월계수·클로버·버튼 아이콘은 `docs/assets/icons.svg`의 벡터로 표현합니다. 번호 공과 연금복권 타일은 CSS이며 이미지 교체가 필요하지 않습니다.
- 라운지 사진은 아직 사용하지 않습니다. 글자·숫자·버튼이 없는 가로 배경을 추가할 때 `docs/assets/`에 넣고 `lounge.css`의 `--lounge-image`에 해당 파일의 상대 URL을 지정하면 됩니다. 현재는 CSS 조명과 녹색 배경을 사용합니다.
- 난수 생성·저장 모듈과 localStorage 키는 유지되어 같은 주소의 기존 보관함을 계속 사용합니다.

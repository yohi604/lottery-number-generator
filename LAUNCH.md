# 배포와 운영 안내

## 1. 첫 공개

README의 Pages 설정(main /docs)을 완료합니다. `https://yohi604.github.io/lottery-number-generator/`는 배포 대상 주소이며, 설정 전에는 접속되지 않습니다. 실제 공개 여부는 GitHub의 배포 상태와 직접 접속으로 확인해야 합니다.

## 2. Google Search Console

1. https://search.google.com/search-console 에 본인 Google 계정으로 로그인합니다.
2. **속성 추가 → URL 접두어**를 고르고 `https://yohi604.github.io/lottery-number-generator/`를 입력합니다. GitHub의 전체 도메인에 대한 DNS 소유권이 없으므로 도메인 속성 대신 URL 접두어를 사용합니다.
3. **HTML 태그** 방법을 선택해 발급된 `google-site-verification` 메타 태그를 복사합니다.
4. `docs/index.html`의 `<head>` 안에 태그를 넣어 커밋합니다. 발급 전에는 임의의 토큰을 넣지 않습니다. 받은 태그를 이 채팅에 전달하면 반영을 요청할 수 있습니다. 비밀번호나 로그인 코드는 보내지 않습니다.
5. 배포가 반영되면 Search Console에서 **확인**을 누릅니다. 인증 후에도 태그를 유지합니다.
6. **Sitemaps** 메뉴에 `https://yohi604.github.io/lottery-number-generator/sitemap.xml`을 제출합니다.
7. **URL 검사**에서 메인 페이지를 검사하고 색인 생성을 요청합니다. 색인 및 검색 순위는 보장되지 않습니다.

### robots.txt의 적용 범위

파일은 준비되어 있지만 프로젝트 Pages 경로인 `/lottery-number-generator/robots.txt`는 검색로봇의 호스트 전체 규칙으로 적용되지 않습니다. robots.txt는 `https://yohi604.github.io/robots.txt`처럼 호스트 최상위에 있어야 합니다. 이 작업에서는 기존 다른 저장소나 호스트 최상위 사이트를 수정하지 않습니다. 현재는 사이트맵을 Search Console에 직접 제출합니다. 나중에 독립 도메인의 루트로 이전하면 이 파일이 바로 적용됩니다. 루트 robots.txt의 기존 정책도 공개 후 URL 검사에서 확인하세요.

## 3. 광고 수익화를 검토하기 전

- 현재 코드는 광고·추적·분석·쿠키 동의 도구를 포함하지 않습니다.
- GitHub Pages는 개발 및 프로젝트 공개 테스트용으로 사용합니다. 광고 중심의 상업 운영을 시작하기 전 최신 GitHub 약관과 호스팅 적합성을 확인하고 필요한 경우 상업 운영을 허용하는 정적 호스팅으로 이전합니다.
- Google AdSense의 최신 자격·콘텐츠·게시자 정책과 복권 관련 콘텐츠 제한을 확인합니다. 번호 생성기라는 이유만으로 승인이 보장되지 않습니다.
- 실제 운영자 연락 경로, 독자적인 이용 안내와 유용한 콘텐츠를 준비합니다. 허위 사업자명·주소·이력은 넣지 않습니다.
- 광고나 분석 도구를 실제 도입할 때 개인정보 안내, 쿠키·동의 처리, 필요한 지역별 요구사항을 기능에 맞춰 갱신합니다.
- 승인 이후 지급받은 광고 코드만 설치하고, 필요할 때 ads.txt를 실제 발급 정보로 작성합니다. 빈 광고 슬롯이나 가짜 게시자 ID는 넣지 않습니다.
- 호스팅 이전 시 canonical·OG·사이트맵·robots와 Search Console 속성을 변경하고, 저장 번호는 기존 브라우저에서 미리 복사합니다.

## 참고

- https://support.google.com/webmasters/answer/9008080?hl=ko
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://support.google.com/adsense/answer/9724?hl=ko

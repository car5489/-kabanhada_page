# GitHub Pages 대상 저장소 SSOT

## 확정

현재 카반하다 페이지의 GitHub Pages 대상 저장소는 아래입니다.

```txt
https://github.com/car5489/-kabanhada_page.git
```

커스텀 도메인을 아직 연결하지 않는 경우 기본 접속 주소는 아래 형식입니다.

```txt
https://car5489.co.kr/
```

## GitHub Actions Variables

커스텀 도메인 연결 전에는 아래 값을 사용합니다.

```txt
BASE_PATH=/
```

Vite는 이 값을 기준으로 정적 파일 경로를 생성합니다.

## PowerShell 배포 스크립트

`run-sheet-deploy.ps1`의 대상 저장소는 아래 값으로 고정합니다.

```powershell
$repo = "car5489/-kabanhada_page"
```

## 커스텀 도메인 연결 시 변경점

실제 구매 도메인을 연결하면 아래처럼 바꿉니다.

```txt
BASE_PATH=/
```

그리고 `public/CNAME` 파일을 만들고 도메인만 한 줄로 입력합니다.

예시:

```txt
www.example.com
```

`public/CNAME`은 생성 완료 상태이며, 내용은 `car5489.co.kr`입니다.

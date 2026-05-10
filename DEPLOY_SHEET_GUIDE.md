# 카반하다 시트 반영 배포 가이드

## 1. 시트 수정 후 즉시 배포

Google Sheet를 수정한 뒤 PowerShell에서 아래를 실행합니다.

```powershell
cd "D:\11124\car\kabanhada-vehicle-catalog"
.\run-sheet-deploy.ps1
```

이 스크립트는 GitHub Actions의 `pages.yml` 워크플로우를 수동 실행합니다.

## 2. 처음 한 번만 필요한 준비

GitHub CLI가 없다면 설치합니다.

```powershell
winget install --id GitHub.cli
```

로그인합니다.

```powershell
gh auth login
```

권장 선택:

```txt
GitHub.com
HTTPS
Login with a web browser
```

## 3. 필요한 GitHub 설정

Secrets:

```txt
GOOGLE_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
```

Variables:

```txt
BASE_PATH=/-kabanhada_page/
```


## 3-1. GitHub Pages 대상 저장소

현재 배포 대상 저장소는 아래입니다.

```txt
https://github.com/car5489/-kabanhada_page.git
```

커스텀 도메인 연결 전 기본 Pages 주소는 아래입니다.

```txt
https://car5489.github.io/-kabanhada_page/
```

따라서 `BASE_PATH`는 아래처럼 설정합니다.

```txt
/-kabanhada_page/
```

실제 도메인을 구매해 연결하는 경우에는 `BASE_PATH=/`로 변경하고, `public/CNAME` 파일에 도메인을 넣습니다.

## 4. 이미지 규칙

이미지 권장 사이즈와 폴더 규칙은 아래 문서를 기준으로 합니다.

```txt
docs/IMAGE_ASSET_SSOT.md
```

## 5. 한 줄 SSOT

```txt
카반하다 데이터는 Google Sheet에서 수정하고, 시트 저장 후 run-sheet-deploy.ps1로 GitHub Actions를 실행해 GitHub Pages에 반영한다.
```

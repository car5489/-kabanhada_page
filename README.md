# 카반하다 차량 카탈로그

Vue 3 + Vite + TypeScript 기반의 카반하다 차량 전시 페이지입니다.

이 프로젝트의 기준은 다음과 같습니다.

- Google Sheet는 비개발자 운영자가 수정하는 차량 데이터 SSOT입니다.
- GitHub Actions는 서비스 계정으로 시트를 읽고 `public/data/vehicle-catalog.json`을 생성합니다.
- Vue 앱은 생성된 JSON만 읽어서 차량 카드와 상세페이지를 렌더링합니다.
- 차량 이미지는 `public/vehicles/차량ID` 폴더를 원본으로 사용합니다.
- 빌드 과정에서 차량 이미지는 WebP로 최적화됩니다.

## 로컬 명령어

```bash
npm install
npm run dev
npm run build
```

Google Sheet 연동 빌드:

```bash
npm run setup:sheet-deps
npm run build:sheet
```

## 시트 반영 배포

PowerShell에서 아래 명령을 실행합니다.

```powershell
cd "D:\11124\car\kabanhada-vehicle-catalog"
.\run-sheet-deploy.ps1
```

자세한 내용은 아래 문서를 봅니다.

```txt
DEPLOY_SHEET_GUIDE.md
```


## GitHub Pages 배포 주소 SSOT

현재 GitHub Pages 대상 저장소는 아래입니다.

```txt
https://github.com/car5489/-kabanhada_page.git
```

커스텀 도메인을 아직 연결하지 않는 경우 기본 Pages 주소는 아래 형식입니다.

```txt
https://car5489.co.kr/
```

커스텀 도메인을 사용하므로 Vite 기준 경로는 루트(`/`)로 고정합니다.

```txt
BASE_PATH=/
```

`public/CNAME`에는 아래 도메인을 한 줄로 저장합니다.

```txt
car5489.co.kr
```

## GitHub Secrets

GitHub 저장소의 `Settings -> Secrets and variables -> Actions -> Secrets`에 아래 값을 넣습니다.

```txt
GOOGLE_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
```

Variables에는 아래 값을 넣습니다.

```txt
BASE_PATH=/
```

## Google Sheet 탭 SSOT

### vehicles

차량 한 대 = 한 행입니다.

```csv
차량ID,노출여부,차량명,브랜드,모델,차종,연식,주행거리,연료,변속기,색상,짧은설명,상세설명,유튜브URL,대표사진,사진1,사진1설명,사진2,사진2설명,사진3,사진3설명,정렬순서,메모
```

### settings

전체 공통 정보입니다.

```csv
항목,값
채널명,카반하다
상담전화,010-8008-5489
카탈로그제목,현재 판매중인 차량
카탈로그설명,현재 바로 문의 가능한 차량만 모았습니다.
가격문구,상담 문의
```

## 이미지 SSOT

이미지 권장 사이즈와 파일명 규칙은 아래 문서를 기준으로 합니다.

```txt
docs/IMAGE_ASSET_SSOT.md
```

요약:

```txt
public/vehicles/차량ID/main.jpg
public/vehicles/차량ID/01.jpg
public/vehicles/차량ID/02.jpg
public/vehicles/차량ID/03.jpg
```

대표 권장 사이즈:

```txt
1600 x 1067px
3:2 비율
```

## 보안 경계

Vue 코드에 Google Sheet URL, API key, 서비스 계정 JSON, private key를 넣지 않습니다.  
민감정보는 GitHub Actions Secrets에만 둡니다.

`public/data/vehicle-catalog.json`은 배포 사이트 방문자에게 공개되는 데이터입니다.

## Git helper scripts

```bash
npm run git:status
npm run git:update -- "update kabanhada catalog"
npm run git:update -- "copy update" --no-build
```

`git:publish`는 `git:update`의 별칭입니다.

## 차량 이미지 폴더 생성

Google Sheet에 차량 행을 추가해도 GitHub 저장소의 이미지 폴더가 자동으로 생기지는 않습니다.
새 차량을 추가할 때는 같은 차량ID로 이미지 폴더를 먼저 만듭니다.

```powershell
npm run scaffold:vehicle -- --id avante-cn7-2022 --title "2022 현대 아반떼 CN7"
```

현재 `public/data/vehicle-catalog.json`에 들어 있는 차량 전체를 기준으로 폴더를 만들려면:

```powershell
npm run scaffold:vehicles
```

자세한 기준은 `docs/VEHICLE_FOLDER_SCAFFOLD_GUIDE.md`와 `docs/IMAGE_ASSET_SSOT.md`를 확인합니다.

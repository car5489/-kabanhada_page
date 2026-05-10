# 카반하다 차량 폴더 생성 가이드

## 확정

Google Sheet에 차량을 추가해도 GitHub 저장소의 이미지 폴더가 자동으로 생기지는 않습니다.

```txt
Google Sheet = 차량 텍스트 데이터 SSOT
public/vehicles = 차량 이미지 파일 SSOT
GitHub Actions = 시트를 읽고 사이트를 빌드하는 실행자
```

GitHub Actions는 배포용 빌드 서버에서 실행되므로, 새 이미지 폴더를 저장소에 남기려면 로컬에서 스캐폴드 명령을 실행하고 Git으로 올려야 합니다.

## 차량 1대 폴더 생성

PowerShell에서 프로젝트 폴더로 이동합니다.

```powershell
cd "D:\11124\car2"
```

차량ID와 차량명을 넣어서 실행합니다.

```powershell
npm run scaffold:vehicle -- --id avante-cn7-2022 --title "2022 현대 아반떼 CN7"
```

생성 결과:

```txt
public/vehicles/avante-cn7-2022/
├── README.md
├── .gitkeep
├── main.jpg.placeholder.txt
├── 01.jpg.placeholder.txt
├── 02.jpg.placeholder.txt
└── 03.jpg.placeholder.txt
```

실제 이미지는 같은 폴더에 아래 파일명으로 넣습니다.

```txt
main.jpg
01.jpg
02.jpg
03.jpg
```

placeholder txt 파일은 안내용이라 있어도 사이트에는 사용되지 않습니다.

## 전체 차량 폴더 생성/확인

현재 `public/data/vehicle-catalog.json`에 들어 있는 차량 전체를 기준으로 폴더를 만들려면:

```powershell
npm run scaffold:vehicles
```

## 스캐폴드 후 Git 업로드

```powershell
git add -A
git commit -m "add vehicle image folders"
git push origin main
```

## 한 줄 SSOT

```txt
시트에 차량을 추가한 뒤, 같은 차량ID로 npm run scaffold:vehicle을 실행해 public/vehicles/차량ID 폴더를 만들고 이미지를 넣은 뒤 Git에 올린다.
```

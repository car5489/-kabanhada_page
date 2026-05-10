$ErrorActionPreference = "Stop"

$repo = "car5489/-kabanhada_page"
$workflow = "pages.yml"
$ref = "main"

Write-Host ""
Write-Host "카반하다 시트 반영 배포를 실행합니다."
Write-Host "Repo: $repo"
Write-Host "Workflow: $workflow"
Write-Host "Branch: $ref"
Write-Host ""

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "GitHub CLI(gh)가 설치되어 있지 않습니다."
  Write-Host "설치 명령:"
  Write-Host "winget install --id GitHub.cli"
  Write-Host ""
  Write-Host "설치 후 로그인:"
  Write-Host "gh auth login"
  exit 1
}

gh auth status --hostname github.com | Out-Null

gh workflow run $workflow --repo $repo --ref $ref

Write-Host ""
Write-Host "GitHub Actions 실행 요청 완료."
Write-Host "최신 실행 목록:"
Write-Host ""

Start-Sleep -Seconds 3
gh run list --repo $repo --workflow $workflow --limit 3

Write-Host ""
Write-Host "실시간 로그 확인:"
Write-Host "gh run watch --repo $repo"

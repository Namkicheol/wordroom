# voca app — AGENTS.md (Codex)

Codex 작업의 1차 진입 문서. Claude Code는 `CLAUDE.md`를 사용한다. 두 파일은 도구 framing만 다르고 섹션·순서·규칙은 동일하게 유지한다. 새 규칙은 양쪽 모두 갱신한다.

## Codex 환경 운용

- 파일 탐색은 `rg` / `rg --files` 우선.
- 파일 수정은 `apply_patch` 우선. 임시 shell heredoc으로 파일을 만들지 않는다.
- Python 스크립트 작성 전 `python3 --version` 확인. 3.9 환경이면 PEP 604(`X | Y`) / PEP 585(`list[X]`) 문법을 피한다.
- 작업 전 `git status --short --branch`로 사용자 변경을 확인한다. 내가 만들지 않은 변경은 되돌리지 않는다.
- `git add .` / `git add -A` 금지. 수정한 파일만 명시 stage.
- commit message에 `Co-Authored-By: Claude...`를 넣지 않는다.
- merge/push는 사용자가 명시적으로 요청할 때만.

## 프로젝트

Word Smart, MD-VOCA, 보카바이블의 장점을 섞어 만드는 로컬-first 어휘 학습 앱. 원본 PDF는 단어 후보·구조 분석을 위한 내부 자료로만 쓰고, 학습 콘텐츠(예문·해설·기억장치·이미지)는 전부 새로 작성. 로컬 AI TTS로 단어/예문 음성을 캐시한다.

## 캐노니컬 스펙 (이 순서로 읽는다)

1. `PRD.md` — 목표, 데이터 모델, 파이프라인, MVP, 후속 트랙
2. `DESIGN.md` — UI 방향, 팔레트, 타이포, 컴포넌트 규칙
3. `FUTURE_WORK.md` — 임용 단어장 브랜치, 로컬 이미지 생성 트랙

이 세 파일이 단일 출처다. AGENTS.md / CLAUDE.md에 스펙을 재서술하지 않는다. 충돌 시 PRD/DESIGN/FUTURE_WORK가 우선.

## 작업 흐름

작업 시작 전 변경 범위를 한 종류로 좁힌다.

| 작업 영역 | 필독 | 출력 위치 |
|---|---|---|
| PDF → Markdown 추출 / headword 인덱스 / 중복 병합 / rewrite queue / similarity guard | `PRD.md` §7, `sources/extracted/manifest.json` | `scripts/`, `sources/normalized/` |
| 단어 카드 재작성 (예문·해설·memory hook·visual prompt) | `PRD.md` §4 저작권, §5 7-레이어, §6 데이터 모델 | JSON (모델 §6 스키마) |
| 로컬 TTS 어댑터 / 음성 생성 | `PRD.md` §2 TTS 방침, §7.2-6, §8.5 | `audio/words/*.mp3`, `audio/examples/*.mp3` |
| 이미지 카드 프롬프트 / 생성 | `PRD.md` §7.2-7, §8.6 | `images/cards/*.webp` |
| 앱 UI (학습/퀴즈/복습 화면) | `DESIGN.md` 전체, `PRD.md` §8 | `app/` |
| 임용 브랜치 / 이미지 대량 생성 트랙 | `FUTURE_WORK.md` | 별도 |

## 저작권 안전 원칙 (위반 시 즉시 중단)

`PRD.md` §4가 원본. 핵심만 다시 적는다.

- 원문 예문·해설·농담·암기 문구·이미지 설명·단원 배열을 그대로 복제하지 않는다.
- 영어 예문/한국어 해설/기억 장치/visual prompt는 전부 새로 작성.
- 원문과 8단어 이상 연속 일치하면 `blocked` 처리. similarity guard가 검출 못 하면 사람이 수기로 reject.
- `sources/extracted/*.md`는 내부 분석용. 학습 화면에 노출 금지.

## 한국어 용어 규칙

전역 `~/.codex/AGENTS.md` 또는 사용자 전역 지침의 "임용 관련 작업: 한국어 용어 규칙"을 따른다. 일반 학습 어휘에 한국어 표현이 자연스러우면 그대로 사용. 임용 브랜치(`FUTURE_WORK.md`) 작업에 들어가면 합격자 노트/강사 교재/기출 원문에 등장한 한국어 표현만 사용.

## 외과적 수정

- 사용자가 요청한 파일과 직접 관련된 코드만 수정한다.
- 관련 없는 리팩터링, 디자인 전면 개편, 새 의존성 추가 금지.
- 본인이 만든 미사용 import/변수만 정리. 기존 죽은 코드는 발견만 보고하고 삭제 X.
- 변경된 모든 줄은 사용자 요청으로 직접 추적되어야 한다.

## 검증

- Python 스크립트: `python3 --version` 확인 후 작은 샘플 dry-run.
- 데이터 작성: `PRD.md` §6 스키마 필드명·구조 그대로. `content_status`, `copyright_status` 필드 채운다.
- 앱 UI: `DESIGN.md` 팔레트/타이포/레이아웃 규칙 위반 시 즉시 수정. 녹색 primary accent 금지, 큰 보라/파랑 그라데이션 금지.
- 음성/이미지 파일: 같은 단어 재생성 전 캐시 확인.

## Git

- iCloud Drive 경로 + 한글 파일명. macOS NFD/NFC 차이 주의 (정규식·diff 전 NFC 정규화 고려).
- 변경 파일만 명시 stage. `git add .` / `git add -A` 금지.
- merge/push는 사용자가 명시적으로 지시할 때만.

## 묻지 않는 영역 / 묻는 영역

기본은 묻지 말고 알아서 처리. 다음만 묻는다.

- TTS 엔진 최종 선정 (`PRD.md` §2가 후보 비교를 명시)
- 학습 모드 확정 (퀴즐렛식/OX/플래시카드 등 — `PRD.md` §8.3이 "리서치 후 확정"으로 둠)
- 되돌릴 수 없는 데이터 삭제, force push

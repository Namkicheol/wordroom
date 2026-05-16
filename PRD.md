# Voca App PRD

## 1. 목표

이 앱은 Word Smart, MD-VOCA, 보카바이블의 장점을 섞어 새 단어장을 만드는 로컬-first 어휘 학습 앱이다. 원본 단어장은 단어 후보와 구조 분석을 위한 내부 자료로만 사용하고, 최종 학습 콘텐츠는 우리 방식으로 새로 쓴다.

핵심 목표는 단어 하나를 단순 뜻 암기가 아니라 다음 흐름으로 익히게 하는 것이다.

1. 단어와 핵심 뜻을 빠르게 본다.
2. 어원/형태소로 납득한다.
3. 실제적인 새 예문으로 사용감을 잡는다.
4. 로컬 AI TTS로 단어 발음과 예문 음성을 반복해서 듣는다.
5. 유의어/반의어/뉘앙스를 비교한다.
6. 기억 장치와 시각 이미지로 오래 붙잡는다.
7. 퀴즐렛식 훈련, OX, 랜덤 플래시카드, 섹션별 플래시카드로 반복한다.

## 2. 현재 자료

원본 PDF 위치:

```text
/Users/namgicheol/Library/Mobile Documents/com~apple~CloudDocs/Developments/voca app
```

확인된 PDF:

| 파일 | 페이지 | 추출 문자 수 | 빈 페이지 수 | 1차 판단 |
| --- | ---: | ---: | ---: | --- |
| `MD-VOCA_1_K1.pdf` | 626 | 1,451,047 | 6 | 어원/동의어 묶음 후보 추출에 유용 |
| `보카바이블 A권 (4th)OCR.pdf` | 500 | 855,716 | 9 | Top words, synonym/theme 구조 참고 가능. 한국어 OCR 깨짐 많음 |
| `보카바이블 B권 (4th)OCR.pdf` | 642 | 1,509,822 | 10 | etymology, idiom, synonym/theme 구조 참고 가능. 한국어 OCR 깨짐 많음 |
| `워드스마트 통합본 (넥서스)_ocr.pdf` | 755 | 1,746,408 | 12 | 영어 headword와 예문 흐름이 비교적 잘 살아 있음 |

Markdown 추출 결과:

```text
sources/extracted/md-voca-1-k1.md
sources/extracted/voca-bible-a-4th-ocr.md
sources/extracted/voca-bible-b-4th-ocr.md
sources/extracted/word-smart-nexus-ocr.md
sources/extracted/manifest.json
```

변환 스크립트:

```text
scripts/extract_wordbook_to_md.py
```

로컬 AI TTS 선정 방침:

- 최종 TTS 엔진은 지금 고정하지 않는다.
- GitHub에서 최근 인기가 많고 반응이 좋은 로컬 AI TTS를 조사한 뒤 선택한다.
- 선정 기준은 최근 star 증가, issue/PR 활동, macOS 로컬 실행 난이도, 영어 발음 품질, 속도, 라이선스, 오프라인 사용성이다.
- Kokoro/Piper 계열은 예시 후보일 뿐이며, 더 나은 최근 프로젝트가 있으면 그쪽을 우선 검토한다.
- 최종 구현은 특정 엔진에 묶지 않고 `tts_adapter` 인터페이스로 분리한다.

## 3. 책별 장점 분석

### 3.1 Word Smart

장점:

- headword 중심 설명이 명확하다.
- 영어 예문이 실제 문맥처럼 살아 있다.
- 단어가 문장 속에서 어떻게 움직이는지 보여준다.

주의:

- 원문 예문은 최종 앱에 그대로 쓰지 않는다.
- 예문 스타일만 참고하고, 모든 예문은 새로 작성한다.
- OCR에서 한국어/특수문자 깨짐이 있어 영어 headword와 예문 후보 위주로 읽는다.

### 3.2 MD-VOCA

장점:

- 어원, 접두사, 접미사, 형태소 중심 학습에 강하다.
- 유의어/반의어 묶음 후보가 많다.
- 단어를 구조적으로 분류하는 데 좋다.

주의:

- 어원 설명 문장은 그대로 쓰지 않는다.
- 어근 정보는 검수 후 짧은 Wordroom식 설명으로 재작성한다.
- OCR 첫 페이지 일부는 잡음이 많으므로 본문 중심으로 파싱한다.

### 3.3 보카바이블

장점:

- 동의어, 유의어, theme words, idiom, etymology 구성이 풍부하다.
- 기억 장치와 시각화 학습 아이디어를 제품 기능으로 반영하기 좋다.
- 단어를 시험/빈도/테마 단위로 묶는 방식이 강하다.

주의:

- 농담, 암기 문구, 이미지 설명은 그대로 쓰지 않는다.
- 한국어 OCR 깨짐이 많으므로 원문 문장 복제 위험도 낮지만, 품질 검수가 필수다.
- 편집 배열을 그대로 복제하지 않고 앱 자체의 난이도/어원/복습 기준으로 재배열한다.

## 4. 저작권 안전 원칙

가져올 수 있는 것:

- 영어 단어
- 품사
- 일반적인 뜻
- 어근/접두사/접미사 같은 사실성 정보
- 유의어 후보
- 출처와 페이지 같은 내부 검수용 메타데이터

가져오면 안 되는 것:

- 원문 예문
- 원문 해설
- 원문 농담/암기 문구
- 원문 이미지 설명
- 원문 단원 배열과 제목 체계의 고유한 조합
- OCR 추출 Markdown을 그대로 학습 화면에 노출하는 것

최종 카드 규칙:

- 영어 예문은 새로 쓴다.
- 한국어 해설은 짧고 실용적으로 새로 쓴다.
- 기억 장치와 시각 이미지는 새로 만든다.
- 원문과 8단어 이상 연속 일치하면 blocked 처리한다.
- 원본 Markdown은 내부 분석 자료로만 유지한다.

## 5. 제품 컨셉

단어 카드는 7개 레이어로 구성한다.

1. Core
   - 단어, 발음, 품사, 핵심 뜻

2. Audio
   - 단어 발음
   - 예문 음성
   - 느린 속도/보통 속도
   - 미국식/영국식 음성 확장 가능

3. Root
   - 어근/접사
   - 단어가 왜 그 뜻이 되는지 짧게 설명

4. Living Example
   - 원어민스럽지만 새로 작성한 예문
   - 시험문장보다 실제 사용감 우선

5. Word Network
   - 유의어
   - 반의어
   - 헷갈리는 단어
   - 뉘앙스 차이

6. Memory Image
   - 기억용 한 줄 장면
   - 약간 웃긴 연결
   - 보카바이블식 이미지 학습을 앱 고유 이미지로 재구성
   - 이미지 생성/일러스트로 확장 가능한 프롬프트

7. Practice
   - 퀴즐렛식 카드 학습, OX, 객관식, 예문 빈칸, 랜덤/섹션 플래시카드 등을 후보로 둔다.
   - 정확한 퀴즈/학습 설계는 추후 더 조사한 뒤 확정한다.

## 6. 데이터 모델

최종 앱 데이터는 다음 구조를 목표로 한다.

```json
{
  "id": "abate",
  "word": "abate",
  "pronunciation": "/əˈbeɪt/",
  "pos": "verb",
  "level": "core",
  "core_meaning_ko": "약해지다; 줄이다",
  "meaning_layers": [
    "강도나 양이 점점 줄어드는 느낌",
    "고통, 비, 바람, 세금, 처벌 등에 자주 쓰임"
  ],
  "roots": [
    {
      "part": "a-/ab-",
      "meaning": "down, away",
      "note": "강도가 아래로 내려가는 방향감"
    }
  ],
  "examples": [
    {
      "id": "abate-example-1",
      "en": "The noise finally abated after midnight.",
      "ko": "소음은 자정이 지나서야 마침내 잦아들었다.",
      "audio": {
        "normal": "audio/examples/abate-example-1.normal.mp3",
        "slow": "audio/examples/abate-example-1.slow.mp3"
      }
    }
  ],
  "audio": {
    "word_us": "audio/words/abate.us.mp3",
    "word_uk": "audio/words/abate.uk.mp3",
    "engine": "local-tts",
    "voice": "default-us"
  },
  "synonyms": [
    {
      "word": "subside",
      "difference_ko": "감정, 통증, 물결 등이 가라앉는 느낌"
    },
    {
      "word": "diminish",
      "difference_ko": "크기나 중요성이 줄어드는 일반적 표현"
    }
  ],
  "antonyms": ["intensify", "increase"],
  "memory_hook_ko": "소음 게이지가 아래로 내려가며 조용해지는 장면",
  "visual_prompt_ko": "밤거리의 소음 그래프가 천천히 내려가고 창문 불빛이 하나씩 꺼지는 장면",
  "image": {
    "src": "images/cards/abate.webp",
    "alt_ko": "밤거리 소음 그래프가 내려가는 장면",
    "status": "draft"
  },
  "sections": ["core-001", "root-ab", "daily-sound"],
  "practice": {
    "quizlet_card": true,
    "ox": true,
    "multiple_choice": true,
    "flashcard_random": true,
    "flashcard_section": true,
    "example_blank": true
  },
  "source_refs": [
    "word-smart-nexus-ocr:page10",
    "md-voca-1-k1:page"
  ],
  "content_status": "draft",
  "copyright_status": "rewritten"
}
```

## 7. Python 파이프라인

### 7.1 완료

- PDF 4권 확인
- `scripts/extract_wordbook_to_md.py` 작성
- PDF 전체를 page-based Markdown으로 추출
- `sources/extracted/manifest.json` 생성

### 7.2 다음 단계

1. headword 후보 추출
   - Word Smart: 대문자 headword 패턴 우선
   - MD-VOCA: 소문자 word list와 synonym line 후보 추출
   - 보카바이블: `TOP`, `ETYMOLOGY`, `IDIOM`, `SYNONYM`, `THEME` 주변 영어 단어 후보 추출

2. raw word index 생성
   - 출력: `sources/normalized/raw_word_index.json`
   - 필드: word, source, page, nearby_text, confidence

3. 중복 병합
   - 같은 단어가 여러 책에 나오면 하나로 합침
   - source별 강점 태그 부여

4. rewrite queue 생성
   - 출력: `sources/normalized/rewrite_queue.json`
   - 앱에 들어가기 전 새 예문/새 해설/새 memory hook 작성 대기열

5. similarity guard
   - 최종 예문/해설과 원문 Markdown의 n-gram 겹침 검사
   - 일정 기준 이상이면 `blocked`

6. local TTS generation
   - 단어 발음과 예문 문장을 로컬 TTS로 생성
   - 출력: `audio/words/*.mp3`, `audio/examples/*.mp3`
   - 각 음성 파일은 engine, voice, speed, generated_at 메타데이터를 가진다.
   - 앱은 음성 파일이 있으면 캐시 파일을 재생하고, 없으면 생성 큐에 넣는다.
   - TTS 엔진 선정 전까지는 어댑터 인터페이스와 샘플 생성 파이프라인만 먼저 만든다.

7. image card generation
   - 각 단어의 `visual_prompt_ko`를 바탕으로 앱 고유 이미지를 만든다.
   - 보카바이블 이미지 아이디어는 그대로 복제하지 않고, 기억 원리만 반영한다.
   - 출력: `images/cards/*.webp`
   - 이미지가 없으면 텍스트 visual scene을 먼저 표시한다.

## 8. 앱 기능 요구사항

### 8.1 Import

- JSON import 기능
- 중복 단어 병합
- 학습 기록 유지
- `draft`, `reviewed`, `published`, `blocked` 상태 표시

### 8.2 학습 화면

- 단어 목록
- 검색/필터
- 상세 카드
- 단어 발음 재생 버튼
- 예문 음성 재생 버튼
- 어원 탭
- 예문 탭
- 유의어 탭
- 기억 이미지 탭
- 섹션 선택 화면
- 학습 세트 진행률

### 8.3 퀴즈

아래 항목은 확정 요구사항이 아니라 추후 리서치할 학습 모드 후보이다.

- 퀴즐렛식 모드: 카드 넘기기, 뜻 확인, 아는 단어/모르는 단어 분류
- 랜덤 플래시카드: 전체 published 단어에서 무작위 진행
- 섹션 플래시카드: day, root, theme, difficulty 단위로 진행
- OX 퀴즈: 뜻, 품사, 유의어, 어원, 예문 사용 가능 여부 판단
- 뜻 고르기
- 예문 빈칸
- 유의어 뉘앙스 고르기
- 어근 의미 고르기
- 기억 이미지 보고 단어 맞히기
- 듣고 단어 맞히기
- 듣고 예문 빈칸 채우기

### 8.4 복습

- 틀린 단어 우선
- 오래 안 본 단어 우선
- 유의어 혼동 단어 묶음 복습
- 어근별 복습
- 음성 듣기 취약 단어 복습
- 이미지 보고 못 맞힌 단어 복습

### 8.5 로컬 AI 음성

- 단어 발음과 예문 음성은 로컬 TTS로 생성한다.
- 최종 TTS는 GitHub에서 최근 인기가 많고 사용자 반응이 좋은 로컬 AI TTS를 조사한 뒤 선택한다.
- Kokoro/Piper 계열은 예시 후보이며, 확정 엔진이 아니다.
- 선정 시 최근 star 증가, release/commit 활동, issue 반응, macOS 설치 난이도, 영어 발음 품질, 생성 속도, 라이선스를 함께 본다.
- 앱 코드는 TTS 엔진을 직접 의존하지 않고 `tts_adapter`를 통해 호출한다.
- 생성된 음성은 파일로 저장해서 반복 재생 시 다시 생성하지 않는다.
- 단어 발음은 최소 1개 음성, 예문은 normal/slow 2개 속도를 목표로 한다.
- TTS 품질이 낮은 단어는 수동 재생성 또는 다른 voice로 교체할 수 있어야 한다.

### 8.6 이미지 카드

- 각 단어는 보카바이블식 시각 기억 장치를 갖되, 이미지는 앱 고유 자산으로 만든다.
- 이미지 카드에는 단어, 핵심 뜻, visual scene, 이미지가 함께 보인다.
- 이미지가 아직 없으면 visual scene 텍스트를 먼저 보여준다.
- 이미지 생성/삽입은 `draft`, `reviewed`, `published` 상태를 가진다.

## 9. MVP 범위

MVP에 포함:

- PDF to Markdown 추출
- raw headword index 생성
- 100개 단어 샘플 재작성
- 100개 단어 발음 음성 생성
- 100개 대표 예문 normal/slow 음성 생성
- 100개 이미지 카드 프롬프트 작성
- 최소 20개 이미지 카드 제작
- JSON import
- 확장 단어 카드 UI
- 기본 플래시카드
- 기본 뜻 퀴즈
- 퀴즐렛식/OX/랜덤/섹션별 학습 모드는 추후 리서치 후 MVP 포함 여부 확정
- 저작권 상태 필드

MVP에서 제외:

- 서버 로그인
- 결제
- 자동 대량 배포
- 원본 PDF 뷰어
- 원문 예문 그대로 표시
- 무검수 대량 이미지 자동 생성

## 10. 성공 기준

- PDF 4권에서 headword 후보를 안정적으로 뽑는다.
- 중복 제거 후 최소 3,000개 이상의 단어 후보 인덱스를 만든다.
- 우선순위 100개 단어를 Wordroom식 카드로 재작성한다.
- 우선순위 100개 단어의 단어 발음과 예문 음성이 로컬 생성 파일로 연결된다.
- 최소 20개 단어는 이미지 카드까지 학습 화면에서 확인된다.
- 앱에서 JSON import 후 기본 카드/기본 퀴즈가 정상 동작한다.
- 퀴즐렛식, OX, 랜덤 플래시카드, 섹션별 플래시카드는 별도 리서치 후 성공 기준을 확정한다.
- published 카드에는 원문 예문/해설이 남아 있지 않다.

## 11. 바로 다음 작업

1. `scripts/build_raw_word_index.py` 작성
2. `sources/extracted/*.md`에서 headword 후보 추출
3. `sources/normalized/raw_word_index.json` 생성
4. GitHub에서 최근 인기/반응 좋은 로컬 AI TTS 후보를 조사하고 비교표 작성
5. 선택 후보 1개로 단어/예문 음성 5개 샘플 생성
6. 상위 30개 단어를 읽고 카드 포맷 샘플 작성
7. 이미지 카드 프롬프트 샘플 10개 작성
8. 퀴즈/학습 모드는 별도 리서치 후 상세 PRD 업데이트
9. 현재 웹 앱에 JSON import, 확장 카드 UI, 음성 재생 추가

## 12. 후속 트랙

- 교원임용고시 단어장 브랜치: 현재 단어 소스를 기반으로 `testmaster` 레포의 임용 기출 자료를 연결해 기출 등장 단어 표시와 임용고시 출제 예문을 제공한다. 상세는 `FUTURE_WORK.md`에 저장한다.
- 로컬 AI 이미지 생성 트랙: 1만 개 이상의 단어 이미지 카드를 감당하기 위해 무료/로컬 이미지 생성, 파일 캐시, 우선순위 생성 큐를 사용한다. 모든 단어를 즉시 생성하지 않고 Daily/core/기출/혼동 단어 순으로 생성한다. 상세는 `FUTURE_WORK.md`에 저장한다.

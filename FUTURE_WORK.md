# Future Work

## 교원임용고시 단어장 브랜치

목표: 현재 Voca App 단어 소스를 기반으로 교원임용고시 특화 단어장을 별도 브랜치/트랙으로 만든다.

핵심 아이디어:

- 현재 PDF 단어장 소스에서 추출한 단어 후보를 기본 어휘 풀로 사용한다.
- `testmaster` 레포의 기출 자료를 연결해 임용 기출 등장 단어를 표시한다.
- 예문은 일반 예문이 아니라 임용고시 출제 예문 또는 기출 맥락 기반 예문을 우선 사용한다.
- 원문 기출 예문을 사용할 때는 출처, 연도, 문항 정보를 함께 표시한다.
- 기존 상업 단어장의 예문/해설/암기 문구는 그대로 사용하지 않는다.

예상 데이터 필드:

```json
{
  "word": "example",
  "exam_track": "teacher-certification",
  "appeared_in_exam": true,
  "exam_refs": [
    {
      "repo": "testmaster",
      "year": 2024,
      "exam": "A",
      "question": "A06"
    }
  ],
  "exam_example": {
    "en": "",
    "ko": "",
    "source": "testmaster"
  }
}
```

진행 시점:

- Phase 1 기본 파이프라인과 기본 페이지 검증 후 진행한다.
- `testmaster` 레포의 실제 JSON/기출 인덱스 구조를 먼저 확인한 뒤 별도 계획을 세운다.

## 로컬 AI 이미지 생성 트랙

목표: 1만 개 이상의 단어에 이미지 기억 카드를 붙일 수 있도록 무료/로컬 중심 이미지 생성 파이프라인을 만든다.

원칙:

- 유료 API로 1만 개 이미지를 한 번에 생성하지 않는다.
- 로컬 AI 이미지 생성기를 조사해 macOS에서 무료로 돌릴 수 있는 후보를 고른다.
- 이미지는 단어별로 한 번 생성한 뒤 `images/cards/`에 캐시한다.
- 모든 단어를 즉시 생성하지 않고 우선순위 큐로 나눈다.
  - 1순위: Daily deck 단어
  - 2순위: 핵심 빈출 단어
  - 3순위: 헷갈리는 유의어/반의어 묶음
  - 4순위: 교원임용고시 기출 등장 단어
- 보카바이블식 이미지 기억 원리는 참고하되, 이미지 내용과 문구는 앱 고유 자산으로 새로 만든다.

예상 출력:

```text
images/cards/abate.webp
images/cards/abdicate.webp
sources/normalized/image_manifest.json
```

예상 메타데이터:

```json
{
  "word": "abate",
  "prompt_ko": "소음 게이지가 천천히 내려가는 밤거리 장면",
  "image_path": "images/cards/abate.webp",
  "generator": "local-ai",
  "status": "reviewed"
}
```

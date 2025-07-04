# 100x Daily Wrap → PDF Chrome Extension

**고품질 HTML to PDF 변환기** - 100x Daily Wrap 템플릿과 웹페이지를 Chrome headless 엔진으로 완벽하게 PDF 변환

## 🚀 주요 기능

- **🧠 자동 최적화**: 템플릿 타입을 감지하여 최적의 설정으로 변환
- **⚙️ 수동 조정**: 배율, 글꼴 크기, 마진을 세밀하게 조정 가능
- **📄 스마트 파일명**: 날짜와 콘텐츠 기반 자동 파일명 생성
- **🔄 중복 처리**: 동일 파일명 시 자동으로 (1), (2) 추가
- **💎 Chrome headless 품질**: 웹에서 보는 것과 동일한 고품질 PDF

## 📁 프로젝트 구조

```
html-to-pdf-extension/
├── manifest.json          # 확장 프로그램 설정
├── popup.html            # 사용자 인터페이스
├── popup.js              # 핵심 변환 로직
├── popup.css             # 깔끔한 흰색 디자인
└── icon.png              # 확장 프로그램 아이콘 (128x128)
```

## 🛠️ 설치 방법

### 1. 파일 준비
```bash
git clone [your-repository-url]
cd html-to-pdf-extension
```

### 2. Chrome 확장 프로그램 설치
1. **Chrome 브라우저**에서 주소창에 입력:
   ```
   chrome://extensions/
   ```

2. **개발자 모드** 활성화 (우측 상단 토글)

3. **"압축해제된 확장 프로그램 로드"** 클릭

4. **프로젝트 폴더 선택** (`html-to-pdf-extension` 폴더)

### 3. 코드 수정 시 업데이트
**파일을 수정한 후**에는 삭제/재설치 불필요:

1. `chrome://extensions/` 접속
2. 해당 확장의 **🔄 새로고침** 버튼 클릭
3. 즉시 변경사항 적용 완료

## 💻 사용법

### **기본 사용**
1. **변환할 웹페이지** 또는 **로컬 HTML 파일** 열기
2. Chrome 툴바에서 **확장 프로그램 아이콘** 클릭
3. 원하는 변환 모드 선택:
   - **🧠 자동 최적화**: 콘텐츠 타입 자동 감지
   - **🚀 기본 변환**: 범용 설정으로 빠른 변환
   - **⚙️ 수동 조정**: 세밀한 커스터마이징

### **설정 옵션**
| 설정 | 옵션 | 설명 |
|------|------|------|
| **배율** | 70% ~ 110% | 페이지 확대/축소 비율 |
| **글꼴 크기** | 10px ~ 14px | 텍스트 크기 조정 |
| **마진** | 최소/보통/넓게 | 페이지 여백 설정 |

## 🎯 특화 기능

### **Daily Wrap 템플릿 최적화**
- **복잡한 테이블 구조** 자동 감지
- **Multi-Asset Performance** 테이블 최적화
- **금융 데이터** 전용 스케일링

### **스마트 파일명 생성**
```javascript
// 자동 생성 예시
100x-Daily-Wrap-2025-07-04.pdf
Market-Analysis-2025-07-04.pdf
Document-2025-07-04.pdf
```

## 🔧 핵심 코드

### **manifest.json** 설정
```json
{
  "name": "100x Daily Wrap → PDF (Ultimate)",
  "description": "100x Daily Wrap 템플릿을 고품질 PDF로 변환",
  "version": "2.0",
  "manifest_version": 3,
  "permissions": ["debugger", "downloads", "tabs", "activeTab", "scripting"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon.png",
      "48": "icon.png", 
      "128": "icon.png"
    }
  }
}
```

### **핵심 변환 로직**
```javascript
// Chrome DevTools Protocol 사용
const {data} = await chrome.debugger.sendCommand(target, 'Page.printToPDF', {
  scale: 1.0,
  marginTop: 0.5,
  marginBottom: 0.5,
  marginLeft: 0.5,
  marginRight: 0.5,
  printBackground: true,
  preferCSSPageSize: true
});
```

## 🐛 문제 해결

### **"Cannot read properties of undefined" 오류**
- **해결**: `manifest.json`에 `"scripting"` 권한이 포함되어 있는지 확인
- **권한**: `["debugger", "downloads", "tabs", "activeTab", "scripting"]`

### **PDF 품질 이슈**
- **권장**: Chrome headless 방식으로 최고 품질 보장
- **배율 조정**: 복잡한 테이블은 85-90% 권장

### **파일명 중복**
- **자동 처리**: Chrome의 `conflictAction: 'uniquify'`로 자동 해결
- **결과**: `document.pdf` → `document (1).pdf`

## ⚡ 성능 최적화

### **이중 안전장치**
```javascript
// chrome.scripting 실패 시 chrome.debugger로 자동 대체
try {
  const [{result}] = await chrome.scripting.executeScript({...});
} catch (scriptingError) {
  const {result} = await chrome.debugger.sendCommand({...});
}
```

### **메모리 효율성**
- **Blob URL 자동 해제**
- **디버거 세션 안전한 종료**
- **CSS 최적화로 렌더링 속도 향상**

## 📋 지원 포맷

| 입력 | 출력 | 품질 |
|------|------|------|
| **웹페이지** | PDF | ⭐⭐⭐⭐⭐ |
| **로컬 HTML** | PDF | ⭐⭐⭐⭐⭐ |
| **복잡한 테이블** | PDF | ⭐⭐⭐⭐⭐ |
| **금융 템플릿** | PDF | ⭐⭐⭐⭐⭐ |

## 🤝 기여 방법

1. **Fork** 프로젝트
2. **Feature 브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **변경사항 커밋** (`git commit -m 'Add amazing feature'`)
4. **브랜치 Push** (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

**💡 Tip**: 템플릿이 자주 바뀌어도 **자동 최적화** 기능으로 항상 최적의 결과를 얻을 수 있습니다!

[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/58009115/81e244de-f946-4b7c-a06a-fc06ce0bcae7/popup.css
[2] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/58009115/b0353c3a-7247-4e6a-9dea-5f9080dacd3e/popup.html
[3] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/58009115/844928cd-9b9a-480b-9a47-5d9788448e8d/popup.js
[4] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/58009115/88316df0-8a8b-4d73-8609-63b07d00706a/manifest.json
[5] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/58009115/3a04914a-d891-47df-ab7c-132f0f9daf39/10_100x_Daily_Wrap_Template_4.html
[6] https://pplx-res.cloudinary.com/image/private/user_uploads/58009115/b5b9c6cf-0f85-4919-b19a-bd9302b5391c/image.jpg
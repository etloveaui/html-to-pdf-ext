// 🧠 스마트 배율 감지 및 최적화
const SMART_OPTIMIZER = {
  // 컨텐츠 타입별 최적 설정
  detectContentType: (content, title) => {
    if (content.includes('Multi-Asset Performance') || content.includes('100x Liquidity')) {
      return 'daily-wrap-complex';
    }
    if (content.includes('S&P 500') || content.includes('Today\'s Thesis')) {
      return 'daily-wrap-standard';
    }
    return 'generic';
  },

  // 자동 스케일링 CSS 생성
  generateOptimizedCSS: (contentType, customScale, customFont, customMargin) => {
    const presets = {
      'daily-wrap-complex': { zoom: 0.85, fontSize: '11px', lineHeight: '1.2' },
      'daily-wrap-standard': { zoom: 0.92, fontSize: '12px', lineHeight: '1.3' },
      'generic': { zoom: 0.95, fontSize: '12px', lineHeight: '1.4' }
    };

    const preset = presets[contentType] || presets.generic;
    const zoom = customScale === 'auto' ? preset.zoom : parseFloat(customScale);
    const fontSize = customFont ? `${customFont}px` : preset.fontSize;
    
    const margins = {
      'minimal': '0.2cm',
      'normal': '0.5cm', 
      'wide': '0.8cm'
    };
    const margin = margins[customMargin || 'normal'];

    return `
      <style id="smart-pdf-optimizer">
        @page { 
          size: A4; 
          margin: ${margin}; 
        }
        @media print {
          html, body { 
            zoom: ${zoom} !important;
            font-size: ${fontSize} !important;
            line-height: ${preset.lineHeight} !important;
          }
          h1, h2, h3 { 
            font-size: ${parseInt(fontSize) + 2}px !important;
            margin: 8px 0 !important;
            line-height: 1.2 !important;
          }
          table { 
            font-size: ${parseInt(fontSize) - 1}px !important;
            border-collapse: collapse !important;
          }
          table td, table th {
            padding: 3px 6px !important;
            vertical-align: top !important;
          }
          p, div { 
            margin: 3px 0 !important; 
          }
          .page-break { 
            page-break-before: always !important; 
          }
        }
      </style>
    `;
  }
};

// 파일명 생성 (날짜 자동 추가)
function generateFileName(title, content) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  
  if (content.includes('100x Daily Wrap') || content.includes('100x Liquidity')) {
    return `100x-Daily-Wrap-${dateStr}.pdf`;
  }
  if (content.includes('Market Report') || content.includes('S&P 500')) {
    return `Market-Analysis-${dateStr}.pdf`;
  }
  return `Document-${dateStr}.pdf`;
}

// 🧠 스마트 자동 최적화
document.getElementById('smartSave').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  
  // 페이지 내용 분석
  const [{result: pageContent}] = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: () => document.body.innerText
  });

  const contentType = SMART_OPTIMIZER.detectContentType(pageContent, tab.title);
  const optimizedCSS = SMART_OPTIMIZER.generateOptimizedCSS(contentType);
  
  await convertToPDF({
    css: optimizedCSS,
    settings: { scale: 1.0, marginTop: 0.5, marginBottom: 0.5, marginLeft: 0.5, marginRight: 0.5 }
  }, 'smart', tab);
});

// 🚀 기본 빠른 변환
document.getElementById('quickSave').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  const defaultCSS = SMART_OPTIMIZER.generateOptimizedCSS('daily-wrap-standard');
  
  await convertToPDF({
    css: defaultCSS,
    settings: { scale: 1.0, marginTop: 0.5, marginBottom: 0.5, marginLeft: 0.5, marginRight: 0.5 }
  }, 'quick', tab);
});

// ⚙️ 설정 토글
document.getElementById('customSave').addEventListener('click', () => {
  const settings = document.getElementById('settings');
  settings.classList.toggle('hidden');
});

// ⚙️ 수동 설정 변환
document.getElementById('saveWithSettings').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  const scale = document.getElementById('scale').value;
  const fontSize = document.getElementById('fontSize').value;
  const margin = document.getElementById('margin').value;
  
  const customCSS = SMART_OPTIMIZER.generateOptimizedCSS('custom', scale, fontSize, margin);
  
  await convertToPDF({
    css: customCSS,
    settings: { scale: 1.0, marginTop: 0.5, marginBottom: 0.5, marginLeft: 0.5, marginRight: 0.5 }
  }, 'custom', tab);
});

// 🔥 핵심 변환 함수
async function convertToPDF(options, mode, tab) {
  const target = {tabId: tab.id};
  const status = document.getElementById('status');

  try {
    const modeText = {
      'smart': '🧠 자동 최적화',
      'quick': '🚀 빠른 변환', 
      'custom': '⚙️ 맞춤 변환'
    };
    
    status.textContent = `${modeText[mode]} 중...`;
    
    await chrome.debugger.attach(target, '1.3');

    // CSS 주입으로 스마트 최적화
    await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
      expression: `
        // 기존 최적화 CSS 제거
        const existing = document.getElementById('smart-pdf-optimizer');
        if (existing) existing.remove();
        
        // 새 최적화 CSS 적용
        const style = document.createElement('div');
        style.innerHTML = \`${options.css.replace(/\n/g, '').replace(/`/g, '\\`')}\`;
        document.head.appendChild(style.firstElementChild);
        
        // 페이지 내용 분석
        const pageInfo = {
          hasLargeTables: document.querySelectorAll('table').length > 2,
          hasComplexLayout: document.body.innerText.length > 3000,
          contentHeight: document.body.scrollHeight
        };
        pageInfo;
      `
    });

    // PDF 생성
    const {data} = await chrome.debugger.sendCommand(target, 'Page.printToPDF', {
      ...options.settings,
      printBackground: true,
      preferCSSPageSize: true
    });

    // 파일 다운로드
    const [{result: pageContent}] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => document.body.innerText
    });

    const byteArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([byteArray], {type: 'application/pdf'}));
    const filename = generateFileName(tab.title, pageContent);

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: mode === 'custom'  // 수동 설정일 때만 저장 대화상자
    });

    status.textContent = `${modeText[mode]} 완료! 📄`;
    
  } catch (err) {
    status.textContent = `❌ 실패: ${err.message}`;
    console.error('PDF 변환 오류:', err);
  } finally {
    try { await chrome.debugger.detach(target); } catch {}
  }
}

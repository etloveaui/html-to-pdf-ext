// 🧠 스마트 배율 감지 및 최적화
const SMART_OPTIMIZER = {
  detectContentType: (content, title) => {
    if (content.includes('Multi-Asset Performance') || content.includes('100x Liquidity')) {
      return 'daily-wrap-complex';
    }
    if (content.includes('S&P 500') || content.includes('Today\'s Thesis')) {
      return 'daily-wrap-standard';
    }
    return 'generic';
  },

  // 🔥 DOM 조작 방식으로 변경 - 실제 배율 설정
  getScaleSettings: (contentType, customScale, customFont, customMargin) => {
    const presets = {
      'daily-wrap-complex': { scale: 0.85, fontSize: '11px' },
      'daily-wrap-standard': { scale: 0.92, fontSize: '12px' },
      'generic': { scale: 0.95, fontSize: '12px' }
    };

    const preset = presets[contentType] || presets.generic;
    const scale = customScale === 'auto' ? preset.scale : parseFloat(customScale);
    const fontSize = customFont ? `${customFont}px` : preset.fontSize;
    
    const margins = {
      'zero':   { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
      'minimal':{ top: 0.2, bottom: 0.2, left: 0.3, right: 0.3 },
      'normal': { top: 0.4, bottom: 0.4, left: 0.5, right: 0.5 },
      'wide':   { top: 0.6, bottom: 0.6, left: 0.8, right: 0.8 },
      'extra-wide': { top: 2.0, bottom: 2.0, left: 2.0, right: 2.0 }
    };
    const margin = margins[customMargin || 'normal'];

    return { scale, fontSize, margin };
  }
};

// 스마트 파일명 생성
function generateSmartFileName(title, content) {
  let baseName = title.replace(/\.html?$/i, '').replace(/[^\w\s-]/g, '').trim() || 'Document';
  if (content.includes('100x Daily Wrap') || content.includes('100x Liquidity')) {
    baseName = '100x-Daily-Wrap';
  } else if (content.includes('Market Report') || content.includes('S&P 500')) {
    baseName = 'Market-Analysis';
  }
  const today = new Date().toISOString().slice(0, 10);
  return `${baseName}-${today}.pdf`;
}

// 페이지 내용 가져오기 (이중 안전장치)
async function getPageContent(tab) {
  try {
    const [{result}] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => document.body.innerText
    });
    return result;
  } catch (e) {
    console.warn("Scripting API 실패, Debugger API로 대체합니다.");
    const target = {tabId: tab.id};
    await chrome.debugger.attach(target, '1.3');
    const {result} = await chrome.debugger.sendCommand(target, 'Runtime.evaluate', { 
      expression: 'document.body.innerText' 
    });
    await chrome.debugger.detach(target);
    return result.value;
  }
}

// 🔥 핵심 변환 함수 (DOM 직접 조작 방식)
async function convertToPDF(settings, mode, tab, pageContent) {
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

    const scaleValue = settings.scale;
    const fontSize = settings.fontSize;
    
    await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
      expression: `
        (function() {
          const existingStyle = document.getElementById('pdf-scale-optimizer');
          if (existingStyle) existingStyle.remove();
          
          const style = document.createElement('style');
          style.id = 'pdf-scale-optimizer';
          style.innerHTML = \`
            @media print {
              @page {
                size: A4;
                margin: ${settings.margin.top}cm ${settings.margin.right}cm ${settings.margin.bottom}cm ${settings.margin.left}cm;
              }

              /* --- 페이지 나눔 및 공백 최적화 --- */
              body, div, section, article, header, footer {
                break-before: auto !important;
                break-after: auto !important;
              }
              h1, h2, h3, h4, h5, h6, figure, img, table, ul, ol, li {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              p, blockquote {
                widows: 3 !important;
                orphans: 3 !important;
              }
              h1, h2, h3 {
                 page-break-before: auto !important;
                 break-before: auto !important;
              }

              /* --- 레이아웃 깨짐(겹침) 방지용 특수 코드 --- */
              /* ⚠️ 중요: 아래 클래스 이름(.multi-column-container 등)은 예시입니다. */
              /* F12 개발자 도구로 실제 페이지의 클래스 이름을 찾아서 수정해야 합니다. */
              .multi-column-container, .dashboard-item {
                  display: block !important;
                  width: 100% !important;
              }
              .multi-column-container > div, .dashboard-item > div {
                  display: block !important;
                  width: auto !important;
                  position: static !important;
                  float: none !important;
              }
              
              /* --- 핵심 스케일링 로직 --- */
              html {
                transform: scale(${scaleValue}) !important;
                transform-origin: 0 0 !important;
                width: ${Math.floor(100 / scaleValue)}% !important;
                height: ${Math.floor(100 / scaleValue)}% !important;
              }
              body {
                font-size: ${fontSize} !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              * {
                box-sizing: border-box !important;
              }
            }
          \`;
          document.head.appendChild(style);
          
          return 'DOM 스케일링 적용 완료';
        })();
      `
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const {data} = await chrome.debugger.sendCommand(target, 'Page.printToPDF', {
      printBackground: true,
      paperWidth: 8.27,
      paperHeight: 11.7,
      preferCSSPageSize: false
    });

    const byteArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([byteArray], {type: 'application/pdf'}));
    const filename = generateSmartFileName(tab.title, pageContent);

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: mode === 'custom',
      conflictAction: 'uniquify'
    });

    status.textContent = `${modeText[mode]} 완료! 📄`;
    
  } catch (err) {
    status.textContent = `❌ 실패: ${err.message}`;
    console.error('PDF 변환 오류:', err);
  } finally {
    try { await chrome.debugger.detach(target); } catch {}
  }
}

// 🔥 대안 방법: Viewport 조작 (위 방법이 안 될 경우)
async function convertToPDFWithViewport(settings, mode, tab, pageContent) {
  const target = {tabId: tab.id};
  const status = document.getElementById('status');

  try {
    status.textContent = '🎯 Viewport 조정 중...';
    
    await chrome.debugger.attach(target, '1.3');

    const scaleValue = settings.scale;
    const baseWidth = 1024;
    const baseHeight = 768;
    const newWidth = Math.floor(baseWidth / scaleValue);
    const newHeight = Math.floor(baseHeight / scaleValue);

    await chrome.debugger.sendCommand(target, 'Emulation.setDeviceMetricsOverride', {
      width: newWidth,
      height: newHeight,
      deviceScaleFactor: 1.0,
      mobile: false
    });

    await chrome.debugger.sendCommand(target, 'Page.reload');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    const {data} = await chrome.debugger.sendCommand(target, 'Page.printToPDF', {
      printBackground: true,
      marginTop: settings.margin.top,
      marginBottom: settings.margin.bottom,
      marginLeft: settings.margin.left,
      marginRight: settings.margin.right
    });

    const byteArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([byteArray], {type: 'application/pdf'}));
    const filename = generateSmartFileName(tab.title, pageContent);

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: mode === 'custom',
      conflictAction: 'uniquify'
    });

    status.textContent = '🎯 Viewport 조정 완료! 📄';
    
  } catch (err) {
    status.textContent = `❌ 실패: ${err.message}`;
  } finally {
    try { 
      await chrome.debugger.sendCommand(target, 'Emulation.clearDeviceMetricsOverride');
      await chrome.debugger.detach(target); 
    } catch {}
  }
}

// 🧠 스마트 자동 최적화
document.getElementById('smartSave').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const pageContent = await getPageContent(tab);
  const contentType = SMART_OPTIMIZER.detectContentType(pageContent, tab.title);
  const settings = SMART_OPTIMIZER.getScaleSettings(contentType, 'auto', null, 'normal');
  
  try {
    await convertToPDF(settings, 'smart', tab, pageContent);
  } catch (error) {
    console.log('첫 번째 방법 실패, 대안 시도:', error);
    await convertToPDFWithViewport(settings, 'smart', tab, pageContent);
  }
});

// 🚀 기본 빠른 변환
document.getElementById('quickSave').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const pageContent = await getPageContent(tab);
  const settings = SMART_OPTIMIZER.getScaleSettings('generic', '1.0', '12', 'normal');
  
  try {
    await convertToPDF(settings, 'quick', tab, pageContent);
  } catch (error) {
    console.log('첫 번째 방법 실패, 대안 시도:', error);
    await convertToPDFWithViewport(settings, 'quick', tab, pageContent);
  }
});

// ⚙️ 설정 토글
document.getElementById('customSave').addEventListener('click', () => {
  const settings = document.getElementById('settings');
  settings.classList.toggle('hidden');
});

// ⚙️ 수동 설정 변환
document.getElementById('saveWithSettings').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const pageContent = await getPageContent(tab);
  
  const scale = document.getElementById('scale').value;
  const fontSize = document.getElementById('fontSize').value;
  const margin = document.getElementById('margin').value;
  
  const settings = SMART_OPTIMIZER.getScaleSettings('custom', scale, fontSize, margin);
  
  try {
    await convertToPDF(settings, 'custom', tab, pageContent);
  } catch (error) {
    console.log('첫 번째 방법 실패, 대안 시도:', error);
    await convertToPDFWithViewport(settings, 'custom', tab, pageContent);
  }
});
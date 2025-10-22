console.log("🚀 Gmail AI Reply Extension loaded!");

let lastProcessedEmail = '';
let buttonInjected = false;
let currentEmailId = '';

const injectStyles = () => {
  if (document.getElementById('ai-reply-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'ai-reply-styles';
  style.textContent = `
    .ai-reply-btn {
      position: relative;
      margin-left: 8px;
      padding: 10px 24px;
      background: white;
      color: #000;
      border: 1px solid #000;
      border-radius: 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      transition: all 0.3s ease;
      min-height: 44px;
      z-index: 999 !important;
      pointer-events: auto !important;
      display: inline-block !important;
    }
    
    .ai-reply-btn:hover {
      background: #000 !important;
      color: white !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .ai-reply-btn:active {
      transform: translateY(0);
    }
    
    .ai-reply-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .ai-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    
    .ai-modal-overlay.show {
      opacity: 1;
    }
    
    .ai-modal-popup {
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      width: 500px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 30px 80px rgba(0,0,0,0.12);
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .ai-modal-overlay.show .ai-modal-popup {
      opacity: 1;
      transform: scale(1);
    }
    
    .ai-modal-input {
      width: 100%;
      min-height: 120px;
      padding: 14px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      resize: vertical;
      box-sizing: border-box;
      margin-bottom: 24px;
      transition: border-color 0.3s;
    }
    
    .ai-modal-input:focus {
      outline: none;
      border-color: #764ba2;
    }
    
    .ai-modal-btn {
      padding: 14px 36px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      min-height: 44px;
      transition: all 0.3s ease;
      font-family: 'Google Sans', sans-serif;
    }
    
    .ai-cancel-btn {
      background: white;
      color: #d93025;
      border: 1px solid #d93025;
    }
    
    .ai-cancel-btn:hover {
      background: #d93025 !important;
      color: white !important;
    }
    
    .ai-send-btn {
      background: white;
      color: #000;
      border: 1px solid #000;
    }
    
    .ai-send-btn:hover {
      background: #000 !important;
      color: white !important;
    }
    
    .ai-send-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
};

const getCurrentEmailId = () => {
  const match = window.location.href.match(/#inbox\/([^?]+)/);
  return match ? match[1] : '';
};

const createAIReplyButton = () => {
  const newEmailId = getCurrentEmailId();
  
  const oldButton = document.getElementById('ai-reply-btn');
  if (oldButton) {
    oldButton.remove();
  }
  
  currentEmailId = newEmailId;
  buttonInjected = false;
  
  injectStyles();

  let attempts = 0;
  const maxAttempts = 5;
  
  const tryInject = () => {
    attempts++;
    
    let buttonContainer = document.querySelector('div[role="main"] div[data-message-id] td[class*="gU"]');
    
    if (!buttonContainer) {
      buttonContainer = document.querySelector('div[role="main"] td.acX');
    }
    
    if (!buttonContainer) {
      // Try English "Reply"
      buttonContainer = document.querySelector('div[aria-label*="Reply"] + div');
    }
    
    if (!buttonContainer) {
      // Try Portuguese "Responder"
      buttonContainer = document.querySelector('div[aria-label*="Responder"] + div');
    }
    
    if (buttonContainer && !document.getElementById('ai-reply-btn')) {
      const aiButton = document.createElement('button');
      aiButton.id = 'ai-reply-btn';
      aiButton.className = 'ai-reply-btn';
      aiButton.innerHTML = 'AI Reply';
      aiButton.type = 'button';
      aiButton.style.cssText = 'margin-left: 8px; vertical-align: middle;';
      
      aiButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showInputPopup();
      });
      
      buttonContainer.appendChild(aiButton);
      buttonInjected = true;
      console.log("✅ AI Reply button added");
    } else if (attempts < maxAttempts) {
      console.log(`⏳ Attempt ${attempts}/${maxAttempts} - retrying...`);
      setTimeout(tryInject, 500);
    }
  };
  
  setTimeout(tryInject, 800);
};

const showInputPopup = () => {
  const existing = document.getElementById('ai-reply-popup');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ai-reply-popup';
  overlay.className = 'ai-modal-overlay';

  const popup = document.createElement('div');
  popup.className = 'ai-modal-popup';
  popup.innerHTML = `
    <h2 style="margin: 0 0 12px 0; font-family: 'Google Sans', sans-serif; font-size: 28px; font-weight: 300; color: #000; text-align: center; letter-spacing: -0.01em;">
      AI Reply Assistant
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #888; text-align: center; line-height: 1.7;">
      What would you like to say in your reply?
    </p>
    <textarea 
      id="ai-reply-input" 
      class="ai-modal-input"
      placeholder="Examples: decline politely, accept meeting, need more time, not interested..."
    ></textarea>
    <div id="ai-output-container" style="display: none; margin-bottom: 24px;">
      <label style="display: block; font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 600;">AI Generated Response:</label>
      <textarea 
        id="ai-output-text" 
        class="ai-modal-input"
        style="background: #f8f9fa; border: 2px solid #4CAF50;"
      ></textarea>
    </div>
    <div style="display: flex; justify-content: center; gap: 12px;">
      <button id="ai-cancel-btn" class="ai-modal-btn ai-cancel-btn">Cancel</button>
      <button id="ai-send-btn" class="ai-modal-btn ai-send-btn">Generate</button>
      <button id="ai-copy-btn" class="ai-modal-btn ai-send-btn" style="display: none;">Copy & Close</button>
    </div>
    <div id="ai-status" style="text-align: center; margin-top: 16px; font-size: 14px; color: #666;"></div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });

  setTimeout(() => document.getElementById('ai-reply-input').focus(), 300);

  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 250);
  };

  document.getElementById('ai-cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });
  
  overlay.addEventListener('click', (e) => { 
    if (e.target === overlay) closeModal(); 
  });
  
  document.getElementById('ai-send-btn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const userInput = document.getElementById('ai-reply-input').value.trim();
    if (!userInput) {
      alert("Please enter what you'd like to say!");
      return;
    }
    generateAIResponse(userInput);
  });

  document.getElementById('ai-copy-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const outputText = document.getElementById('ai-output-text').value;
    navigator.clipboard.writeText(outputText).then(() => {
      closeModal();
      insertIntoGmailCompose(outputText);
    });
  });
};

const generateAIResponse = (userInput) => {
  let author = document.getElementsByClassName("gD")[0];
  let subject = document.getElementsByClassName("hP")[0];
  let email = document.getElementsByClassName("a3s aiL ")[0];

  if (!author || !subject || !email) {
    alert("❌ Could not read email content. Please try again.");
    return;
  }

  const emailData = {
    author: author.innerText.replace("<", "").replace(">", ""),
    subject: subject.innerText,
    email: email.innerText || "(empty email body)",
    userInput: userInput,
    timestamp: new Date().toISOString()
  };

  console.log("📧 Sending to n8n:", emailData);
  
  const statusEl = document.getElementById('ai-status');
  const sendBtn = document.getElementById('ai-send-btn');
  const copyBtn = document.getElementById('ai-copy-btn');
  const outputContainer = document.getElementById('ai-output-container');
  const outputText = document.getElementById('ai-output-text');
  
  statusEl.textContent = 'Generating response...';
  statusEl.style.color = '#666';
  sendBtn.disabled = true;

  fetch(CONFIG.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  })
  .then(response => {
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return response.text();
  })
  .then(text => {
    console.log('✅ Received from n8n:', text);
    
    let aiResponse;
    try {
      const jsonData = JSON.parse(text);
      aiResponse = jsonData.output || jsonData.response || jsonData.message || text;
    } catch (e) {
      aiResponse = text;
    }
    
    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('Empty response from server');
    }
    
    outputText.value = aiResponse;
    outputContainer.style.display = 'block';
    copyBtn.style.display = 'inline-block';
    sendBtn.style.display = 'none';
    statusEl.textContent = 'Response generated! Edit if needed, then copy.';
    statusEl.style.color = '#666';
    
    outputText.focus();
    outputText.select();
  })
  .catch(error => {
    console.error('❌ n8n error:', error);
    statusEl.textContent = 'Failed to generate response. Please try again.';
    statusEl.style.color = '#d93025';
    sendBtn.disabled = false;
  });
};

const insertIntoGmailCompose = (text) => {
  // Try English "Reply" button
  let replyBtn = document.querySelector('[role="button"][aria-label*="Reply"]');
  
  // If not found, try Portuguese "Responder" button
  if (!replyBtn) {
    replyBtn = document.querySelector('[role="button"][aria-label*="Responder"]');
  }
  
  // Try English "Message" compose box
  let composeBox = document.querySelector('[role="textbox"][aria-label*="Message"]');
  
  // If not found, try Portuguese "Mensagem" compose box
  if (!composeBox) {
    composeBox = document.querySelector('[role="textbox"][aria-label*="Mensagem"]');
  }
  
  if (replyBtn && !composeBox) {
    replyBtn.click();
    setTimeout(() => insertText(text), 500);
  } else {
    insertText(text);
  }
};

const insertText = (text) => {
  // Try English "Message" compose box
  let composeBox = document.querySelector('[role="textbox"][aria-label*="Message"]');
  
  // If not found, try Portuguese "Mensagem" compose box
  if (!composeBox) {
    composeBox = document.querySelector('[role="textbox"][aria-label*="Mensagem"]');
  }
  
  if (composeBox) {
    composeBox.focus();
    document.execCommand('insertText', false, text);
    console.log('✅ Inserted AI response into compose box');
  } else {
    console.log('⚠️ Could not find compose box');
    navigator.clipboard.writeText(text);
    alert('Response copied to clipboard! Paste it into your reply.');
  }
};

let urlCheckTimeout;
let lastUrl = location.href;

const checkUrlChange = () => {
  const url = location.href;
  if (url !== lastUrl && url.includes('#inbox/')) {
    lastUrl = url;
    console.log("🔄 Email changed, adding button...");
    buttonInjected = false;
    createAIReplyButton();
  }
};

const observer = new MutationObserver(() => {
  clearTimeout(urlCheckTimeout);
  urlCheckTimeout = setTimeout(checkUrlChange, 300);
});

observer.observe(document.body, { 
  childList: true, 
  subtree: false
});

setTimeout(() => {
  if (location.href.includes('#inbox/')) {
    console.log("⏱️ Creating initial button...");
    createAIReplyButton();
  }
}, 2000);

window.addEventListener('popstate', () => {
  console.log("🔙 Navigation detected");
  setTimeout(checkUrlChange, 500);
});

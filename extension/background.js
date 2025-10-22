console.log("🔧 Gmail AI Reply Assistant - Background Script Loaded");

const isEmailURL = (url) => {
  if (!url || !url.includes("mail.google.com")) {
    return false;
  }
  
  if (!url.includes("#inbox/")) {
    return false;
  }
  
  return true;
};

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isEmailURL(tab.url)) {
    console.log("📬 Gmail email detected:", tab.url);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (isEmailURL(tab.url)) {
    console.log("🔘 Extension icon clicked on email:", tab.url);
  }
});

console.log("✅ Background script ready");

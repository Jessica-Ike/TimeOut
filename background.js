import { timeFormatter } from "./utils.js";

const TIME_LIMITS_KEY = "limits";
const activeTimers = {};
let activeTabId = null;

chrome.runtime.onStartup.addListener(() => {
  checkAndResetDailyLimits();
});

chrome.runtime.onInstalled.addListener(() => {
  checkAndResetDailyLimits();
  chrome.storage.sync.get(TIME_LIMITS_KEY, (data) => {
    if (!data[TIME_LIMITS_KEY]) {
      chrome.storage.sync.set({ [TIME_LIMITS_KEY]: [] });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id === tabId) {
        handleTabSwitch(tabId);
      }
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabSwitch(activeInfo.tabId);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    pauseAllTimers(); 
    activeTabId = null;
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        handleTabSwitch(tabs[0].id);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "pauseTimer" && message.url) {
    pauseSharedTimer(message.url);
  }
});

function handleTabSwitch(tabId) {
  pauseAllTimers(); 
  checkAndResetDailyLimits();
  activeTabId = tabId;

  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      chrome.storage.sync.get(TIME_LIMITS_KEY, (data) => {
        const limits = data[TIME_LIMITS_KEY] || [];
        const matchedLimit = limits.find((limit) => tab.url.includes(limit.url));

        if (matchedLimit) {
          chrome.tabs.query({}, (allTabs) => {
            const relevantTabs = allTabs.filter(t => t.url && t.url.includes(matchedLimit.url));
            if (relevantTabs.length > 0) {
              startSharedTimer(matchedLimit);
            }
          });
        } else {
          chrome.action.setBadgeText({ text: "" });
        }
      });
    }
  });
}

function startSharedTimer(limit) {
  const urlKey = limit.url;

  if (activeTimers[urlKey]) {
    clearInterval(activeTimers[urlKey].interval);
  }

  let timeSpent = limit.timeSpent - 1000 || 0;
  const totalTime = limit.timeLeft + timeSpent + 1000 || 60000;

  const interval = setInterval(() => {
    chrome.tabs.query({ active: true }, (tabs) => {
      const matchingTab = tabs.find(tab => tab.url && tab.url.includes(urlKey));
      if (!matchingTab) {
        pauseSharedTimer(urlKey);
        return;
      }

      timeSpent += 1000;
      const remainingTime = totalTime - timeSpent;

      chrome.action.setBadgeText({ text: remainingTime > 0 ? timeFormatter(remainingTime) : "0m" });

      if (remainingTime <= 0) {
        clearInterval(interval);
        chrome.tabs.query({}, (allTabs) => {
          allTabs.forEach(tab => {
            if (tab.url && tab.url.includes(urlKey)) {
              blockTab(tab.id);
            }
          });
        });

        chrome.storage.sync.get(TIME_LIMITS_KEY, (data) => {
          const updatedLimits = data[TIME_LIMITS_KEY].filter((l) => l.url !== urlKey);
          chrome.storage.sync.set({ [TIME_LIMITS_KEY]: updatedLimits });
        });
      }

      chrome.storage.sync.get(TIME_LIMITS_KEY, (data) => {
        const limits = data[TIME_LIMITS_KEY] || [];
        const currentLimit = limits.find((l) => l.url === urlKey);
        if (currentLimit) {
          currentLimit.timeSpent = timeSpent;
          currentLimit.timeLeft = totalTime - timeSpent;
          chrome.storage.sync.set({ [TIME_LIMITS_KEY]: limits });
        }
      });
    });
  }, 1000);

  activeTimers[urlKey] = { interval, timeSpent };
}

function pauseSharedTimer(urlKey) {
  if (activeTimers[urlKey]) {
    clearInterval(activeTimers[urlKey].interval);
    const { timeSpent } = activeTimers[urlKey];
    activeTimers[urlKey] = { timeSpent };
    chrome.action.setBadgeText({ text: "⏸" });
  }
}

function pauseAllTimers() {
  Object.keys(activeTimers).forEach((urlKey) => {
    pauseSharedTimer(urlKey);
  });
}

function blockTab(tabId) {
  chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocking/block.html") });
}

function checkAndResetDailyLimits() {
  const today = new Date().toISOString().split("T")[0];

  chrome.storage.sync.get([TIME_LIMITS_KEY, "lastResetDate"], (data) => {
    const lastReset = data.lastResetDate;
    const limits = data.limits || [];

    if (lastReset !== today) {
      const updatedLimits = limits.map((limit) => {
        if (typeof limit.limit === "number") {
          return {
            ...limit,
            timeLeft: limit.limit,
            timeSpent: 0
          };
        }
        return limit;
      });

      chrome.storage.sync.set({
        limits: updatedLimits,
        lastResetDate: today
      });
    }
  });
}

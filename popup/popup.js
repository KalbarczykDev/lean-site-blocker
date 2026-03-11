const input = document.getElementById("siteInput");
const addButton = document.getElementById("addButton");
const siteList = document.getElementById("siteList");
const feedback = document.getElementById("feedback");

let feedbackTimer = null;

function showFeedback(message, type = "error") {
  clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
  feedbackTimer = setTimeout(() => {
    feedback.textContent = "";
    feedback.className = "feedback";
  }, 2000);
}

function showList(domains) {
  siteList.innerHTML = "";

  if (domains.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No sites blocked yet.";
    siteList.appendChild(empty);
    return;
  }

  domains.forEach((domain) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = domain;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => {
      const updated = domains.filter((d) => d !== domain);
      chrome.storage.local.set({ blocked: updated }, () => {
        showList(updated);
      });
    };

    li.appendChild(span);
    li.appendChild(removeButton);
    siteList.appendChild(li);
  });
}

function normalizeDomain(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function addDomain() {
  const domain = normalizeDomain(input.value);
  if (!domain) return;

  chrome.storage.local.get("blocked", (data) => {
    const domains = data.blocked || [];
    if (domains.includes(domain)) {
      input.classList.add("error");
      setTimeout(() => input.classList.remove("error"), 1000);
      showFeedback(`${domain} is already blocked.`);
      return;
    }
    const updated = [...domains, domain];
    chrome.storage.local.set({ blocked: updated }, () => {
      showList(updated);
      showFeedback(`${domain} blocked.`, "success");
      input.value = "";
    });
  });
}

addButton.onclick = addDomain;

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addDomain();
});

// Pre-fill input with the current tab's domain
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    try {
      const url = new URL(tabs[0].url);
      if (url.hostname) {
        input.value = url.hostname.replace(/^www\./, "");
      }
    } catch (_) {}
  }
});

chrome.storage.local.get("blocked", (data) => {
  showList(data.blocked || []);
});

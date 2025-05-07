import { parseTime, timeFormatter } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  function openPage(evt, pageName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(pageName).style.display = "block";

    if (evt) {
      evt.currentTarget.className += " active";
    } else {
      if (pageName === "Home") {
        document.getElementById("btnHome").className += " active";
      } else if (pageName === "Manage") {
        document.getElementById("btnManage").className += " active";
      }
    }

    if (pageName === "Home") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        const inputElement = document.getElementById("url");
        inputElement.value = url;
      });
    }

    if (pageName === "Manage") {
      loadLimits();
    }
  }

  function loadLimits() {
    const limitsList = document.getElementById("limitList");
    limitsList.innerHTML = "";

    chrome.storage.sync.get(["limits"], (result) => {
      const limits = result.limits || [];
      if (limits.length === 0) {
        limitsList.innerHTML = "<li>No limits set.</li>";
      } else {
        limits.forEach((limit, index) => {
          const li = document.createElement("li");
          li.textContent = `${limit.url} - ${timeFormatter(limit.limit)} - (${(timeFormatter(limit.timeLeft) || "0s")} left)`;
          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.addEventListener("click", () => {
            loadEditLimit(index);
          });
          li.appendChild(editButton);
          limitsList.appendChild(li);
        });
      }
    });
  }

  function loadEditLimit(index) {
    chrome.storage.sync.get(["limits"], (result) => {
      const limits = result.limits || [];
      const limit = limits[index];
      if (limit) {
        openPage(null, "Edit");
        const urlInput = document.getElementById("editUrl");
        const timeInput = document.getElementById("editTimes");
        urlInput.value = limit.url;
        timeInput.value = parseTime(limit.limit);

        const saveButton = document.getElementById("saveLimit");
        saveButton.onclick = null;
        saveButton.onclick = (event) => {
          event.preventDefault();
          chrome.runtime.sendMessage({ action: "pauseTimer", url: limit.url });
          const newLimit = parseTime(timeInput.value);
          const newURL = urlInput.value;
          limits[index].url = newURL;
          limits[index].limit = newLimit;
          const newTimeLeft = newLimit - limit.timeSpent;
          limits[index].timeLeft = newTimeLeft > 0 ? newTimeLeft : 0;
          chrome.storage.sync.set({ limits }, () => {
            const messageElement = document.getElementById("editMessage");
            messageElement.textContent = "Limit updated successfully!";
            chrome.tabs.create({ url: newURL });
            setTimeout(() => {
              messageElement.textContent = "";
              openPage(null, "Manage");
            }, 2000);
          });
        };

        const deleteButton = document.getElementById("deleteLimit");
        deleteButton.onclick = null;
        deleteButton.onclick = (event) => {
          event.preventDefault();
          limits.splice(index, 1);
          chrome.storage.sync.set({ limits }, () => {
            const messageElement = document.getElementById("editMessage");
            messageElement.textContent = "Limit deleted successfully!";
            chrome.tabs.create({ url: limit.url });
            setTimeout(() => {
              messageElement.textContent = "";
              openPage(null, "Manage");
            }, 2000);
          });
        };

        const cancelButton = document.getElementById("cancelEdit");
        cancelButton.onclick = null;
        cancelButton.onclick = (event) => {
          event.preventDefault();
          openPage(null, "Manage");
        };

      }
    });
  }

  const timerForm = document.getElementById("timerForm");
  timerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = document.getElementById("url").value || tabs[0].url;
      const limit = document.getElementById("times").value;

      chrome.storage.sync.get(["limits"], (result) => {
        const limits = result.limits || [];
        const existingLimit = limits.find((limitObj) => limitObj.url === url);
        if (existingLimit) {
          const messageElement = document.getElementById("message");
          messageElement.textContent = "URL already exists!";
          setTimeout(() => {
            messageElement.textContent = "";
          }, 3000);
          return;
        }
        if (url.trim() === "") {
          const messageElement = document.getElementById("message");
          messageElement.textContent = "URL cannot be empty!";
          setTimeout(() => {
            messageElement.textContent = "";
          }, 3000);
          return;
        } else {
          limits.push({ url, timeLeft: parseTime(limit), limit: parseTime(limit), timeSpent: 0 });
          chrome.storage.sync.set({ limits }, () => {
            const messageElement = document.getElementById("message");
            messageElement.textContent = "Limit added successfully!";
            setTimeout(() => {
              messageElement.textContent = "";
            }, 3000);
            loadLimits();
            timerForm.reset();
          });
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });

  openPage(null, "Home");

  const buttons = document.querySelectorAll(".tablinks");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const pageName = button.getAttribute("data-page");
      openPage(event, pageName);
    });
  });
});
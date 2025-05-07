# Time Out! Chrome Extension

**Time Out!** is a Chrome extension that helps users manage their time on specific websites. Once the timer is up, the extension blocks the website and tells the user to take a break. Users can also request more time by editing the time limit directly from the blocking page.

Note, this is a very basic extension, functionality was the focus

---

## Features

- **Set Time Limits**: Add time limits for specific websites.
- **Block Websites**: Automatically blocks websites when the time limit is reached.
- **Edit Limits**: Modify time limits directly from the popup or the blocking page.
- **Daily Reset**: Resets time limits every day to encourage healthy browsing habits.
- **Customizable**: Easily manage and edit your time limits.

---

## Installation

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the folder containing this project.
5. The extension will now appear in your Chrome toolbar.

---

## Usage

### Setting a Time Limit
1. Click on the extension icon in the Chrome toolbar.
2. Navigate to the **Add Limit** tab.
3. Enter the URL of the website and select a time limit.
4. Click **Set Timer** to save the limit.

### Managing Time Limits
1. Navigate to the **Manage** tab in the popup.
2. View your current time limits and remaining time.
3. Click **Edit** to modify a limit or delete it.

### Requesting More Time
1. When a website is blocked, click the **Need More Time?** button.
2. The popup will open with the **Edit Limit** page preloaded with the blocked URL and its current limit.
3. Update the time limit and save changes to regain access to the website.

(Optional: pin extension to toolbar to see timer in realtime)

---

## File Structure

- **`manifest.json`**: Defines the extension's metadata and permissions.
- **`popup.html`**: The main popup interface for managing time limits.
- **`popup.js`**: Handles the logic for adding, editing, and managing time limits.
- **`blocking/block.html`**: The page displayed when a website is blocked.
- **`blocking/block.js`**: Handles the logic for the "Need More Time?" button on the blocking page.
- **`background.js`**: Manages timers, blocks websites, and handles daily resets.

---

## Permissions

The extension requires the following permissions:
- **`storage`**: To save and retrieve time limits.
- **`tabs`**: To query and update tabs.
- **`activeTab`**: To interact with the currently active tab.
- **`scripting`**: To inject scripts into web pages.

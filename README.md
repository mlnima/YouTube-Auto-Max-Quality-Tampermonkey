# 🎥 YouTube - Auto Max Quality (Hourly Check)

Automatically ensures you're watching YouTube videos in the highest available quality — not just on initial page load, but every hour while you watch.

## 🔧 What It Does

- Automatically sets the **maximum video quality** as soon as a YouTube video loads.
- Re-checks and re-applies the setting **every hour**.
- Supports language variations like "Quality" and "Qualität".
- Works even when navigating between videos via YouTube's dynamic SPA routing.

## 🚀 Installation

1. Make sure you have [Tampermonkey](https://www.tampermonkey.net/) or a similar userscript manager installed.
2. Install the script from:  
   [🔗 GitHub Raw Script Link](https://github.com/mlnima/YouTube-Auto-Max-Quality-Tampermonkey/raw/main/YouTube-Auto-Max-Quality.user.js)

## 📂 Script Metadata

- **Name:** YouTube - Auto Max Quality (Hourly Check)
- **Version:** 1.4
- **Author:** [Nima](https://github.com/mlnima)
- **License:** MIT
- **Match:** `*://www.youtube.com/watch*`

## ⚙️ Configuration

These can be modified directly in the script:

| Setting             | Default     | Description                                                                 |
|---------------------|-------------|-----------------------------------------------------------------------------|
| `CHECK_INTERVAL_MS` | `3600000`   | Interval between quality re-checks (in ms). Default is 1 hour.             |
| `CLICK_DELAY_MS`    | `600`       | Delay between simulated clicks to navigate menus.                          |
| `INITIAL_DELAY_MS`  | `5000`      | Time to wait after page load before applying the quality setting.          |
| `DEBUG_MODE`        | `false`     | Set to `true` to enable detailed console logs for troubleshooting.         |

## 📦 Features

- ✅ Automatically selects the highest available quality
- ✅ Detects YouTube’s page navigation (SPA changes)
- ✅ Lightweight and non-intrusive
- ✅ Open source under the MIT License

## 🧠 How It Works

- Clicks the **Settings** button in the YouTube player.
- Navigates to the **Quality** menu.
- Selects the **highest resolution** option available.
- Monitors navigation events using a `MutationObserver` for smooth SPA support.

## 🛠 Troubleshooting

- If the quality isn't set as expected:
    - Enable `DEBUG_MODE` in the script to see logs in the browser console.
    - Try increasing `CLICK_DELAY_MS` for slower machines or connections.

## 📄 License

MIT License © [Nima Malayeri](https://github.com/mlnima)

function parseTime(time) {
  const timeMap = {
    "15sec": 15 * 1000,
    "1min": 60 * 1000,
    "15min": 15 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "45min": 45 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "1.5h": 90 * 60 * 1000,
    "2h": 120 * 60 * 1000,
    [15 * 1000]: "15sec",
    [60 * 1000] : "1min",
    [15 * 60 * 1000] : "15min",
    [30 * 60 * 1000] : "30min",
    [45 * 60 * 1000] : "45min",
    [60 * 60 * 1000] : "1h",
    [90 * 60 * 1000] : "1.5h",
    [120 * 60 * 1000] : "2h",
  };
  return timeMap[time] || 0;
}

function timeFormatter(time) {
  if (time >= 1000 && time < 60000) {
    return `${Math.floor(time / 1000)}s`;
  }
  if (time >= 60000 && time < 3600000) {
    return `${Math.floor(time / 60000)}m`;
  }
  if (time >= 3600000) {
    return `${Math.floor(time / 3600000)}h`;
  }
}

export { parseTime, timeFormatter };
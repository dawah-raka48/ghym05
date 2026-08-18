/* مركز غيم - Google Apps Script API */
const API_URL = "https://script.google.com/macros/s/AKfycbw7M0WOL57oJXEwhJ0jgQiSG_f0R0rYhH-YY0Wm7xnAYMr62wVJOY0YZPohjGdjhMs/exec";

async function apiGet(action="ping") {
  const url = API_URL + "?action=" + encodeURIComponent(action);
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "فشل الاتصال بالخادم");
  return data;
}

async function apiPost(action, payload={}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, data: payload })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "فشل تنفيذ العملية");
  return data;
}

export const PUBLISH_PREVIEW_URI = "ui://socioconnect/publish-preview/v1.html";

export const publishPreviewHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff;
    --surface: #f7f7f8;
    --border: #e6e6e9;
    --text: #111113;
    --muted: #6b6b76;
    --accent: #111113;
    --accent-text: #ffffff;
    --danger: #b42318;
    --warn: #9a6700;
    --ok: #067647;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #141416;
      --surface: #1c1c20;
      --border: #2c2c32;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --accent: #f4f4f5;
      --accent-text: #141416;
      --danger: #f97066;
      --warn: #fdb022;
      --ok: #75e0a7;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 12px;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  .card {
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--surface);
    padding: 16px;
  }
  .eyebrow { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
  h1 { font-size: 17px; margin: 6px 0 10px; }
  .content {
    white-space: pre-wrap;
    line-height: 1.5;
    font-size: 14px;
    margin: 0 0 14px;
  }
  .destinations { display: grid; gap: 8px; }
  .dest {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
    padding: 10px 12px;
  }
  .dest-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .badge {
    font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    padding: 3px 7px; border-radius: 999px; background: var(--accent); color: var(--accent-text);
  }
  .account { font-size: 12px; color: var(--muted); }
  .dest-text { font-size: 12px; line-height: 1.45; white-space: pre-wrap; color: var(--text); }
  .meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 7px; font-size: 11px; color: var(--muted); }
  .meta .error { color: var(--danger); }
  .meta .warn { color: var(--warn); }
  .meta .ok { color: var(--ok); }
  .footer { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
  button {
    border: 0; border-radius: 9px; padding: 10px 14px; font-size: 13px; font-weight: 600;
    cursor: pointer;
  }
  .primary { background: var(--accent); color: var(--accent-text); }
  .secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }
  button:disabled { opacity: .55; cursor: not-allowed; }
  .status { margin-top: 12px; font-size: 12px; color: var(--muted); }
  .status.error { color: var(--danger); }
  .status.ok { color: var(--ok); }
  .empty { color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
  <div class="card">
    <div class="eyebrow">SocioConnect</div>
    <h1 id="title">Review and publish</h1>
    <p class="content" id="content">Waiting for preview…</p>
    <div class="destinations" id="destinations"></div>
    <div class="footer">
      <button class="primary" id="confirm" disabled>Publish</button>
      <button class="secondary" id="dismiss">Not now</button>
    </div>
    <div class="status" id="status"></div>
  </div>

<script>
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");
  const destinationsEl = document.getElementById("destinations");
  const confirmEl = document.getElementById("confirm");
  const dismissEl = document.getElementById("dismiss");
  const statusEl = document.getElementById("status");

  let pending = new Map();
  let nextId = 1;
  let currentIntent = null;

  function request(method, params) {
    const id = nextId++;
    window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  function setStatus(text, kind) {
    statusEl.textContent = text || "";
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function text(value) {
    return value == null ? "" : String(value);
  }

  function render(data) {
    const preview = data && data.preview ? data.preview : data;
    const intent = data && data.intent ? data.intent : null;
    if (!preview || !preview.destinations) {
      contentEl.textContent = "No preview available.";
      return;
    }

    currentIntent = intent;
    const isSchedule = intent && intent.mode === "schedule";
    titleEl.textContent = isSchedule ? "Review and schedule" : "Review and publish";
    confirmEl.textContent = isSchedule ? "Schedule post" : "Publish now";
    contentEl.textContent = text(preview.post && preview.post.content);

    destinationsEl.replaceChildren();
    preview.destinations.forEach((dest) => {
      const row = document.createElement("div");
      row.className = "dest";

      const head = document.createElement("div");
      head.className = "dest-head";
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = text(dest.platform);
      const account = document.createElement("span");
      account.className = "account";
      account.textContent = dest.accountUsername ? "@" + dest.accountUsername : "";
      head.append(badge, account);

      const body = document.createElement("div");
      body.className = "dest-text";
      body.textContent = text(dest.content);

      const meta = document.createElement("div");
      meta.className = "meta";
      const count = document.createElement("span");
      count.textContent = text(dest.characterCount) + " / " + text(dest.maxCharacters) + " chars";
      meta.append(count);

      (dest.errors || []).forEach((error) => {
        const item = document.createElement("span");
        item.className = "error";
        item.textContent = text(error.message || error);
        meta.append(item);
      });
      (dest.warnings || []).forEach((warning) => {
        const item = document.createElement("span");
        item.className = "warn";
        item.textContent = text(warning);
        meta.append(item);
      });
      if (!dest.errors || dest.errors.length === 0) {
        const ok = document.createElement("span");
        ok.className = "ok";
        ok.textContent = "No blocking issues";
        meta.append(ok);
      }

      row.append(head, body, meta);
      destinationsEl.append(row);
    });

    confirmEl.disabled = !intent || !intent.id;
    setStatus(
      isSchedule && intent && intent.scheduledAt
        ? "Scheduled for " + new Date(intent.scheduledAt).toLocaleString()
        : "This publishes immediately to every destination above.",
    );
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;

    if (message.id !== undefined && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) entry.reject(message.error);
      else entry.resolve(message.result);
      return;
    }

    if (message.method === "ui/notifications/tool-result") {
      render(message.params && message.params.structuredContent);
    }
  });

  confirmEl.addEventListener("click", async () => {
    if (!currentIntent || !currentIntent.id) return;
    confirmEl.disabled = true;
    dismissEl.disabled = true;
    setStatus("Confirming…");
    try {
      const result = await request("tools/call", {
        name: "confirm_publish_intent",
        arguments: {
          intentId: currentIntent.id,
          idempotencyKey: "ui-confirm-" + currentIntent.id,
        },
      });
      const structured = result && result.structuredContent;
      const message = structured && structured.message ? structured.message : "Confirmed.";
      setStatus(message, "ok");
      confirmEl.textContent = "Done";
    } catch (error) {
      setStatus((error && error.message) || "Could not confirm the post.", "error");
      confirmEl.disabled = false;
      dismissEl.disabled = false;
    }
  });

  dismissEl.addEventListener("click", () => {
    setStatus("Left unpublished. Nothing was sent.", "");
    confirmEl.disabled = true;
  });
</script>
</body>
</html>`;

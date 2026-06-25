/**
 * Shared dev-mode utility. Imported by each page's boot script.
 *
 * When `?dev-mode` is present in the URL:
 *   - Adds `dev-mode` class to <body> for visual theming.
 *   - Rewrites all relative nav/brand links to carry `?dev-mode` so the
 *     param is preserved when navigating between pages.
 *   - Turns the Dev Mode nav button into a toggle-off link (removes the param).
 *
 * When `?dev-mode` is absent:
 *   - The Dev Mode button already points to `./box.html?dev-mode` in the HTML,
 *     so nothing extra is needed.
 */

export const DEV_MODE = new URLSearchParams(window.location.search).has("dev-mode");

let _jsonContent: HTMLElement | null = null;
let _flagNoSubjectContent: HTMLElement | null = null;
let _flagReportContent: HTMLElement | null = null;

/** Append `?dev-mode` (or `&dev-mode`) to a relative href, preserving any hash. */
function addDevMode(href: string): string {
    const hashIdx = href.indexOf("#");
    const hash = hashIdx >= 0 ? href.slice(hashIdx) : "";
    const base = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
    return base + (base.includes("?") ? "&dev-mode" : "?dev-mode") + hash;
}

export function initDevMode(): void {
    const devModeLink = document.querySelector<HTMLAnchorElement>(".top-nav-devmode-link");
    const params = new URLSearchParams(window.location.search);

    // Always point the Dev Mode button at the current page, toggling the param.
    if (devModeLink) {
        if (DEV_MODE) {
            params.delete("dev-mode");
            const query = params.toString();
            devModeLink.href = query ? `?${query}` : "./";
        } else {
            params.set("dev-mode", "");
            // Produce "?dev-mode" without a trailing "=".
            const query = params.toString().replace("dev-mode=", "dev-mode");
            devModeLink.href = "?" + query;
        }
    }

    if (!DEV_MODE) return;

    // Visual indicator
    document.body.classList.add("dev-mode");

    // Rewrite relative links inside the nav and the brand so the param is
    // carried through page-to-page navigation.
    const selectors = ["nav a[href]", "a.top-nav-brand[href]"];
    for (const sel of selectors) {
        for (const a of document.querySelectorAll<HTMLAnchorElement>(sel)) {
            const href = a.getAttribute("href")!;
            // Skip external links (http/https), anchors-only, and links that already carry the param.
            if (href.startsWith("http") || href.startsWith("#") || href.includes("dev-mode")) continue;
            a.setAttribute("href", addDevMode(href));
        }
    }

    // Mark button active now that we know we're in dev-mode.
    devModeLink?.classList.add("active");

    // Inject the JSON payload preview panel at the bottom of <main>.
    const panel = document.createElement("div");
    panel.className = "dev-mode-json-panel";
    panel.innerHTML =
        `<h3 class="dev-mode-json-heading">Dev Mode — Payload Preview</h3>` +
        `<pre class="dev-mode-json-content">Waiting for a frame to load…</pre>`;
    document.querySelector("main")?.appendChild(panel);
    _jsonContent = panel.querySelector(".dev-mode-json-content");

    // Inject the flag payload preview panel (report frame + no subject present).
    const flagPanel = document.createElement("div");
    flagPanel.className = "dev-mode-flag-panel";
    flagPanel.innerHTML =
        `<h3 class="dev-mode-flag-heading">Dev Mode — Flag Payload Preview</h3>` +
        `<div class="dev-mode-flag-section">` +
            `<div class="dev-mode-flag-label">No Subject Present</div>` +
            `<pre class="dev-mode-json-content dev-mode-flag-content">Waiting for a frame to load…</pre>` +
        `</div>` +
        `<div class="dev-mode-flag-section">` +
            `<div class="dev-mode-flag-label">Report Frame</div>` +
            `<pre class="dev-mode-json-content dev-mode-flag-content">Waiting for a frame to load…</pre>` +
        `</div>`;
    document.querySelector("main")?.appendChild(flagPanel);
    const flagContents = flagPanel.querySelectorAll<HTMLElement>(".dev-mode-flag-content");
    _flagNoSubjectContent = flagContents[0] ?? null;
    _flagReportContent = flagContents[1] ?? null;
}

/**
 * Update the JSON preview panel with the payload that would be sent to the
 * backend. Pass `null` to show the waiting placeholder.
 */
export function updateDevModeJson(data: unknown): void {
    if (!_jsonContent) return;
    _jsonContent.textContent =
        data != null ? JSON.stringify(data, null, 2) : "Waiting for a frame to load…";
}

/**
 * Update the flag payload preview panel with the no-subject and report-frame
 * payloads that would be sent to the backend. Pass `null` to show the waiting
 * placeholder for both.
 */
export function updateDevModeFlagJson(noSubject: unknown, report: unknown): void {
    const placeholder = "Waiting for a frame to load…";
    if (_flagNoSubjectContent) {
        _flagNoSubjectContent.textContent =
            noSubject != null ? JSON.stringify(noSubject, null, 2) : placeholder;
    }
    if (_flagReportContent) {
        _flagReportContent.textContent =
            report != null ? JSON.stringify(report, null, 2) : placeholder;
    }
}

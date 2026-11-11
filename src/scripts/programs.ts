/* Instant, client-side filtering. With six programs there is nothing to batch, so
   results update as each control changes, and the URL keeps the view shareable. */

const form = document.querySelector<HTMLFormElement>("[data-filter-form]");
const cards = [...document.querySelectorAll<HTMLElement>("[data-grid] .card")];
const empty = document.querySelector<HTMLElement>("[data-empty]");
const count = document.querySelector<HTMLElement>("[data-count]");
const clear = document.querySelector<HTMLButtonElement>("[data-clear]");
const lineNames: Record<string, string> = {
  pickleball: "Pickleball",
  youth: "Youth & Camps",
  active: "Active 55+",
  leagues: "Adult Leagues",
  events: "Events",
};

if (form) {
  const params = new URLSearchParams(location.search);
  const set = (name: string, value: string) => {
    for (const el of form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`)) {
      if (el.type === "radio" || el.type === "checkbox") el.checked = el.value === value || el.checked;
      else el.value = value;
    }
  };
  if (params.get("who")) set("who", params.get("who")!);
  for (const a of params.getAll("activity")) set("activity", a);
  if (params.get("open") === "1") set("open", "1");
  if (params.get("line") && lineNames[params.get("line")!]) set("line", params.get("line")!);

  const apply = () => {
    const data = new FormData(form);
    const who = String(data.get("who") ?? "all");
    const acts = data.getAll("activity").map(String);
    const openOnly = data.get("open") === "1";
    const line = String(data.get("line") ?? "");

    let shown = 0;
    for (const card of cards) {
      const match =
        (who === "all" || card.dataset.who!.split(" ").includes(who)) &&
        (!acts.length || card.dataset.activities!.split("|").some((a) => acts.includes(a))) &&
        (!openOnly || card.dataset.status === "open") &&
        (!line || card.dataset.line === line);
      card.hidden = !match;
      if (match) shown++;
    }

    const filtered = who !== "all" || acts.length > 0 || openOnly || !!line;
    if (count) {
      const noun = shown === 1 ? "program" : "programs";
      count.textContent = line ? `${shown} ${noun} in ${lineNames[line]}` : `${shown} ${noun}`;
    }
    if (clear) clear.hidden = !filtered;
    if (empty) empty.hidden = shown > 0;

    const next = new URLSearchParams();
    if (who !== "all") next.set("who", who);
    acts.forEach((a) => next.append("activity", a));
    if (openOnly) next.set("open", "1");
    if (line) next.set("line", line);
    const qs = next.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  };

  form.addEventListener("change", apply);
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("reset", () => {
    // Let the browser restore defaults first; the hidden line field needs clearing by hand.
    setTimeout(() => {
      const line = form.querySelector<HTMLInputElement>('[name="line"]');
      if (line) line.value = "";
      apply();
    });
  });
  apply();
}

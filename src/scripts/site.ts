const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Header hairline once the page scrolls. */
const header = document.querySelector<HTMLElement>("[data-header]");
const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 4);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* Mobile menu. */
const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu-btn]");
const menu = document.querySelector<HTMLElement>("[data-menu]");
function setMenu(open: boolean) {
  if (!menuBtn || !menu) return;
  menuBtn.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("open", open);
  document.documentElement.style.overflow = open ? "hidden" : "";
  if (open) menu.querySelector<HTMLElement>("a")?.focus();
}
menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
menu?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a, button")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.classList.contains("open")) {
    setMenu(false);
    menuBtn?.focus();
  }
});
window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => e.matches && setMenu(false));

/* Reveal sections below the fold as they arrive. Content above the fold is never hidden. */
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of document.querySelectorAll<HTMLElement>(".reveal")) {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add("pending");
      io.observe(el);
    }
  }
}

/* Interest sheet. Any [data-interest="program-id"] opens it with that program chosen. */
const sheet = document.querySelector<HTMLDialogElement>("#interest");
document.addEventListener("click", (e) => {
  const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-interest]");
  if (!trigger || !sheet) return;
  e.preventDefault();
  const form = sheet.querySelector("form");
  if (form?.classList.contains("sent")) resetForm(form);
  const program = trigger.dataset.interest;
  const select = sheet.querySelector<HTMLSelectElement>("select[name=program]");
  if (select) select.value = program && [...select.options].some((o) => o.value === program) ? program : select.options[0].value;
  sheet.showModal();
});
sheet?.addEventListener("click", (e) => {
  if (e.target === sheet || (e.target as HTMLElement).closest("[data-close]")) sheet.close();
});

/* Forms post to the site's own /api/inquiry endpoint (see worker/). */
const opened = Date.now();

function resetForm(form: HTMLFormElement) {
  form.reset();
  form.classList.remove("sent");
  const status = form.querySelector(".form-status");
  if (status) status.textContent = "";
}

function showError(form: HTMLFormElement, message: string, withEmail = false) {
  const status = form.querySelector<HTMLElement>(".form-status");
  if (!status) return;
  status.className = "form-status error";
  status.textContent = message;
  if (withEmail) {
    const email = form.querySelector<HTMLInputElement>("input[name=fallback]")?.value ?? "";
    const link = document.createElement("a");
    link.href = `mailto:${email}`;
    link.textContent = email;
    status.append(" Email us at ", link, " instead.");
  }
}

for (const form of document.querySelectorAll<HTMLFormElement>("form[data-inquiry]")) {
  form.addEventListener("input", (e) => {
    const el = e.target as HTMLInputElement;
    if (el.getAttribute("aria-invalid") === "true" && el.checkValidity()) el.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = [...form.elements] as HTMLInputElement[];
    const invalid = fields.filter((f) => f.willValidate && !f.checkValidity());
    fields.forEach((f) => f.removeAttribute("aria-invalid"));
    if (invalid.length) {
      invalid.forEach((f) => f.setAttribute("aria-invalid", "true"));
      invalid[0].focus();
      const consentMissing = invalid.some((f) => f.name === "consent");
      showError(form, consentMissing && invalid.length === 1 ? "Please tick the box so we can email you." : "Please fill in the highlighted fields.");
      return;
    }

    const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
    const data = Object.fromEntries(new FormData(form));
    const body = { ...data, kind: form.dataset.kind, elapsed: Date.now() - opened };
    button?.setAttribute("disabled", "");
    const status = form.querySelector<HTMLElement>(".form-status");
    if (status) { status.className = "form-status"; status.textContent = "Sending…"; }

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      if (status) status.textContent = "";
      form.classList.add("sent");
      form.querySelector<HTMLElement>(".form-done")?.focus();
    } catch {
      showError(form, "That didn't send.", true);
    } finally {
      button?.removeAttribute("disabled");
    }
  });
}

/* Review mode: list every statement that still needs confirming. */
if (document.documentElement.classList.contains("review")) {
  const list = document.querySelector<HTMLOListElement>("[data-review-list]");
  const count = document.querySelector("[data-review-count]");
  const notes = [...document.querySelectorAll<HTMLElement>("[data-verify]")].filter((el) => !el.closest("dialog"));
  notes.forEach((el, i) => {
    if (!el.id) el.id = `verify-${i + 1}`;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${el.id}`;
    a.textContent = el.dataset.verify ?? "";
    li.append(a);
    list?.append(li);
  });
  if (count) count.textContent = String(notes.length);
}

/* "Become a sponsor" style links preselect the matching option in the form they jump to. */
document.addEventListener("click", (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("[data-partner-type]");
  if (!link) return;
  const target = document.querySelector(link.hash);
  const select = target?.querySelector<HTMLSelectElement>("select[name=partnerType]");
  if (select) select.value = link.dataset.partnerType ?? select.value;
});

/* ==========================================================
   Part 2 & 3 — JavaScript Functions, Scope, and Animation Triggers
   ========================================================== */
"use strict";

/* ------------------------------
   GLOBAL (MODULE) SCOPE
   ------------------------------ */
const AppState = {
  animationRuns: 0,           // global counter used by multiple functions
  lastDurationMs: 900         // shared config for slide animation
};

// Utility: query helpers (pure functions, return values)
const qs  = (sel, el = document) => el.querySelector(sel);
const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

// Utility: toggle a class with an optional boolean "force" parameter
function toggleClass(el, className, force){
  if(!el) return false;
  if(typeof force === "boolean"){ el.classList.toggle(className, force); return force; }
  el.classList.toggle(className);
  return el.classList.contains(className);
}

// Utility: clamp a number into a range (params + return)
function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

// Compute a duration in ms from a user multiplier (demonstrates params + return)
function computeDurationMs(multiplier){
  const base = 900; // ms
  const m = clamp(Number(multiplier) || 1, 0.25, 4);
  return Math.round(base * m);
}

// Convert milliseconds to a '0.9s' style string (pure function)
function msToSecondsString(ms){
  return (ms/1000).toFixed(2) + "s";
}

/* Closure example: returns an increment function that captures a private counter */
function makeCounter(start = 0){
  let count = start;              // function (local) scope captured in closure
  return function inc(){          // returned function closes over 'count'
    count += 1;
    return count;
  };
}
const incrementRuns = makeCounter(AppState.animationRuns);

/* ------------------------------
   PART 2 — Wire up demo controls
   ------------------------------ */
const calcBtn = qs("#calcBtn");
const durationInput = qs("#durationMultiplier");
const calcResult = qs("#calcResult");

calcBtn?.addEventListener("click", () => {
  // LOCAL SCOPE
  const localMultiplier = durationInput.value;     // local to this handler
  const duration = computeDurationMs(localMultiplier); // function with params/return
  AppState.lastDurationMs = duration;              // write global/shared state

  // Show readable result (uses a pure function that returns a string)
  calcResult.textContent = `Computed duration: ${duration}ms (${msToSecondsString(duration)})`;
});

/* Scope explanation demo */
const scopeBtn = qs("#scopeBtn");
const scopeOut = qs("#scopeOut");

scopeBtn?.addEventListener("click", () => {
  let text = [];
  // Block scope vs global
  {
    const blockScoped = "I'm inside a block with 'const'";
    text.push(blockScoped);
  }
  text.push(`Global AppState.lastDurationMs = ${AppState.lastDurationMs}`);

  // Demonstrate closure counter
  const run1 = incrementRuns();
  const run2 = incrementRuns();
  text.push(`Closure counter values: run1=${run1}, run2=${run2} (persists across clicks)`);

  scopeOut.textContent = text.join("\n");
});

/* ------------------------------
   PART 3 — JS triggers CSS animations
   ------------------------------ */

/* A) Animate box on click: add .run, set custom duration via style */
const animateBtn = qs("#animateBtn");
const box = qs("#box");

animateBtn?.addEventListener("click", () => {
  const duration = AppState.lastDurationMs; // pull from global state
  // Set an inline style to demonstrate JS → CSS variable usage
  box.style.animationDuration = msToSecondsString(duration);
  // Optionally set easing with a CSS variable:
  box.style.setProperty("--ease", "cubic-bezier(.2,.8,.2,1)");
  // retrigger the animation by removing and readding the class
  box.classList.remove("run");
  // Force reflow so the animation restarts reliably
  void box.offsetWidth; // eslint-disable-line no-unused-expressions
  box.classList.add("run");
});

/* B) Card flip on click: toggle class .is-flipped */
const flipBtn = qs("#flipBtn");
const jsFlipCard = qs("#jsFlipCard");

flipBtn?.addEventListener("click", () => {
  const isFlipped = toggleClass(jsFlipCard, "is-flipped");
  flipBtn.textContent = isFlipped ? "Unflip Card" : "Flip Card";
});

/* C) Loader start/stop */
const startLoader = qs("#startLoader");
const stopLoader  = qs("#stopLoader");
const loader = qs("#loader");

startLoader?.addEventListener("click", () => {
  toggleClass(loader, "on", true); // force on
});
stopLoader?.addEventListener("click", () => {
  toggleClass(loader, "on", false); // force off
});

/* D) Modal open/close with slide-in & fade-out */
const modal = qs("#modal");
const openModalBtn = qs("#openModal");
const closeModalBtn = qs("#closeModal");
const backdrop = qs(".modal__backdrop");

function openModal(){
  modal.classList.remove("closing");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(){
  // Add a short fade-out animation before fully hiding
  modal.classList.add("closing");
  setTimeout(() => {
    modal.classList.remove("open","closing");
    modal.setAttribute("aria-hidden", "true");
  }, 260);
}

openModalBtn?.addEventListener("click", openModal);
closeModalBtn?.addEventListener("click", closeModal);
backdrop?.addEventListener("click", closeModal);

/* Escape key to close modal (keyboard accessibility) */
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && modal.classList.contains("open")){
    closeModal();
  }
});

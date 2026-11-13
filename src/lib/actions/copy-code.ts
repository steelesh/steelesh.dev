export function copyCode(node: HTMLElement) {
  const timers = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>();
  const pending = new WeakSet<HTMLButtonElement>();
  let destroyed = false;

  async function handleClick(event: Event) {
    if (!(event.target instanceof Element))
      return;
    const button = event.target.closest<HTMLButtonElement>(".code-block__copy");
    if (!button || pending.has(button) || button.classList.contains("copied"))
      return;

    const block = button.closest(".code-block");
    const code = block?.querySelector("code");
    const status = block?.querySelector(".code-block__status");
    if (!code || !status)
      return;

    pending.add(button);
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(code.textContent ?? "");
      if (destroyed)
        return;
      button.classList.add("copied");
      button.setAttribute("aria-label", "Code copied");
      status.textContent = "Code copied to clipboard.";
      timers.set(button, setTimeout(() => {
        button.classList.remove("copied");
        button.setAttribute("aria-label", "Copy code");
        status.textContent = "";
        timers.delete(button);
      }, 1500));
    }
    catch {
      if (!destroyed)
        status.textContent = "Could not copy. Select the code and copy it manually.";
    }
    finally {
      pending.delete(button);
    }
  }

  node.addEventListener("click", handleClick);
  const buttons = node.querySelectorAll<HTMLButtonElement>(".code-block__copy");
  for (const button of buttons)
    button.disabled = false;

  return () => {
    destroyed = true;
    node.removeEventListener("click", handleClick);
    for (const button of buttons)
      button.disabled = true;
    for (const timer of timers.values())
      clearTimeout(timer);
  };
}

export function copyCode(node: HTMLElement) {
  function handleClick(e: Event) {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".code-block__copy");
    if (!btn || btn.classList.contains("copied"))
      return;

    const block = btn.closest(".code-block");
    const code = block?.querySelector("code")?.textContent ?? "";

    navigator.clipboard.writeText(code).then(() => {
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1500);
    }).catch(() => {});
  }

  node.addEventListener("click", handleClick);

  return () => {
    node.removeEventListener("click", handleClick);
  };
}

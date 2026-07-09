const PHONE_LINK_OBSERVER_KEY = "__hoganObfuscatedPhoneLinksObserver";

function setObfuscatedPhoneLinkHref(link) {
  if (!link || !link.matches?.("a[data-obf-tel]")) return false;
  if (link.dataset.obfResolved === "true") return true;

  const encoded = link.getAttribute("data-obf-tel") || "";
  if (!encoded) {
    link.dataset.obfResolved = "true";
    return false;
  }

  try {
    const decoded = atob(encoded);
    if (decoded.startsWith("tel:")) {
      link.href = decoded;
      link.dataset.obfResolved = "true";
      return true;
    }
  } catch {
    // Ignore malformed payloads.
  }

  link.dataset.obfResolved = "true";
  return false;
}

function ensureObserver(root = document) {
  if (typeof MutationObserver === "undefined") return;

  const targetRoot = root?.nodeType === Node.ELEMENT_NODE ? root : document.body || document.documentElement;
  if (!targetRoot || targetRoot[PHONE_LINK_OBSERVER_KEY]) return;

  const observer = new MutationObserver(() => {
    initObfuscatedPhoneLinks(root);
  });

  observer.observe(targetRoot, { childList: true, subtree: true });
  targetRoot[PHONE_LINK_OBSERVER_KEY] = observer;
}

export function initObfuscatedPhoneLinks(root = document) {
  if (!root) return;

  const container = root.nodeType === Node.ELEMENT_NODE ? root : document;
  const links = container.querySelectorAll?.("a[data-obf-tel]") || [];
  links.forEach((link) => {
    setObfuscatedPhoneLinkHref(link);
  });

  ensureObserver(root);
}

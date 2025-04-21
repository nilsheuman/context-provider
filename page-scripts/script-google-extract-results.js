(function () {
  const descriptionClass = ".VwiC3b";
  const container = document.getElementById("search");
  if (!container) {
    console.warn("No container with id 'search' found.");
    return [];
  }
  const descriptions = Array.from(container.querySelectorAll(descriptionClass));
  const results = [];
  for (const desc of descriptions) {
    let current = desc.parentElement;
    while (current && current !== container) {
      const h3 = current.querySelector("a h3");
      const link = h3?.closest("a");
      if (link instanceof HTMLAnchorElement && current.contains(desc)) {
        results.push({
          href: link.href,
          title: h3.textContent?.trim() ?? "",
          description: desc.textContent?.trim() ?? "",
        });
        break; // Found the pair, no need to go higher
      }
      current = current.parentElement;
    }
  }
  return results;
})();

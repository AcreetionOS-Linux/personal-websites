(() => {
  const platform = "Codeberg";
  const platformKey = platform.toLowerCase();
  const account = "sprunglesontheberg";
  const workerUrl = "https://repos.acreetionos.org";
  const mutationDebounceMs = 120;
  let rendering = false;

  function removeCodebergFromExistingLists() {
    document.querySelectorAll(".repo-item").forEach((item) => {
      const source = item.querySelector(".repo-source");
      if (source?.textContent.trim().toLowerCase() === platform.toLowerCase()) {
        item.remove();
      }
    });
  }

  function addRepository(list, repository) {
    const item = document.createElement("a");
    item.className = "codeberg-repository";
    item.href = repository.url;
    item.target = "_blank";
    item.rel = "noopener noreferrer";

    const header = document.createElement("div");
    header.className = "codeberg-repository-header";
    const name = document.createElement("strong");
    name.textContent = repository.name;
    const source = document.createElement("span");
    source.textContent = platform;
    header.append(name, source);

    const description = document.createElement("p");
    description.textContent = repository.description || "No description available.";
    const details = document.createElement("small");
    const updated = repository.updated ? new Date(repository.updated).toLocaleDateString() : "";
    details.textContent = [repository.language, updated].filter(Boolean).join(" · ");

    item.append(header, description, details);
    list.append(item);
  }

  async function renderCodeberg() {
    if (rendering || document.getElementById("codeberg-projects")) return;

    const ecosystem = document.getElementById("ecosystem");
    if (!ecosystem) return;
    rendering = true;

    try {
      const response = await fetch(workerUrl);
      if (!response.ok) throw new Error(`Worker returned ${response.status}`);
      const payload = await response.json();
      const repositories = (payload.repos || []).filter((repository) =>
        typeof repository.source === "string" &&
        repository.source.toLowerCase() === platformKey &&
        typeof repository.url === "string" &&
        repository.url.startsWith(`https://codeberg.org/${account}/`)
      );

      const section = document.createElement("section");
      section.id = "codeberg-projects";
      section.className = "codeberg-projects";
      const heading = document.createElement("h2");
      const icon = document.createElement("i");
      icon.className = "fas fa-code-branch";
      heading.append(icon, ` ${platform}`);
      const summary = document.createElement("p");
      summary.className = "section-sub";
      summary.textContent = `${repositories.length} repositories from ${account}`;
      const card = document.createElement("div");
      card.className = "card";
      const list = document.createElement("div");
      list.className = "codeberg-repository-list";

      if (repositories.length === 0) {
        list.textContent = "No Codeberg repositories found.";
      } else {
        repositories.forEach((repository) => addRepository(list, repository));
      }

      card.append(list);
      section.append(heading, summary, card);
      ecosystem.after(section);
      removeCodebergFromExistingLists();
    } catch (error) {
      console.error("Failed to fetch Codeberg repositories:", error);
    } finally {
      rendering = false;
    }
  }

  const start = () => {
    const app = document.getElementById("app");
    if (!app) return;

    let observerTimer;
    const observer = new MutationObserver((mutations) => {
      const repositoryMutation = mutations.some(({ addedNodes }) =>
        [...addedNodes].some((node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.id === "ecosystem" || node.matches(".repo-item") || node.querySelector(".repo-item"))
        )
      );
      if (!repositoryMutation) return;

      clearTimeout(observerTimer);
      observerTimer = setTimeout(() => {
        removeCodebergFromExistingLists();
        renderCodeberg();
      }, mutationDebounceMs);
    });
    observer.observe(app, { childList: true, subtree: true });
    renderCodeberg();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

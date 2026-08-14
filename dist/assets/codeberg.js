(() => {
  const platform = "Codeberg";
  const apiUrl = "https://codeberg.org/api/v1/users/sprunglesontheberg/repos?limit=100&sort=updated";
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
    item.href = repository.html_url || repository.url;
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
    const updated = repository.updated_at ? new Date(repository.updated_at).toLocaleDateString("en-US") : "";
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
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Codeberg API returned ${response.status}`);
      const repositories = await response.json();
      const list = document.createElement("div");
      list.className = "codeberg-repository-list";

      if (!repositories || repositories.length === 0) {
        list.textContent = "No Codeberg repositories found.";
      } else {
        repositories.forEach((repository) => addRepository(list, repository));
      }

      const section = document.createElement("section");
      section.id = "codeberg-projects";
      section.className = "codeberg-projects";
      const heading = document.createElement("h2");
      const icon = document.createElement("i");
      icon.className = "fas fa-code-branch";
      heading.append(icon, ` ${platform}`);
      const summary = document.createElement("p");
      summary.className = "section-sub";
      summary.textContent = `${repositories.length} repositories from sprunglesontheberg`;
      const card = document.createElement("div");
      card.className = "card";
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
    let observerTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(observerTimer);
      observerTimer = setTimeout(() => {
        removeCodebergFromExistingLists();
        renderCodeberg();
      }, 50);
    });
    observer.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
    renderCodeberg();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

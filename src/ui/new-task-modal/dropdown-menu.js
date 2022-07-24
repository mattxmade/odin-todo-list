const initDropdown = (userInputs, projects) => {
  userInputs.project.drpDn.addEventListener("click", menuHandler);

  function menuHandler(e) {
    if (userInputs.project.menu.length === 0) {
      const selectContainer = document.createElement("ul");
      selectContainer.classList.add("project-select-menu");
      selectContainer.style.width = "100%";
      selectContainer.style.height = "auto";
      selectContainer.style.position = "relative";
      selectContainer.style.visibility = "visible";

      if (projects.length === 0) {
        const selector = document.createElement("li");
        selector.classList.add("project-selector");
        selector.textContent = "Empty";
        selector.style.position = "relative";
        selector.style.cursor = "pointer";
        selectContainer.appendChild(selector);
      } else {
        for (const project of projects) {
          const selector = document.createElement("li");
          selector.classList.add("project-selector");
          selector.style.cursor = "pointer";
          selector.textContent = project.name;

          selector.addEventListener("click", (e) => {
            userInputs.project.input.value = selector.textContent;
          });

          selectContainer.appendChild(selector);
        }
      }
      userInputs.project.menu.push(selectContainer);
      userInputs.project.group.appendChild(selectContainer);
    } else {
      userInputs.project.menu[0].remove();
      userInputs.project.menu = [];
    }
  }
};

export default initDropdown;

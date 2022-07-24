import track from "../data/trackers";

function Group(project, ui) {
  const parent = ui.aside;
  const heading = ui.tasks.dashboard.heading;

  //lastSelectedProject

  // li
  const projectItem = document.createElement("li");
  projectItem.id = project.id;
  projectItem.classList.add("project");

  // div
  const projectInfo = document.createElement("div");
  projectInfo.classList.add("project-info");

  // icon
  const projectIcon = document.createElement("i");
  projectIcon.classList.add("fas");
  projectIcon.classList.add("fa-circle");
  projectIcon.classList.add("project-icon");
  //projectIcon.style.color = project.color;  //setColor
  projectInfo.appendChild(projectIcon);

  // paragraph
  const projectName = document.createElement("p");
  projectName.classList.add("project-name");
  projectName.textContent = project.name;
  projectInfo.appendChild(projectName);

  projectItem.appendChild(projectInfo);

  const taskCount = document.createElement("p");
  taskCount.classList.add("project-task-count");
  taskCount.textContent = project.tasks.length;
  projectItem.appendChild(taskCount);

  projectItem.addEventListener("click", (e) => {
    heading.textContent = project.name;
    track.project.method(ui.tasks.dashboard.project, project.id);

    for (let node of ui.dateTabs.children)
      node.classList.remove("js-aside-highlight");
    if (track.project.last !== undefined)
      track.project.last.remove("js-aside-highlight");

    e.target.classList.add("js-aside-highlight");

    track.project.last = projectItem.classList;
  });

  parent.appendChild(projectItem);

  return projectItem;
}

export default Group;

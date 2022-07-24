import track from "../data/trackers";
import { format } from "date-fns";

// generate dashboard task
function Card(task) {
  const cardItem = document.createElement("li");
  cardItem.id = task.id;
  cardItem.dataset.project = task.projectID;
  cardItem.classList.add("task-card");

  const congratsMask = document.createElement("div");
  congratsMask.classList.add("congrats-mask");
  congratsMask.style.position = "absolute";
  congratsMask.style.width = "100%";
  congratsMask.style.height = "100%";

  const congratMessage = document.createElement("p");
  congratMessage.classList.add("congrats-message");
  congratMessage.textContent = "Great Work!";

  congratsMask.appendChild(congratMessage);
  cardItem.appendChild(congratsMask);

  const checkBox = document.createElement("div");
  checkBox.classList.add("task-check-col-1");

  const iCheck = document.createElement("i");
  iCheck.classList.add("far");
  iCheck.classList.add("fa-circle");
  iCheck.classList.add("task-complete");

  iCheck.addEventListener("click", (e) => {
    e.target.classList.remove("far");
    e.target.classList.remove("fa-circle");

    e.target.classList.add("fas");
    e.target.classList.add("fa-check-circle");
    e.target.style.color = "green";

    setTimeout(() => congratsMask.classList.add("show-congrats-mask"), 1200);
    setTimeout(() => cardItem.classList.add("remove-task"), 2400);
    setTimeout(() => track.task.method(task, "remove", cardItem), 3600);
  });

  const iFlag = document.createElement("i");
  iFlag.classList.add("fas");
  iFlag.classList.add("fa-flag");
  iFlag.classList.add("task-priority");
  iFlag.style.color = task.priorityFlag;

  checkBox.appendChild(iCheck);
  checkBox.appendChild(iFlag);
  cardItem.appendChild(checkBox);

  const taskInfoBox = document.createElement("div");
  taskInfoBox.classList.add("task-info");

  const heading = document.createElement("h4");
  heading.classList.add("task-heading");
  heading.textContent = task.name;
  taskInfoBox.appendChild(heading);

  // ul
  const taskList = document.createElement("ul");
  taskList.classList.add("task-details");
  taskInfoBox.appendChild(taskList);

  // li - Date
  const dateItem = document.createElement("li");
  dateItem.classList.add("task-date");

  const iDate = document.createElement("i");
  iDate.classList.add("far");

  task.dueDate === ""
    ? iDate.classList.add("fa-calendar")
    : iDate.classList.add("fa-calendar-check");

  iDate.classList.add("task-date-icon");
  dateItem.appendChild(iDate);

  const pDate = document.createElement("p");
  pDate.classList.add("task-date-text");

  task.dueDate !== ""
    ? (pDate.textContent = format(
        new Date(task.dueDate.year, task.dueDate.month - 1, task.dueDate.day),
        "eee dd MMM yyyy"
      ))
    : (pDate.textContent = "");

  if (task.dueDate === "") {
    pDate.textContent = "";
    iDate.style.color = "lightgrey";
  }

  dateItem.appendChild(pDate);
  taskList.appendChild(dateItem);

  // li - Project
  const projectItem = document.createElement("li");
  projectItem.classList.add("task-project");
  projectItem.style.width = "45%";

  const pProject = document.createElement("p");
  pProject.classList.add("task-project-text");
  pProject.textContent = task.project;
  projectItem.appendChild(pProject);

  const iProject = document.createElement("i");
  iProject.classList.add("fas");
  iProject.classList.add("fa-circle");
  iProject.classList.add("task-project-icon");

  projectItem.appendChild(iProject);
  taskList.appendChild(projectItem);

  // li - Remove
  const removeItem = document.createElement("li");
  removeItem.classList.add("task-remove");

  const iRemove = document.createElement("i");
  iRemove.classList.add("far");
  iRemove.classList.add("fa-trash-alt");

  iRemove.addEventListener("click", () => {
    cardItem.classList.add("remove-task");
    setTimeout(() => track.task.method(task, "remove", cardItem), 1200);
  });

  iProject.classList.add("task-remove-icon");
  removeItem.appendChild(iRemove);
  taskList.appendChild(removeItem);

  cardItem.appendChild(taskInfoBox);
  return cardItem;
}

export default Card;

/*====== Date-fns ======================================
  -----------------------------------------------------
  + JS months are 0 indexed 
  >>> pass -1 with month when calling date-fns methods
  -----------------------------------------------------
========================================================*/

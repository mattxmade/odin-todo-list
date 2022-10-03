import "./style.css";

// Model
import Task from "./Task";
import Project from "./Project";
import track from "./data/trackers";

// UI
import Card from "./ui/task-card";
import Group from "./ui/project-tab";
import Components from "./ui/components";
import initCalendar from "./ui/new-task-modal/calendar-input";
import initDropdown from "./ui/new-task-modal/dropdown-menu";

// utility
import { updateStorage, checkStorage } from "./local-storage/local-storage";
import { getDate, getMonth, getYear, isFuture, isToday } from "date-fns";

const Todo = (() => {
  const components = Components();
  const ui = components.views;

  let lastView = ui.tasks.dashboard.all;
  let currentView = ui.tasks.dashboard.all;

  // model
  const projects = Project.projects;
  const userStorage = localStorage.getItem("projectList");

  const userData = checkStorage(userStorage);

  const _userData = () => {
    if (userData.length) _restore(userData);
  };

  const _restore = (data) => {
    data.forEach((project) => {
      if (project.tasks) for (const task of project.tasks) _renderTask(task);
    });
  };

  const _renderTask = (task) => {
    const setProject = _getTaskProject(task.project, projects);
    _addTaskToProject(task, setProject);

    let lastIndex = projects.length;
    _addProjectToProjectsIndex(setProject, projects);

    // create + display project name in projects aside
    if (lastIndex !== projects.length) Group(setProject, ui);

    // create task card
    const newTaskCard = Card(task);

    // render card to correct view
    _renderToView(newTaskCard, currentView);
  };

  const _updateStorage = () =>
    localStorage.setItem("projectList", JSON.stringify(projects));

  // Model :: Data :: Project
  const _notifyProject = (taskToHandle, action) => {
    for (const project of projects) {
      project.tasks.forEach((task, index) => {
        switch (action) {
          case "add":
            if (task.id === taskToHandle.id) project.tasks.push(task);
            break;

          case "remove":
            if (task.id === taskToHandle.id) project.tasks.splice(index, 1);
            break;
        }
      });
    }
  };

  // Project: methods
  const _getTaskProject = (projectName, projects) => {
    for (const project of projects) {
      if (projectName === project.name) return project;
    }

    return Project.create(projectName);
  };

  const _addTaskToProject = (task, project) => {
    project.tasks.push(task);
    task.projectID = project.id;
  };

  const _addProjectToProjectsIndex = (project, projectsToSearch) => {
    Project.addProjectToProjectsIndex(project, projectsToSearch);
  };

  // New task inputs
  const userInputs = components.inputs;

  // could put this inside components
  initCalendar(ui, userInputs, components.eventListeners);

  // controller ? | Deals with model and views
  initDropdown(userInputs, projects);

  // Modal View :: Input group for quick iteration
  const keyInputGroup = [
    userInputs.task.input,
    userInputs.project.input,
    userInputs.project.drpDn,

    userInputs.date.day,
    userInputs.date.month,
    userInputs.date.year,

    ui.calendar.container,
    userInputs.priorityFlag.group,
  ];

  // View Methods
  const view = {
    data: { search: { results: [] } },

    updateProjectTaskTotal: () => {
      for (const project of projects) {
        for (const projectList of ui.aside.children) {
          if (project.id === projectList.id) {
            projectList.children[1].textContent = project.tasks.length;

            if (project.tasks.length === 0)
              projectList.children[1].textContent = "";
          }
        }
      }
    },

    updateNotifications: function (projects) {
      for (const project of projects) {
        if (project.tasks.length !== 0)
          return ui.notifications.classList.add("notify");
      }
      ui.notifications.classList.remove("notify");
    },

    populateByProject: function (view, ID) {
      currentView = view;
      if (currentView === lastView) return;

      _clearLastView(lastView);

      lastView.style.position = "absolute";
      currentView.style.position = "relative";

      let toAdd = [];
      let toRemove = [];

      if (lastView.children.length !== 0) {
        for (const item of lastView.children) {
          toRemove.push(item);
        }
      }

      toRemove.forEach((item) => item.remove());
      toRemove = [];

      for (const project of projects) {
        if (project.tasks.length !== 0)
          project.tasks.forEach((task) => {
            if (project.id === ID) toAdd.push(Card(task));
          });
      }

      toAdd.forEach((item) => currentView.appendChild(item));
      toAdd = [];

      lastView = currentView;
    },

    search: function (view, tasks) {
      currentView = view;

      _clearLastView(lastView);

      lastView.style.position = "absolute";
      currentView.style.position = "relative";

      let toAdd = [];

      tasks.forEach((task) => toAdd.push(Card(task)));

      toAdd.forEach((item) => currentView.appendChild(item));
      toAdd = [];

      lastView = currentView;
    },

    sort: function (view, dateSortCallback) {
      currentView = view;
      if (currentView === lastView) return;

      _clearLastView(lastView);

      lastView.style.position = "absolute";
      currentView.style.position = "relative";

      let toAdd = [];

      for (const project of projects) {
        if (project.tasks.length !== 0)
          project.tasks.forEach((task) => {
            switch (dateSortCallback) {
              case null:
                toAdd.push(Card(task));
                break;

              default:
                if (
                  dateSortCallback(
                    new Date(
                      task.dueDate.year,
                      task.dueDate.month - 1,
                      task.dueDate.day
                    )
                  )
                )
                  toAdd.push(Card(task));
                break;
            }
          });
      }

      toAdd.forEach((item) => currentView.appendChild(item));
      toAdd = [];

      lastView = currentView;
    },
  };

  const _clearLastView = (viewToClear) => {
    let toRemove = [];

    if (viewToClear.children.length !== 0) {
      for (const item of viewToClear.children) toRemove.push(item);
    }

    toRemove.forEach((item) => item.remove());
    toRemove = [];
  };

  const _renderToView = (element, view) => {
    switch (view) {
      case ui.tasks.dashboard.all:
        view.appendChild(element);
        break;

      case ui.tasks.dashboard.today:
        if (
          !isFuture(
            new Date(
              element.dueDate.year,
              element.dueDate.month - 1,
              element.dueDate.day
            )
          )
        ) {
          view.appendChild(element);
        }
        break;

      case ui.tasks.dashboard.upcoming:
        if (
          isFuture(
            new Date(
              element.dueDate.year,
              element.dueDate.month - 1,
              element.dueDate.day
            )
          )
        ) {
          view.appendChild(element);
        }
        break;
    }
  };

  // Controller :: Observers + Notifiers
  const controller = {
    observers: { config: { attributes: true, childList: true, subtree: true } },

    notify: (data, action, element) => {
      _notifyProject(data, action);
      _updateStorage();
      element.remove();
    },

    displayAdapter: (element, view) => {
      _renderToView(element, view);
    },

    taskHandler: (task) => {
      // set task creation date + due date
      addTaskDate(task);

      // render task to view
      _renderTask(task);

      // update local session storage
      _updateStorage();
    },
  };

  controller.observers.mainWindow = new MutationObserver(
    (mutationList, observer) => {
      view.updateProjectTaskTotal();
      view.updateNotifications(projects);
    }
  );

  controller.observers.mainWindow.observe(
    ui.mainWindow,
    controller.observers.config
  );

  track.project.method = view.populateByProject;
  track.task.method = controller.notify;

  return {
    ui,
    view,
    projects,
    controller,
    userInputs,
    keyInputGroup,

    restore: () => _userData(),
  };
})();

const newTaskButtons = document.querySelectorAll(".pointer");

newTaskButtons.forEach((btn) => {
  btn.addEventListener("click", showTaskForm);
});

// Modal
const taskModal = document.querySelector("dialog");

const flagIcon = document.querySelector(".flg");

function showTaskForm(e) {
  taskModal.showModal();

  const newTask = Task.create();

  const form = document.querySelector("form");
  const inputs = form.elements;

  inputs["task"].addEventListener("input", (e) => {
    document.querySelector(".fa-exclamation").classList.remove("show-error");
  });

  const flagIcons = document.querySelectorAll(".priority-flag");
  const closeButton = document.querySelector(".cancel");

  form.addEventListener("submit", formHandler);

  flagIcons.forEach((flag) => {
    flag.addEventListener("click", setPriortiy);
  });

  closeButton.addEventListener("click", hideTaskForm);

  function formHandler(e) {
    e.preventDefault();

    newTask.name = inputs["task"].value;

    // Empty task description? :: return + visual error
    document.querySelector(".fa-exclamation").classList.remove("show-error");
    if (newTask.name === "")
      return document
        .querySelector(".fa-exclamation")
        .classList.add("show-error");

    // Process task
    newTask.project = inputs["project"].value;

    if (newTask.project === "") newTask.project = "User";
    // TODO add project dot colour !

    // handle data and render to view
    Todo.controller.taskHandler(newTask);

    taskModal.close();

    form.removeEventListener("submit", formHandler);

    flagIcons.forEach((flag) => {
      flag.removeEventListener("click", setPriortiy);
    });

    closeButton.removeEventListener("click", hideTaskForm);
  }

  function setPriortiy(e) {
    newTask.priorityFlag = getComputedStyle(e.target).color;
    flagIcon.style.color = getComputedStyle(e.target).color;
  }

  function hideTaskForm(e) {
    e.preventDefault();

    taskModal.close();

    for (let property in newTask) {
      delete newTask[property];
    }

    form.removeEventListener("submit", formHandler);

    flagIcons.forEach((flag) => {
      flag.removeEventListener("click", setPriortiy);
    });

    closeButton.removeEventListener("click", hideTaskForm);
  }
}

function addTaskDate(task) {
  const dateToday = Date.now();
  task.creationDate.year = getYear(dateToday);
  task.creationDate.month = getMonth(dateToday) + 1;
  task.creationDate.day = getDate(dateToday);

  const myDate = [
    Number(Todo.userInputs.date.myYear.textContent),
    Number(Todo.userInputs.date.myMonth.textContent),
    Number(Todo.userInputs.date.myDay.textContent),
  ];

  myDate.forEach((date) => {
    if (isNaN(date)) task.dueDate = "";
    else {
      task.dueDate.year = myDate[0];
      task.dueDate.month = myDate[1];
      task.dueDate.day = myDate[2];
    }
  });
}

Todo.ui.modal.task.icons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    for (const icon of Todo.ui.modal.task.icons) {
      icon.classList.remove("modal-icon-select");
    }

    for (const flag of Todo.userInputs.priorityFlag.group.children) {
      flag.children[0].style.visibility = "hidden";
    }

    Todo.keyInputGroup.forEach((input) => {
      if (input !== "") input.style.visibility = "hidden";
    });

    e.target.classList.add("modal-icon-select");

    switch (e.target.classList[2]) {
      case "pen":
        Todo.userInputs.task.input.style.visibility = "visible";
        Todo.userInputs.task.input.focus();
        break;

      case "prj":
        Todo.userInputs.project.input.style.visibility = "visible";
        Todo.userInputs.project.drpDn.style.visibility = "visible";
        Todo.userInputs.project.input.focus();
        break;

      case "cal":
        for (const dateInput of Todo.userInputs.date.group) {
          dateInput.style.visibility = "visible";
        }
        break;

      case "flg":
        Todo.userInputs.priorityFlag.group.style.visibility = "visible";

        for (const flag of Todo.userInputs.priorityFlag.group.children) {
          flag.children[0].style.visibility = "visible";
        }
        break;
    }
  });
});

// aside - menu drawer icon
const aside = document.querySelector("aside");
const asideIcon = document.querySelector(".aside-drawer-icon");
asideIcon.addEventListener("click", () =>
  aside.classList.toggle("js-aside-drawer-animation")
);

// aside - Dates Menu
for (let section of Todo.ui.dateTabs.children) {
  section.addEventListener("click", (e) => {
    if (track.project.last !== undefined)
      track.project.last.remove("js-aside-highlight");
    for (let node of Todo.ui.dateTabs.children)
      node.classList.remove("js-aside-highlight");

    e.target.classList.add("js-aside-highlight");
    sortTasks(e);
  });
}

const newTaskDb = document.querySelector(".new-task");

function sortTasks(e) {
  newTaskDb.style.visibility = "visible";
  switch (e.target.textContent.trim()) {
    case "Tasks":
      Todo.ui.tasks.dashboard.heading.textContent = "Tasks";
      Todo.view.sort(Todo.ui.tasks.dashboard.all, null);
      break;

    case "Today":
      Todo.ui.tasks.dashboard.heading.textContent = "Today";
      Todo.view.sort(Todo.ui.tasks.dashboard.today, isToday);
      break;

    case "Upcoming":
      Todo.ui.tasks.dashboard.heading.textContent = "Upcoming";
      Todo.view.sort(Todo.ui.tasks.dashboard.upcoming, isFuture);
      break;
  }
}

// change to group if more dropdowns required
const projectsDropdown = document.querySelector(".js-projects-dropdown");
projectsDropdown.addEventListener("click", (e) => {
  e.target.style.backgroundColor = "transparent";
  e.target.parentNode.parentNode.classList.toggle("dropdown-menu");
  e.target.parentNode.children[1].classList.toggle("dropdown-state");

  e.target.classList.add("js-aside-highlight");
});

// search
const search = document.querySelector(".js-search");

search.addEventListener("input", (e) => {
  newTaskDb.style.visibility = "hidden";
  Todo.ui.tasks.dashboard.heading.textContent = "Search";

  Todo.projects.forEach((project) => {
    for (const task of project.tasks) {
      if (task.name.toLowerCase() === e.target.value.toLowerCase()) {
        Todo.view.data.search.results.push(task);
      }
    }
  });

  Todo.view.search(
    Todo.ui.tasks.dashboard.search,
    Todo.view.data.search.results
  );

  Todo.view.data.search.results = [];
});

search.addEventListener("blur", (e) => {
  Todo.view.search.results = [];
});

Todo.restore();

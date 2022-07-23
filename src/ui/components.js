import Calendar from "../Calendar";

const Components = () => {
  const calendar = Calendar();
  document.querySelector(".input-calendar").appendChild(calendar.container);

  const views = {
    modal: { task: { icons: document.querySelectorAll(".js-task-icon") } },
    calendar: calendar,
    notifications: document.querySelector(".user-notify"),
    aside: document.querySelector(".app-aside-projects"),
    dateTabs: document.querySelector(".app-aside-calendar"),
    mainWindow: document.querySelector(".app-main-task-window"),
    dbHeading: document.querySelector(".dashboard-title"),

    tasks: {
      dashboard: {
        heading: document.querySelector(".dashboard-title"),
        all: document.querySelector(".dashboard-tasks"),
        today: document.querySelector(".dashboard-today"),
        search: document.querySelector(".dashboard-search"),
        project: document.querySelector(".dashboard-project"),
        upcoming: document.querySelector(".dashboard-upcoming"),
      },
    },
  };

  const inputs = {
    task: { input: document.querySelector(".input-task") },

    project: {
      input: document.querySelector(".input-project"),
      drpDn: document.querySelector(".input-dropdown-icon"),
      group: document.querySelector(".dropdown-set-project"),
      menu: [],
    },

    date: {
      day: document.querySelector(".input-day"),
      year: document.querySelector(".input-year"),
      month: document.querySelector(".input-month"),

      myDay: document.querySelector(".input-day").children[0], // paragraph
      myYear: document.querySelector(".input-year").children[0], // paragraph
      myMonth: document.querySelector(".input-month").children[0], // paragraph

      yearUp: document.querySelector(".year-nav-up"),
      yearDn: document.querySelector(".year-nav-down"),
    },

    priorityFlag: {
      icon: document.querySelector(".flg"),
      group: document.querySelector(".flag-icon-group"),
    },
  };

  inputs.date.group = [inputs.date.day, inputs.date.year, inputs.date.month];

  return { views, inputs };
};

export default Components;

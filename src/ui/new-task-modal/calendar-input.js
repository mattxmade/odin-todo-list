import { getDate, getMonth, getYear } from "date-fns";

const initCalendar = (ui, userInputs, eventListeners) => {
  eventListeners.calendar.show.addEventListener("click", showCalendar);
  eventListeners.calendar.hide.addEventListener("click", hideCalendar);

  eventListeners.calendar.daysInMonths.forEach((month) => {
    if (month.tagName === "DIV") {
      month.children[1].childNodes.forEach((day) => {
        day.addEventListener("click", (e) => handleDate(e, month));
      });
    }
  });

  function showCalendar(e) {
    ui.calendar.container.style.visibility = "visible";

    ui.calendar.monthTabs.forEach((month) => {
      if (month.id === ui.calendar.navLeft.dataset.index)
        month.style.visibility = "visible";
    });
  }

  function hideCalendar(e) {
    ui.calendar.monthTabs.forEach(
      (month) => (month.style.visibility = "hidden")
    );

    ui.calendar.container.style.visibility = "hidden";
  }

  function handleDate(day, month) {
    // set day/month to date selected from calendar
    userInputs.date.myDay.textContent = day.target.textContent;
    userInputs.date.myMonth.textContent = month.id;

    // set to current year if year still set as placeholder
    if (userInputs.date.myYear.textContent === "year")
      userInputs.date.myYear.textContent = getYear(Date.now());
  }

  // Year Navigation Icons
  userInputs.date.yearUp.addEventListener("click", (e) => {
    if (userInputs.date.myYear.textContent === "year")
      return setInputToCurrentDate();

    let increment = Number(userInputs.date.myYear.textContent);
    increment++;
    userInputs.date.myYear.textContent = increment;
  });

  function setInputToCurrentDate() {
    userInputs.date.myYear.textContent = getYear(Date.now());

    if (userInputs.date.myDay.textContent === "day")
      userInputs.date.myDay.textContent = getDate(Date.now());
    if (userInputs.date.myMonth.textContent === "month")
      userInputs.date.myMonth.textContent = getMonth(Date.now()) + 1;
  }

  userInputs.date.yearDn.addEventListener("click", (e) => {
    if (userInputs.date.myYear.textContent === "year")
      return setInputToCurrentDate();

    let deincrement = Number(userInputs.date.myYear.textContent);
    deincrement--;
    userInputs.date.myYear.textContent = deincrement;
  });
};

export default initCalendar;

import './style.css';

import Task from './Task';
import Project from './Project';
import Group from './cGroup';

// JS months are 0 indexed ( pass -1 with month when calling date-fns methods )

import { getDate, getDay, getMonth, getYear, isFuture, isToday } from 'date-fns';
import { getDaysInMonth } from 'date-fns'
import { isLeapYear } from 'date-fns';
import { format, compareAsc } from 'date-fns'

import Calendar from './Calendar'

const Todo = (() => {
  // model
  const projects = [];
  const projectsFromLocalStorage = localStorage.getItem('projectList');

  const asideTab_projects = document.querySelector('.app-aside-projects');

  const _checkStorage = () => {
    let restore = true;

    if (projectsFromLocalStorage && projectsFromLocalStorage.length) {
      JSON.parse(projectsFromLocalStorage).forEach(project => {
        if (project.tasks.length !== 0) {
          for (const task of project.tasks) {

            const setProject = _getTaskProject(task.project, projects);
            _addTaskToProject(task, setProject);

            let lastIndex = projects.length;

            Todo._addProjectToProjectsIndex(setProject, projects);
        
            if (lastIndex !== projects.length) {
              // Create new group
              Group(setProject, asideTab_projects);
            }

            const newTaskCard = Card(task);

            //render to correct view
            switch(view.currentView) {
        
              case elements.dashboard:
                view.currentView.appendChild(newTaskCard);
                break;
        
              case elements.today:
                if (!isFuture(new Date(task.dueDate.year, task.dueDate.month-1, task.dueDate.day))) view.currentView.appendChild(newTaskCard);
                break;
        
              case elements.upcoming:
                if (isFuture(new Date(task.dueDate.year, task.dueDate.month-1, task.dueDate.day))) view.currentView.appendChild(newTaskCard);
                break;
            }
          }
        }
      });

      // _checkList(); // placeholder item incase no tasks exist
    }
    else {
      restore = false;
    }
  }

  const _updateStorage = () => localStorage.setItem('projectList', JSON.stringify(projects));

  const model = {
    projects: projects,

    create : { task: () => Task },

    add: {
      task: {
          toProject: (taskToHandle, project) => {
          if (task.id === taskToHandle.id) project.tasks.push(task);
        }        
      }
    },

    remove: {
      task: {
        fromProject: (taskToHandle, project) => {
          if (task.id === taskToHandle.id) project.tasks.splice(index, 1);
        }
      }
    }

  }

  // Model
  const _notifyProject = (taskToHandle, action) => {
    for (const project of projects) {

      project.tasks.forEach((task, index) => {

        switch(action) {
          case 'add':
            if (task.id === taskToHandle.id) project.tasks.push(task);
            break;

          case 'remove':
            if (task.id === taskToHandle.id) project.tasks.splice(index, 1);
            break;
        }          
      });
    };
  }

  // Model
  const _getTaskProject = (projectName, projects) => {
    for (let project of projects) {
      if (projectName === project.name) return project;
    }

    return Project.create(projectName);
  }

  // Model
  const _addTaskToProject = (task, project) => {
    project.tasks.push(task);
    task.projectID = project.id;
  }

  // Model
  // Check if project exists
  const _exists = (itemToCheck, list) => {
    let exists = false;

    list.forEach(item => {

      if (itemToCheck.id === item.id) {
        //console.log(itemToCheck.id, item.id);
        exists = true;
        return;
      }

    });
    return exists;
  }

  // Model
  const _addProjectToProjectsIndex = (project, projects) => {
    if (_exists(project, projects) === false) projects.push(project);
  }

  // Model
  const _removeAllTasksFromProject = (project) => {
    const tasks = project.tasks;
    if (tasks.length === 0) return;
    tasks.splice(0, tasks.length-1);
  }

  // Model
  const _removeProjectFromList = (projectToRemove, projects) => {
    if (projects.length === 0) return;

    projects.forEach((project, index) => {
      if (projectToRemove.id === project.id) {
        _removeAllTasksFromProject(project);
        projects.splice(index);
      }
    });
  }

  // View - DOM
  const elements = {
    modal         : { task: { icons: document.querySelectorAll('.js-task-icon') } },
    calendar      : Calendar(),
    notifications : document.querySelector('.user-notify'),
    aside         : document.querySelector('.app-aside-projects'),
    mainWindow    : document.querySelector('.app-main-task-window'),
    dbHeading     : document.querySelector('.dashboard-title'),
    dashboard     : document.querySelector('.dashboard-tasks'),
    today         : document.querySelector('.dashboard-today'),
    upcoming      : document.querySelector('.dashboard-upcoming'),
    search        : document.querySelector('.dashboard-search'),
    dbProject     : document.querySelector('.dashboard-project'),
  }

  document.querySelector('.input-calendar').appendChild(elements.calendar.container);

  const eventListeners = {
    calendar: {
      show          : document.querySelector('.js-calendar-icon-btn'),
      hide          : document.querySelector('.js-close-calendar-btn'),
      daysInMonths  : elements.calendar.container.childNodes
    }
  }

  eventListeners.calendar.show.addEventListener('click', () => {

    elements.calendar.container.style.visibility = 'visible';
    elements.calendar.monthTabs.forEach(month =>  {
      if (month.id === elements.calendar.navLeft.dataset.index) month.style.visibility = 'visible';
    });

  });

  eventListeners.calendar.hide.addEventListener('click', () => {

    elements.calendar.monthTabs.forEach(month => month.style.visibility = 'hidden');
    elements.calendar.container.style.visibility = 'hidden';
  });

  const userInputs = {
    task : { input: document.querySelector('.input-task') },

    project: {
      input   : document.querySelector('.input-project'),
      drpDn   : document.querySelector('.input-dropdown-icon'),
      group   : document.querySelector('.dropdown-set-project'),
      menu    : []
    },

    date: {
      day     : document.querySelector('.input-day'),
      year    : document.querySelector('.input-year'),
      month   : document.querySelector('.input-month'),

      // newTaskDate | form - catch using above
      myDay   : document.querySelector('.input-day').children[0],   // paragraph
      myYear  : document.querySelector('.input-year').children[0],  // paragraph
      myMonth : document.querySelector('.input-month').children[0], // paragraph

      yearUp  : document.querySelector('.year-nav-up'),
      yearDn  : document.querySelector('.year-nav-down'),
    },

    priorityFlag: {
      icon    : document.querySelector('.flg'),
      group   : document.querySelector('.flag-icon-group')
      
    }
  }

  userInputs.task.input.blur();

  // Date inputs
  userInputs.date.group = [
    userInputs.date.day,
    userInputs.date.year,
    userInputs.date.month
  ]

  eventListeners.calendar.daysInMonths.forEach(month => {
    if (month.tagName === 'DIV') month.children[1].childNodes.forEach(day => 
      day.addEventListener('click', (e) => handleDate(e, month)));
  });

  function handleDate(day, month) {
    // set day/month to date from selected from calendar
    userInputs.date.myDay.textContent = day.target.textContent;
    userInputs.date.myMonth.textContent = month.id;

    // set to current year if year still set as placeholder
    if (userInputs.date.myYear.textContent === 'year') userInputs.date.myYear.textContent = getYear( Date.now() );
  }

  // Year Navigation Icons
  userInputs.date.yearUp.addEventListener('click', (e) => {
    console.dir(e.target);
    if (userInputs.date.myYear.textContent === 'year') return setInputsToTodaysDate();
      
    let increment = Number(userInputs.date.myYear.textContent); increment++;
    userInputs.date.myYear.textContent = increment;
  });

  function setInputsToTodaysDate() {
    Todo.userInputs.date.myYear.textContent = getYear( Date.now() );

    if (userInputs.date.myDay.textContent   ===  'day' ) userInputs.date.myDay.textContent = getDate( Date.now() );
    if (userInputs.date.myMonth.textContent === 'month') userInputs.date.myMonth.textContent = getMonth( Date.now() )+1;
  }

  userInputs.date.yearDn.addEventListener('click', (e) => {
    console.dir(e.target);
    if (userInputs.date.myYear.textContent === 'year') return setInputsToTodaysDate();

    let deincrement = Number(userInputs.date.myYear.textContent); deincrement--;
    userInputs.date.myYear.textContent = deincrement;
  });

  userInputs.project.drpDn.addEventListener('click', () => {

    if (userInputs.project.menu.length === 0) {
  
      const selectContainer = Doc(c, 'ul');
      selectContainer.classList.add('project-select-menu');
      selectContainer.style.width = '100%';
      selectContainer.style.height = 'auto';
      selectContainer.style.position = 'relative';
      selectContainer.style.visibility = 'visible';
  
        if (projects.length === 0) {
          const selector = Doc(c, 'li');
          selector.classList.add('project-selector');
          selector.textContent = 'Empty';
          selector.style.position = 'relative';
          selector.style.cursor = 'pointer';
          selectContainer.appendChild(selector);
        }
  
        else {
          for (const project of projects) {
            const selector = Doc(c, 'li');
            selector.classList.add('project-selector');
            selector.style.cursor = 'pointer';
            selector.textContent = project.name;
  
            selector.addEventListener('click', (e) => {
              userInputs.project.input.value = selector.textContent;
            });
  
            selectContainer.appendChild(selector);
          }
        }
      userInputs.project.menu.push(selectContainer);
      userInputs.project.group.appendChild(selectContainer);  
    }
  
    else {
      userInputs.project.menu[0].remove();
      userInputs.project.menu = [];
    }
  
  });

  const keyInputGroup = [
    userInputs.task.input,
    userInputs.project.input, userInputs.project.drpDn,

    userInputs.date.day, userInputs.date.month,
    userInputs.date.year,

    elements.calendar.container,
    userInputs.priorityFlag.group
  ];

  // Views
  const view = {
    lastView    : elements.dashboard,
    currentView : elements.dashboard,

    updateProjectTaskTotal: function(projects) {

      for (const project of projects) {
        for (const projectList of elements.aside.children) {

          if (project.id === projectList.id) {
            if (project.tasks.length === 0) return projectList.children[1].textContent = '';
            projectList.children[1].textContent = project.tasks.length;
          }  
        } 
      }
    },

    updateNotifications: function(projects) {
      for (const project of projects) {
        if (project.tasks.length !== 0)  return elements.notifications.classList.add('notify');
      }
      elements.notifications.classList.remove('notify');
    },

    populateByProject: function(view, ID) {
      this.currentView = view;

      this.lastView.style.position = 'absolute';
      this.currentView.style.position = 'relative';

      let toAdd = [];
      let toRemove = [];

      if (this.lastView.children.length !== 0) {
        for (const item of this.lastView.children) { toRemove.push(item) }
      }

      toRemove.forEach(item => item.remove());
      toRemove = [];

      for (const project of projects) {
        if (project.tasks.length !== 0) project.tasks.forEach(task => {
          if (project.id === ID) toAdd.push(Card(task));
        });
      }

      toAdd.forEach( item => this.currentView.appendChild( item ));
      toAdd = [];

      this.lastView = this.currentView
    },

    search: function(view, tasks) {
      this.currentView = view;
      //if (this.currentView === this.lastView) return;

      this.lastView.style.position = 'absolute';
      this.currentView.style.position = 'relative';

      let toAdd = [];
      let toRemove = [];

      if (this.lastView.children.length !== 0) {
        for (const item of this.lastView.children) { toRemove.push(item) }
      }

      toRemove.forEach(item => item.remove());
      toRemove = [];

      tasks.forEach(task => toAdd.push(Card(task)) );

      toAdd.forEach( item => this.currentView.appendChild (item ));
      toAdd = [];

      this.lastView = this.currentView;
    },

    // change so more open - what if other sort methods required
    sort: function(view, sort) {
      this.currentView = view;
      if (this.currentView === this.lastView) return;

      this.lastView.style.position = 'absolute';
      this.currentView.style.position = 'relative';

      let toAdd = [];
      let toRemove = [];

      if (this.lastView.children.length !== 0) {
        for (const item of this.lastView.children) { toRemove.push(item) }
      }

      toRemove.forEach(item => item.remove());
      toRemove = [];

      for (const project of projects) {
        if (project.tasks.length !== 0) project.tasks.forEach(task => {

          switch(sort) {
            case 'all':
              toAdd.push(Card(task));
              break;

            case 'today':
              if (isToday(new Date(task.dueDate.year, task.dueDate.month-1, task.dueDate.day))) toAdd.push(Card(task));
              break;

            case 'upcoming':
              if (isFuture(new Date(task.dueDate.year, task.dueDate.month-1, task.dueDate.day))) toAdd.push(Card(task));
              break;
          }          
          
        });
      }

      toAdd.forEach( item => this.currentView.appendChild( item ) );
      toAdd = [];

      this.lastView = this.currentView;
    },

    populateAll: function() {
      this.currentView = elements.dashboard;
      if (this.currentView === this.lastView) return;

      let toAdd = [];
      let toRemove = [];

      if (this.lastView.children.length !== 0) {
        for (const item of this.lastView.children) { toRemove.push(item) }
      }

      toRemove.forEach(item => item.remove());
      toRemove = [];

      for (const project of projects) {
        if (project.tasks.length !== 0) project.tasks.forEach(task => {
          toAdd.push(Card(task));
        });
      }

      toAdd.forEach( item => this.currentView.appendChild( item ) );
      toAdd = [];

      this.lastView = this.currentView;
    },

    populateToday: function() {
      this.currentView = elements.today;
      if (this.currentView === this.lastView) return;

      let toAdd = [];
      let toRemove = [];

      if (this.lastView.children.length !== 0) {
        for (const item of this.lastView.children) { toRemove.push(item) }
      } 

      toRemove.forEach(item => item.remove());
      toRemove = [];

      for (const project of projects) {
        if (project.tasks.length !== 0) project.tasks.forEach(task => {
          if (isToday(task.dueDate)) toAdd.push(Card(task));
        });
      }

      toAdd.forEach( item => this.currentView.appendChild( item ) );
      toAdd = [];

      this.lastView = this.currentView;
    },

    populateUpcoming: function() {
      this.currentView = elements.upcoming;
      if (this.currentView === this.lastView) return;

      let toAdd = [];
      let toRemove = [];

      if (this.lastView.children.length !== 0) {
        for (const item of this.lastView.children) { toRemove.push(item) }
      } 

      toRemove.forEach(item => item.remove());
      toRemove = [];

      for (const project of projects) {
        if (project.tasks.length !== 0) project.tasks.forEach(task => {
          if (isFuture(task.dueDate)) toAdd.push(Card(task));
        });
      }

      toAdd.forEach( item => this.currentView.appendChild( item ) );
      toAdd = [];

      this.lastView = this.currentView;
    }
  }

  // Controller
  const controller = {
    observers: {config : { attributes: true, childList: true, subtree: true }},
  }

  controller.observers.mainWindow = new MutationObserver((mutationList, observer) => {
    view.updateProjectTaskTotal(projects);
    view.updateNotifications(projects);
  });

  controller.observers.mainWindow.observe(elements.mainWindow, controller.observers.config);


  return {

    projects,
    elements,
    userInputs,
    keyInputGroup,
    view,
    _notifyProject,

    restore: () => _checkStorage(),
    _updateStorage,

    _getTaskProject,
    _addTaskToProject,
    _removeProjectFromList,
    _removeAllTasksFromProject,
    _addProjectToProjectsIndex,
  }

})();

let c = 'create';
let s1 = 'selectOne';
let s0 = 'selectAll';

import Doc from './Doc';
const dashboard = Doc(s1, '.dashboard-tasks');

const newTaskButtons = document.querySelectorAll('.pointer');

newTaskButtons.forEach(btn => {
  btn.addEventListener('click', showTaskForm);
});

 // Modal
const taskModal = document.querySelector('dialog');

const flagIcon = document.querySelector('.flg');

function showTaskForm(e) {

  taskModal.showModal();

  const newTask = Task.create();

  const form = document.querySelector('form');
  const inputs = form.elements;

  inputs["task"].addEventListener('input', (e) => {
    document.querySelector('.fa-exclamation').classList.remove('show-error');
  });

  const flagIcons = document.querySelectorAll('.priority-flag');
  const closeButton = document.querySelector('.cancel');

  form.addEventListener('submit', formHandler);

  flagIcons.forEach(flag => {
    flag.addEventListener('click', setPriortiy);
  });

  closeButton.addEventListener('click', hideTaskForm);

  function formHandler(e) {
    e.preventDefault();

    newTask.name = inputs["task"].value;
    //console.log(newTask.name);

    // Empty task description? :: return + visual error
    document.querySelector('.fa-exclamation').classList.remove('show-error');
    if (newTask.name === '') return document.querySelector('.fa-exclamation').classList.add('show-error');

    // Process task
    newTask.project = inputs["project"].value;

    if (newTask.project === '') newTask.project = 'User';
    // TODO add project dot colour !

    const project = Todo._getTaskProject(newTask.project, Todo.projects);
    Todo._addTaskToProject(newTask, project);

    // Dates
    const dateToday = Date.now();
    newTask.creationDate.year  = getYear(dateToday);
    newTask.creationDate.month = getMonth(dateToday)+1;
    newTask.creationDate.day   = getDate(dateToday);

    const myDate = [ Number(Todo.userInputs.date.myYear.textContent), Number(Todo.userInputs.date.myMonth.textContent), Number(Todo.userInputs.date.myDay.textContent) ];

    myDate.forEach( date => {
      if ( isNaN(date) ) newTask.dueDate = '';
      else {
        newTask.dueDate.year  = myDate[0];
        newTask.dueDate.month = myDate[1];
        newTask.dueDate.day   = myDate[2];
      } 
    });

    newTask.time = inputs["time"].value;
    newTask.comment = inputs["comment"].value;

    let lastIndex = Todo.projects.length;

    Todo._addProjectToProjectsIndex(project, Todo.projects);

    if (lastIndex !== Todo.projects.length) {
      // Create new group
      Group(project, document.querySelector('.app-aside-projects')); // const asideTab_projects
    }

    const newTaskCard = Card(newTask);

    //render to correct view
    switch(Todo.view.currentView) {

      case Todo.elements.dashboard:
        Todo.view.currentView.appendChild(newTaskCard);
        break;

      case Todo.elements.today:
        if (!isFuture(newTask.dueDate)) Todo.view.currentView.appendChild(newTaskCard);
        break;

      case Todo.elements.upcoming:
        if (isFuture(newTask.dueDate)) Todo.view.currentView.appendChild(newTaskCard);
        break;

    }
    Todo._updateStorage();

    taskModal.close();
  
    form.removeEventListener('submit', formHandler);

    flagIcons.forEach(flag => {
      flag.removeEventListener('click', setPriortiy);
    });

    closeButton.removeEventListener('click', hideTaskForm);
  }

  function setPriortiy(e) {
    newTask.priorityFlag = getComputedStyle(e.target).color;
    flagIcon.style.color = getComputedStyle(e.target).color;
  }

  function hideTaskForm(e) {
    e.preventDefault();

    taskModal.close();

    for (let property in newTask) { delete newTask[property] }

    form.removeEventListener('submit', formHandler);

    flagIcons.forEach(flag => {
      flag.removeEventListener('click', setPriortiy);
    });

    closeButton.removeEventListener('click', hideTaskForm);
  }
}

//showTaskForm('ok');

const priorityFlagIcons = Doc(s1, '.flag-icon-group');

Todo.elements.modal.task.icons.forEach(icon => {
  icon.addEventListener('click', (e) => {

    for (const icon of Todo.elements.modal.task.icons) {
      icon.classList.remove('modal-icon-select');
    }

    for (const flag of Todo.userInputs.priorityFlag.group.children) {
      flag.children[0].style.visibility = 'hidden';
    } 

    Todo.keyInputGroup.forEach(input => {
      if (input !== '') input.style.visibility = 'hidden';
    });

    e.target.classList.add('modal-icon-select');
    
    switch(e.target.classList[2]) {
      case 'pen':
        Todo.userInputs.task.input.style.visibility = 'visible';
        Todo.userInputs.task.input.focus();
        break;

      case 'prj':
        Todo.userInputs.project.input.style.visibility = 'visible';
        Todo.userInputs.project.drpDn.style.visibility = 'visible';
        Todo.userInputs.project.input.focus();
        break;

      case 'cal':
        for(const dateInput of Todo.userInputs.date.group) {
          dateInput.style.visibility = 'visible';
        }
        break;

      case 'flg':
        Todo.userInputs.priorityFlag.group.style.visibility = 'visible';

        for (const flag of Todo.userInputs.priorityFlag.group.children) {
          flag.children[0].style.visibility = 'visible';
        }
        break;
    }
  });
});

// aside - menu drawer icon
const aside = document.querySelector('aside');
const asideIcon = document.querySelector('.aside-drawer-icon');
asideIcon.addEventListener('click', () => aside.classList.toggle('js-aside-drawer-animation'));

// aside - Dates Menu
const datesAside = document.querySelector('.app-aside-calendar');

for (let section of datesAside.children) {
  section.addEventListener('click', (e) => {
    if (lastSelectedProject !== undefined) lastSelectedProject.remove('js-aside-highlight');
    for(let node of datesAside.children) node.classList.remove('js-aside-highlight');

    e.target.classList.add('js-aside-highlight');
    sortTasks(e);
  });
}

let lastHeading = 'Tasks';

function sortTasks(e) {
  switch(e.target.textContent.trim()) {

    case 'Tasks':
      //Todo.view.populateAll();
      //console.log('tasks-tab');
      lastHeading = 'Tasks';
      Todo.elements.dbHeading.textContent = 'Tasks';
      Todo.view.sort(Todo.elements.dashboard, 'all');
      break;

    case 'Today':
      lastHeading = 'Today';
      //console.log('today-tab');
      //Todo.view.populateToday();
      Todo.elements.dbHeading.textContent = 'Today';
      Todo.view.sort(Todo.elements.today, 'today');
      break;

    case 'Upcoming':
      lastHeading = 'Upcoming';
      //console.log('upcoming-tab');
      //Todo.view.populateUpcoming();
      Todo.elements.dbHeading.textContent = 'Upcoming';
      Todo.view.sort(Todo.elements.upcoming, 'upcoming');
      break;
  }
}

// turn into group if more dropdowns required
const projectsDropdown = document.querySelector('.js-projects-dropdown');
projectsDropdown.addEventListener('click', (e) => {
  e.target.style.backgroundColor = 'transparent';
  e.target.parentNode.parentNode.classList.toggle('dropdown-menu');
  e.target.parentNode.children[1].classList.toggle('dropdown-state');
  
  
  e.target.classList.add('js-aside-highlight');
});

let searchArray = [];

const newTaskDb = document.querySelector('.new-task');

// search
const search = document.querySelector('.js-search');

search.addEventListener('input', (e) => {
  //newTaskDb.style.visibility = 'hidden';
  //Todo.elements.dbHeading.textContent = 'Search';
  Todo.projects.forEach(project => {
    for (const task of project.tasks) {
      if (task.name.toLowerCase() === e.target.value.toLowerCase()) {
        searchArray.push(task);
      }
    }
  });
  Todo.view.search(Todo.elements.search, searchArray);
  searchArray = [];
});

search.addEventListener('blur', (e) => {
  //newTaskDb.style.visibility = 'visible';
  //Todo.elements.dbHeading = lastHeading;
  searchArray = [];
});

// generate dashboard task
function Card(task) {
  const cardItem = Doc(c, 'li');
  cardItem.id = task.id;
  cardItem.dataset.project = task.projectID;
  cardItem.classList.add('task-card');

  const congratsMask = Doc(c, 'div');
  congratsMask.classList.add('congrats-mask');
  congratsMask.style.position = 'absolute';
  congratsMask.style.width = '100%';
  congratsMask.style.height = '100%';

  const congratMessage = Doc(c, 'p');
  congratMessage.classList.add('congrats-message');
  congratMessage.textContent = 'Great Work!';
  congratsMask.appendChild(congratMessage);

  cardItem.appendChild(congratsMask);

  const checkBox = Doc(c, 'div');
  checkBox.classList.add('task-check-col-1');

  const iCheck = Doc(c, 'i');
  iCheck.classList.add('far');
  iCheck.classList.add('fa-circle');
  iCheck.classList.add('task-complete');

  iCheck.addEventListener('click', (e) => {
    e.target.classList.remove('far');
    e.target.classList.remove('fa-circle');

    e.target.classList.add('fas');
    e.target.classList.add('fa-check-circle');
    e.target.style.color = 'green';
    
    setTimeout(() => {
      congratsMask.classList.add('show-congrats-mask');
    }, 1200);
    
    setTimeout(() => {
    cardItem.classList.add('remove-task');
    }, 2400);

    setTimeout(() => {
      // could send card.id but if it's lost vm will throw error
      Todo._notifyProject(task, 'remove');
      Todo._updateStorage();
      cardItem.remove();
    }, 3600);
  });

  const iFlag = Doc(c, 'i');
  iFlag.classList.add('fas');
  iFlag.classList.add('fa-flag');
  iFlag.classList.add('task-priority');
  iFlag.style.color = task.priorityFlag;

  checkBox.appendChild(iCheck);
  checkBox.appendChild(iFlag);
  cardItem.appendChild(checkBox);

  const taskInfoBox = Doc(c, 'div');
  taskInfoBox.classList.add('task-info');

  const heading = Doc(c, 'h4');
  heading.classList.add('task-heading');
  heading.textContent = task.name;
  taskInfoBox.appendChild(heading);

  // ul
  const taskList = Doc(c, 'ul');
  taskList.classList.add('task-details');
  taskInfoBox.appendChild(taskList);

  // li - Date
  const dateItem = Doc(c, 'li');
  dateItem.classList.add('task-date');

  const iDate = Doc(c, 'i');

  iDate.classList.add('far');
  task.dueDate === '' ? iDate.classList.add('fa-calendar')
  : iDate.classList.add('fa-calendar-check')

  iDate.classList.add('task-date-icon');
  dateItem.appendChild(iDate);

  const pDate = Doc(c, 'p');
  pDate.classList.add('task-date-text');

  task.dueDate !== '' ? pDate.textContent = format(new Date(
    task.dueDate.year, task.dueDate.month-1, task.dueDate.day), 'eee dd MMM yyyy' ) : pDate.textContent = '';

  dateItem.appendChild(pDate);

  if (task.dueDate === '') {
    iDate.style.color = 'lightgrey';
    pDate.textContent = '';
  }

  taskList.appendChild(dateItem);

  // li - Project
  const projectItem = Doc(c, 'li');
  projectItem.classList.add('task-project');
  projectItem.style.width = '45%'

  const pProject = Doc(c, 'p');
  pProject.classList.add('task-project-text');
  pProject.textContent = task.project;
  projectItem.appendChild(pProject);

  const iProject = Doc(c, 'i');
  iProject.classList.add('fas');
  iProject.classList.add('fa-circle');
  iProject.classList.add('task-project-icon');
  projectItem.appendChild(iProject);
  taskList.appendChild(projectItem);

  //search projects - match colour

  // li - Remove
  const removeItem = Doc(c, 'li');
  removeItem.classList.add('task-remove');

  const iRemove = Doc(c, 'i');
  iRemove.classList.add('far');
  iRemove.classList.add('fa-trash-alt');
  iProject.classList.add('task-remove-icon');
  removeItem.appendChild(iRemove);
  taskList.appendChild(removeItem);

  //console.log(`Task ID: ${cardItem.id}`);

  iRemove.addEventListener('click', () => {
    cardItem.classList.add('remove-task');

    setTimeout(() => {
      // could send card.id but if it's lost vm will throw error
      Todo._notifyProject(task, 'remove');
      Todo._updateStorage();
      cardItem.remove();
    }, 1200);
  });

  cardItem.appendChild(taskInfoBox);

  return cardItem;
}

let lastSelectedProject;

Todo.restore();

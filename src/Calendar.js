import Doc from './Doc';

import { getMonth } from 'date-fns';
import { isLeapYear } from 'date-fns';

let lastDay = '';

function style(element, property, value) {
  element.style[property] = value;
}

function generateDays(days, parent) {
  for (let i = 1; i <= days; i++) {

    let day = Doc('create', 'div');
    day.classList.add('day');

    let name = Doc('create', 'p');
    name.textContent = i;

    day.appendChild(name);

    day.addEventListener('click', (e) => {
      if (lastDay !== '') {
        lastDay.style.backgroundColor = 'transparent';
      }
      e.target.style.backgroundColor = 'lightgrey';
      lastDay = e.target;
    });

    parent.appendChild(day);
  }
}

function Calendar() {

  // Calendar div container
  const container = Doc('create', 'div');
  container.classList.add('calendar');

  style(container, 'display', 'grid');
  style(container, 'align-items', 'center');

  const monthTabs = [];

  // 12 months :)
  for(let i = 1; i <= 12; i++) {
    let name;
    
    // month div - holds day elements
    let month = Doc('create', 'div');
    month.classList.add('calendar-month');
    
    // month title
    let h2 = Doc('create', 'h3');

    // days
    let days = Doc('create', 'div');
    days.classList.add('calendar-days');

    switch(i) {
      case 1:
        name = 'January';
        generateDays(31, days);
        break;
      case 2:
        name = 'February';
        isLeapYear( Date.now() ) ? generateDays(29, days) : generateDays(28, days);
        break;
      case 3:
        name = 'March';
        generateDays(31, days);
        break;
      case 4:
        name = 'April';
        generateDays(30, days);
        break;
      case 5:
        name = 'May';
        generateDays(31, days);
        break;
      case 6:
        name = 'June';
        generateDays(30, days);
        break;
      case 7:
        name = 'July';
        generateDays(31, days);
        break;
      case 8:
        name = 'August';
        generateDays(31, days);
        break;
      case 9:
        name = 'September';
        generateDays(30, days);
        break;
      case 10:
        name = 'October';
        generateDays(31, days);
        break;
      case 11:
        name = 'November';
        generateDays(30, days);
        break;
      case 12:
        name = 'December';
        generateDays(31, days);
        break;     
    }

    // title <p>
    h2.textContent = name;

    month.appendChild(h2);
    month.appendChild(days);

    month.id = i;
    month.classList.add(name);
    month.classList.add('month')
    container.appendChild(month);

    // Current month view
    if (Number(month.id) !== getMonth( Date.now() )+1 ) {
      style(month, 'visibility', 'hidden');
    }

    // month <div>
    style(month, 'width', '90%');
    style(month, 'height', '100%');
    style(days, 'display', 'grid');
    style(month, 'textAlign', 'center');
    style(month, 'position', 'absolute');
    style(month, 'backgroundColor', 'white');
    style(month, 'justify-self', 'center');
    style(days, 'grid-template-columns', 'repeat(7, 1fr)');

    monthTabs.push(month);
  }
  style(container, 'position', 'relative');

  const closeCal = Doc('create', 'button');
  closeCal.type = 'button';
  closeCal.classList.add('js-close-calendar-btn');
  closeCal.textContent = 'close';
  container.appendChild(closeCal);

  const navLeft = Doc('create', 'i');
  navLeft.classList.add('fas');
  navLeft.classList.add('fa-chevron-circle-left');

  const navRight = Doc('create', 'i');
  navRight.classList.add('fas');
  navRight.classList.add('fa-chevron-circle-right');

  container.appendChild(navLeft);
  container.appendChild(navRight);

  style(navLeft, 'position', 'absolute');
  style(navRight, 'position', 'absolute');

  style(navLeft, 'fontSize', '2rem');
  style(navRight, 'fontSize', '2rem');

  style(navLeft, 'margin-left', '0.65rem');
  style(navRight, 'margin-right', '0.65rem');

  navRight.dataset.index = getMonth( Date.now() )+1;
  navRight.addEventListener('click', () => {
    navRightHandler(navRight, navLeft, container)
  });

  navLeft.dataset.index = getMonth( Date.now() )+1;
  navLeft.addEventListener('click', () => {
    navLeftHandler(navLeft, navRight, container)
  });

  return { container, navLeft, navRight, closeCal, monthTabs }
}

function navRightHandler(nav, navAlt, container) {
  nav.dataset.index = Number(nav.dataset.index);
  navAlt.dataset.index = Number(navAlt.dataset.index);
  
  nav.dataset.index++;
  navAlt.dataset.index++;
  
  if (Number(nav.dataset.index) >= 13) {
    nav.dataset.index = 1; 
    navAlt.dataset.index  = 1;
  }

  for(let month of container.children) {
    //console.dir(month);
  
    if (month.tagName === 'DIV') {
  
      if (Number(nav.dataset.index) === Number(month.id)) {
        month.style.visibility = 'visible';
      } 
      else { 
        month.style.visibility = 'hidden';
      }
    }
  
  }; 
}

function navLeftHandler(nav, navAlt, container) {
  
  nav.dataset.index = Number(nav.dataset.index);
  navAlt.dataset.index = Number(navAlt.dataset.index);
      
  nav.dataset.index--;
  navAlt.dataset.index--;
  
  if (Number(nav.dataset.index) <= 0) {
    nav.dataset.index  = 12; 
    navAlt.dataset.index = 12;
  }
  
  for(let month of container.children) {
    //console.dir(month);
        
    if (month.tagName === 'DIV') {
  
      if (Number(nav.dataset.index) === Number(month.id)) {
        month.style.visibility = 'visible';
        lastSelectedMonth = month;
      } 
      else { 
        month.style.visibility = 'hidden';
      }
    }
  
  };
};

export default Calendar;
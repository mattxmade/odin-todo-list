import { v4 as uuidv4 } from 'uuid';

const Task = (() => {

  const create = (name = 'New task', project = 'User', dueDate = {}, creationDate = {}, priorityFlag = 'white') => {
    if (name === undefined) return;
    return { name, project, dueDate, creationDate, priorityFlag, id: uuidv4()}
  }

  return { create } ;
})();



export default Task;
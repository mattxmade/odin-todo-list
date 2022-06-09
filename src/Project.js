import { v4 as uuidv4 } from 'uuid';

const Project = (() => {
  const projects = []
  
  const create = (name = 'default') => {
    return { name, tasks: [], id: uuidv4(), index: {value: 0, last: 0} }
  }

  // Does project exist by ID?
  const _exists = (itemToCheck, list) => {
    let exists = false;
  
    list.forEach(item => itemToCheck.id === item.id ? exists = true : 0 );
    return exists;
  }
  
  // Add project to index
  const addProjectToProjectsIndex = (project, projectsToSearch) => {
    if (_exists(project, projectsToSearch) === false) projectsToSearch.push(project);
  }

  const addTaskToProject = (task, project) => {
    project.tasks.push(task);
    task.projectID = project.id; //move this
  }

  return { 
    projects,

    create,
    addTaskToProject,
    addProjectToProjectsIndex
   }
})();



export default Project;
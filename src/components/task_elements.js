import { formatDate, compareDate } from '../../node_modules/date-fns';
import { elementSort } from './task_logic';

export { makeTask, makeProject, elementController };

const elementController = (function () {
  let projects = {};
  let newTaskId = 0;

  const addProject = (project) => {
    projects[project.info['project_title']] = project;
  };

  const removeProject = (project) =>
    delete projects[project.info['project_title']];

  const getNewTaskId = (task) => ++newTaskId;

  const sort = (type) => elementSort(Object.values(projects), type);

  function stringify(obj) {
    let cache = [];
    let str = JSON.stringify(
      projects,
      function (key, value) {
        //discard circular references
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            return;
          }
          cache.push(value);
        }
        return value;
      },
      2
    );
    cache = null;

    return str;
  }

  function objectToForm(object) {
    const form = new FormData();
    for (const infoKey in object) {
      form.append(infoKey, object[infoKey]);
    }
    return form;
  }

  return {
    projects,
    addProject,
    removeProject,
    getNewTaskId,
    sort,
    stringify,
    objectToForm,
  };
})();

function makeProject(projectData) {
  const info = {};
  let tasks = [];

  for (const [key, value] of projectData)
    info[key] =
      key === 'project_due_date'
        ? new Date(projectData.get(key)).toLocaleDateString('en-US')
        : projectData.get(key);

  function addTask(task) {
    this.tasks.push(task);
    return this;
  }

  function removeTask(task) {
    this.tasks = this.tasks.filter((currentTask) => {
      return currentTask.getTaskId() !== task.getTaskId();
    });
    return this;
  }

  const sort = (type) => elementSort(tasks, type);

  return { info, addTask, removeTask, tasks, sort };
}

function makeTask(taskData) {
  const info = {};
  let taskId = 0;
  let project = '';

  for (const [key, value] of taskData) {
    info[key] =
      key === 'task_due_date'
        ? new Date(taskData.get(key)).toLocaleDateString('en-US')
        : taskData.get(key);
  }

  const getTaskId = () => taskId;

  const setTaskId = (id) => {
    taskId = id;
    return taskId;
  };

  return { info, getTaskId, setTaskId, project };
}

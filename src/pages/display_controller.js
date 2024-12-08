import {
  makeTask,
  makeProject,
  elementController,
} from '../components/task_elements';

export { displayController };

const displayController = (function () {
  // associate dom elements with task_elements
  const projectNodes = new WeakMap();
  const taskNodes = new WeakMap();
  const main = document.querySelector('main');
  const addProjectButton = document.querySelector('#add-project');
  const projectSortButtons = document.querySelectorAll(
    `input[name='project-sort']`
  );
  const projectFlexSidebar = document.querySelector('.sidebar .project-flex');
  const closeModalButton = document.querySelector('.close-modal');
  const modal = document.querySelector('.modal');
  const modalForm = document.querySelector('.modal form');
  const modalTaskFlex = document.querySelector('form .task-flex');
  const modalAddTaskButton = document.querySelector(
    '.modal .project button:first-of-type'
  );
  const modalSubmitProject = document.querySelector(
    `.modal button[value = 'project_submit']`
  );
  const taskFormTemplate = document.getElementById('task-form-template');
  const taskTemplate = document.getElementById('task-template');
  const projectTemplate = document.getElementById('project-template');
  addProjectButton.addEventListener('click', addProject);
  modalSubmitProject.addEventListener('click', saveProject);
  closeModalButton.addEventListener('click', () => closeModal(modal));
  modalAddTaskButton.addEventListener('click', addTask);
  projectSortButtons.forEach((button) =>
    button.addEventListener('change', elementSort)
  );

  function addTask(e) {
    const newTaskForm = taskFormTemplate.cloneNode(true);
    let taskFlex;
    newTaskForm.style.display = 'block';
    newTaskForm.removeAttribute('id');

    // if called from edit button, fill in form as applicable
    if (e.currentTarget.name === 'edit') {
      newTaskForm.querySelectorAll('[data-content]').forEach((input) => {
        input.value = taskNodes.get(
          e.currentTarget.closest('.task-container')
        ).info[input.dataset.content];
      });
      taskFlex = e.currentTarget.closest('.project-container')
        ? e.currentTarget
            .closest('.project-container')
            .querySelector('.task-flex')
        : modalTaskFlex;
    } else {
      taskFlex = e.currentTarget.previousElementSibling;
    }
    taskFlex.appendChild(newTaskForm);

    newTaskForm
      .querySelector('button.close-modal')
      .addEventListener('click', () => {
        newTaskForm.remove();
      });

    newTaskForm
      .querySelector(`button[type='submit']`)
      .addEventListener('click', (e) => {
        e.preventDefault();
        const form = e.currentTarget.form;
        const task = makeTask(new FormData(form));
        //only save task to project if project is saved (outside new project modal)
        const projectNode = form.closest('.project-container');
        if (projectNode) saveTask(task, projectNodes.get(projectNode));

        appendTask(task, taskFlex);
        newTaskForm.remove();
      });
  }

  function appendTask(task, node) {
    const newTaskNodeContainer = taskTemplate.cloneNode(true);
    const newTaskNode = newTaskNodeContainer.querySelector('.task');
    taskNodes.set(newTaskNodeContainer, task);
    newTaskNode.querySelectorAll('[data-content]').forEach((node) => {
      node.innerText = task.info[node.dataset.content];
    });
    newTaskNode.querySelector(`.triangle`).style.backgroundColor =
      `var(--color-priority-${task.info['task_priority']})`;
    addEditButton(newTaskNodeContainer);

    const taskId = task.setTaskId(elementController.getNewTaskId());
    newTaskNode
      .querySelector('input.collapsible')
      .setAttribute('id', `task-toggle-${taskId}`);
    newTaskNode
      .querySelector('label.collapsible')
      .setAttribute('for', `task-toggle-${taskId}`);
    newTaskNode.style.display = 'grid';
    newTaskNodeContainer.removeAttribute('id');
    newTaskNodeContainer.style.display = 'block';
    node.appendChild(newTaskNodeContainer);
  }

  function saveTask(task, project) {
    task.project = project;
    project.addTask(task);
    localStorage.setItem('projects', elementController.stringify());
  }

  function addProject(e) {
    //!!Need to check if project name is already taken!!
    modal.style.display = 'flex';
    //if called from edit button, fill in form as applicable
    if (e.currentTarget.name === 'edit') {
      const project = projectNodes.get(
        e.currentTarget.closest('.project-container')
      );
      modal.querySelectorAll('[data-content]').forEach((input) => {
        input.value = project.info[input.dataset.content];
      });
      project.tasks.forEach((task) => appendTask(task, modalTaskFlex));
    }
  }

  function saveProject(e) {
    e.preventDefault();
    const newProject = makeProject(new FormData(modalForm));
    elementController.addProject(newProject);

    //add all tasks to newProject
    for (const node of modalTaskFlex.children) {
      saveTask(taskNodes.get(node), newProject);
      taskNodes.delete(node);
    }

    localStorage.setItem('projects', elementController.stringify());
    closeModal(modal);
    modalForm.reset();
    modalTaskFlex.innerHTML = '';
    appendProject(newProject);
  }

  function appendProject(project) {
    const projectNode = projectTemplate.cloneNode(true);
    const projectTitle = project.info['project_title'];
    projectNodes.set(projectNode, project);

    //update content of newly created project node
    projectNode.querySelectorAll('[data-content]').forEach((node) => {
      node.innerText = project.info[node.dataset.content];
    });
    projectNode.querySelector(`.triangle`).style.backgroundColor =
      `var(--color-priority-${project.info['project_priority']})`;

    elementController.projects[projectTitle].tasks.forEach((task) => {
      appendTask(task, projectNode.querySelector('.task-flex'));
    });

    //Activate project node
    projectNode
      .querySelector('button.action-button')
      .addEventListener('click', addTask);
    addEditButton(projectNode);
    projectNode.style.display = 'grid';
    projectNode.removeAttribute('id');
    projectNode.style.display = 'block';
    main.appendChild(projectNode);

    //Append project on sidebar
    const projectCheckbox = document
      .getElementById('project-checkbox-template')
      .cloneNode(true);
    projectCheckbox.style.display = 'block';
    projectCheckbox.removeAttribute('id');
    const projectLabel = projectCheckbox.querySelector('label');
    const projectInput = projectCheckbox.querySelector('input');
    projectLabel.innerText = projectTitle;
    projectLabel.setAttribute(
      'for',
      project.info['project_title'].replace(/ /g, '-')
    );
    projectInput.setAttribute('id', projectTitle.replace(/ /g, '-'));
    projectInput.setAttribute('value', projectTitle);
    projectCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) projectNode.style.display = 'grid';
      else projectNode.style.display = 'none';
    });
    projectFlexSidebar.appendChild(projectCheckbox);

    //Relate project checkbox to project
    projectNode.projectCheckbox = projectCheckbox;
  }

  function addEditButton(node) {
    const popup = node.querySelector('.popup');
    node.querySelector('button.edit-button').addEventListener('click', () => {
      popup.style.display = 'flex';
      popup
        .querySelector('.close-modal')
        .addEventListener('click', () => closeModal(popup));
      popup
        .querySelector(`button[name='delete']`)
        .addEventListener('click', () => deleteNode(node));
      popup
        .querySelectorAll(`button[name='task-sort']`)
        .forEach((button) => button.addEventListener('click', elementSort));
      popup
        .querySelector(`button[name='edit']`)
        .addEventListener('click', (e) => {
          if (e.currentTarget.closest('.task-container')) addTask(e);
          else addProject(e);
          deleteNode(node);
        });
    });
  }

  function deleteNode(node) {
    if (node.getAttribute('class') === 'project-container') {
      node.projectCheckbox.remove();
      const project = projectNodes.get(node);
      //Delete all project tasks from project object and WeakMap
      for (const taskNode of node.querySelector('.task-flex').children) {
        project.removeTask(taskNodes.get(taskNode));
        taskNodes.delete(taskNode);
      }
      elementController.removeProject(project);
      projectNodes.delete(node);
    } else {
      if (taskNodes.get(node).project)
        taskNodes.get(node).project.removeTask(taskNodes.get(node));
      taskNodes.delete(node);
    }
    node.remove();
    localStorage.setItem('projects', elementController.stringify());
  }

  function closeModal(modal) {
    modal.style.display = 'none';
  }

  function elementSort(e) {
    if (e.currentTarget.name === 'project-sort') {
      const elements = elementController.sort(e.currentTarget.value);
      main.querySelectorAll('.project-container').forEach((node) => {
        node.projectCheckbox.remove();
        node.remove();
      });
      elements.forEach(appendProject);
    } else {
      const projectNode = e.currentTarget.closest('.project-container');
      const elements = projectNodes
        .get(projectNode)
        .sort(e.currentTarget.value);
      let taskFlex = projectNode.querySelector('.task-flex');
      taskFlex.innerHTML = '';
      elements.forEach((task) => appendTask(task, taskFlex));
    }
  }

  //update display if projects are stored in local storage
  function recallFromStorage() {
    let projects = JSON.parse(localStorage.getItem('projects'));
    if (projects) {
      Object.values(projects).forEach((project) => {
        const newProject = makeProject(
          elementController.objectToForm(project.info)
        );
        project.tasks.forEach((task) => {
          const newTask = makeTask(elementController.objectToForm(task.info));
          newProject.addTask(newTask);
        });
        elementController.addProject(newProject);
        appendProject(newProject);
      });
    }
  }

  const domReady = (cb) => {
    document.readyState === 'interactive' || document.readyState === 'complete'
      ? cb()
      : document.addEventListener('DOMContentLoaded', cb);
  };

  return { domReady, recallFromStorage };
})();

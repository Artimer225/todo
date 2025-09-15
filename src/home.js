import './styles.css';
import {projectStorage, findProject, logic} from './logic';
import { project } from './project.js'
const home = (function () {
    const content = document.querySelector('#content');
    const editDialog = document.querySelector('#editDialog')

    const createEditProjectName = () => {
        editDialog.setAttribute('data-projectId', '');
        const dialogForm = document.createElement('form');
        dialogForm.classList.add('dialogForm');
        dialogForm.method = 'dialog'
        const projectEdit = document.createElement('div');
        projectEdit.classList.add('itemEdit');
        const projectNameLabel = document.createElement('label');
        projectNameLabel.innerText = 'Name';
        projectNameLabel.setAttribute('for', 'projectName');
        const projectName = document.createElement('input');
        projectName.name = 'projectName';
        projectName.id = 'projectName'
        projectName.required = true;
        editDialog.appendChild(dialogForm);
        dialogForm.appendChild(projectEdit);
        projectEdit.appendChild(projectNameLabel);
        projectEdit.appendChild(projectName);
        project.appendFormButtons(dialogForm, 'dialogFormButtons')
        content.appendChild(editDialog)
    }

    class HomeEventListener {
        constructor() {
            content.addEventListener('click', e => {
                if (e.target.closest('.projectName')) {
                    const projectId = e.target.closest('.projectContainer').dataset.projectid
                    project.clearPage()
                    const theProject = findProject(projectId);
                    project.createLayout(theProject)
                }
                if (e.target.closest('.editOption')) {
                    const projectId = e.target.closest('.projectContainer').dataset.projectid;
                    const projectName = e.target.closest('.projectContainer').querySelector('.projectName').innerText;
                    let dialogProjectName = editDialog.querySelector('input[name="projectName"]');
                    dialogProjectName.value = projectName;
                    editDialog.dataset.projectid = projectId
                    editDialog.showModal()
                }
                if (e.target.value === 'Cancel') {
                    editDialog.close()
                }
                if (e.target.closest('.deleteOption')) {
                    const currentProject = e.target.closest('.projectContainer');
                    projectStorage.removeItem(currentProject.dataset.projectid);
                    currentProject.remove()
                    // console.log(projectStorage)
                }
            })
            content.addEventListener('submit',  e => {
                if (e.target.closest('.dialogForm') && (e.submitter.value === 'Save')) {
                    e.preventDefault()
                    const itemInputs = Object.fromEntries(new FormData(e.target).entries());
                    console.log(itemInputs)
                    const dialogProjectId = editDialog.dataset.projectid;
                    const currentProject = document.querySelector(
                        `.projectContainer[data-projectid="${dialogProjectId}"]`);
                    const currentProjectName = currentProject.querySelector('.projectName');
                    currentProjectName.innerText = itemInputs.projectName;
                    const projectToEdit = findProject(dialogProjectId);
                    projectToEdit.name = itemInputs.projectName;
                    console.log(projectStorage)
                    editDialog.close()
                }
            })
        }
    }

    const HomeEventListenerInstance = new HomeEventListener();

    const appendProjects = () => {
        const projects = document.createElement('div');
        projects.classList.add('projects');
        const title = document.createElement('p');
        title.classList.add('title');
        title.innerText = 'My Projects';
        projects.appendChild(title);

        for (const project of projectStorage) {
            const projectContainer = document.createElement('div');
            projectContainer.classList.add('projectContainer');
            const projectName = document.createElement('p');
            // const projectEdit = document.createElement('button');
            // projectEdit.className = 'projectEdit';
            // projectEdit.innerText = 'Edit'

            projectName.classList.add('projectName');
            projectName.innerText = project.name;
            projectContainer.appendChild(projectName);
            // projectContainer.appendChild(projectEdit);
            appendDropdown(projectContainer);
            projectContainer.setAttribute('data-projectId', project._id);

            projects.appendChild(projectContainer);
        }
        content.appendChild(projects)
    }

    const appendDropdown = (item) => {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        const dropdownButton = document.createElement('button');
        dropdownButton.className = 'dropdownButton';
        dropdownButton.innerText = '...'
        const dropdownOptions = document.createElement('div');
        dropdownOptions.className = 'dropdownOptions';
        const editOption = document.createElement('button');
        editOption.className = 'editOption';
        editOption.innerText = 'Edit'
        const deleteOption = document.createElement('button');
        deleteOption.className = 'deleteOption';
        deleteOption.innerText = 'Delete'

        dropdown.appendChild(dropdownButton);
        dropdown.appendChild(dropdownOptions);
        dropdownOptions.appendChild(editOption);
        dropdownOptions.appendChild(deleteOption);
        item.appendChild(dropdown)
    }

    const createLayout = () => {
        createEditProjectName()
        appendProjects()
    }

    return { createLayout }
})();

export { home };
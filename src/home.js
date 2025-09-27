import './styles.css';
import {projectStorage, findProject, logic, projectStorageSave} from './logic';
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

    const handleAddItemClick = (e) => {
        if (e.target.closest('.addItem') && !!checkAddFormStatus() === false) {
            const currentAddItem = e.target;
            const addForm = createAddForm();
            currentAddItem.classList.toggle('hidden');
            currentAddItem.insertAdjacentElement('beforebegin', addForm)
        } else if (e.target.closest('.addItem') && !!checkAddFormStatus() === true) {
            const previousAddForm = document.querySelector('#addForm');
            const previousAddButton = previousAddForm.closest('.projects').querySelector('.addItem')
            previousAddForm.remove()
            // TOGGLE THE PREVIOUSADDBUTTON CLASS, SO IT WOULD BE VISIBLE ONCE AGAIN
            previousAddButton.classList.toggle('hidden');
            const currentAddItem = e.target;
            const addForm = createAddForm();
            currentAddItem.classList.toggle('hidden');
            currentAddItem.insertAdjacentElement('beforebegin', addForm)
        }
    }

    const handleProjectContainerClick = (e) => {
        if (e.target.closest('.projectName')) {
            const projectId = e.target.closest('.projectContainer').dataset.projectid
            clearPage()
            // project.createItemEditForm()
            const theProject = findProject(projectId);
            project.initPage(theProject)
        }
    }

    const handleEditOptionClick = (e) => {
                if (e.target.closest('.editOption')) {
                const projectId = e.target.closest('.projectContainer').dataset.projectid;
                const projectName = e.target.closest('.projectContainer').querySelector('.projectName').innerText;
                let dialogProjectName = editDialog.querySelector('input[name="projectName"]');
                dialogProjectName.value = projectName;
                editDialog.dataset.projectid = projectId
                editDialog.showModal()
            }
        }

    const handleCancelDialogClick = (e) => {
        if (e.target.value === 'Cancel' && e.target.closest('.dialogFormButtons')) {
            editDialog.close()
        }
    }

    const handleCancelFormClick = (e) => {
        if (e.target.value === 'Cancel' && e.target.closest('.projectButtons')) {
            e.preventDefault();
            const currentProjects = e.target.closest('.projects');
            currentProjects.querySelector('.addItem').classList.toggle('hidden');
            const addForm = document.querySelector('#addForm');
            addForm.remove()
        }
    }

    const handleDeleteClick = (e) => {
        if (e.target.closest('.deleteOption')) {
            const currentProject = e.target.closest('.projectContainer');
            projectStorage.removeItem(currentProject.dataset.projectid);
            currentProject.remove()
            projectStorageSave()
        }
    }

    const handleSubmitDialog = (e) => {
        if (e.target.closest('.dialogForm') && (e.submitter.value === 'Save')) {
            e.preventDefault()
            const itemInputs = Object.fromEntries(new FormData(e.target).entries());
            const dialogProjectId = editDialog.dataset.projectid;
            const currentProject = document.querySelector(
                `.projectContainer[data-projectid="${dialogProjectId}"]`);
            const currentProjectName = currentProject.querySelector('.projectName');
            currentProjectName.innerText = itemInputs.projectName;
            const projectToEdit = findProject(dialogProjectId);
            projectToEdit.name = itemInputs.projectName;
            // console.log(projectStorage)
            editDialog.close()
            projectStorageSave()
        }
    }

    const handleSubmitForm = (e) => {
        if (e.target.closest('#addForm') && (e.submitter.value === 'Add')) {
            e.preventDefault();
            const i = Object.fromEntries(new FormData(e.target).entries())
            const newProjectName = i.projectName;
            projectStorage.items = new logic.Project(newProjectName)
            const newProject = projectStorage._items.at(-1);
            const newProjectElement = createProject(newProject)
            const projectsElement = e.target.closest('.projects');
            const addFormElement = projectsElement.querySelector('#addForm')
            addFormElement.insertAdjacentElement('beforebegin', newProjectElement);
            addFormElement.remove()
            projectsElement.querySelector('.addItem').classList.toggle('hidden');
            projectStorageSave()
        }
    }
    
    const checkAddFormStatus = () => {
        return document.querySelector('#addForm')
    }

    const createAddForm = () => {
        const addForm = document.createElement('form');
        addForm.id = 'addForm';
        const projectMain = document.createElement('div');
        projectMain.className = 'projectMain';
        const projectNameInput = document.createElement('input');
        projectNameInput.className = 'projectNameInput';
        projectNameInput.placeholder = 'Project name';
        projectNameInput.required = true;
        projectNameInput.name = 'projectName';
        projectMain.append(projectNameInput);

        addForm.appendChild(projectMain);
        project.appendFormButtons(addForm, 'projectButtons', 'Add')
        return addForm
    }

    const initEventListeners = () => {
        content.addEventListener('click', handleAddItemClick)
        content.addEventListener('click', handleProjectContainerClick, )
        content.addEventListener('click', handleEditOptionClick)
        content.addEventListener('click', handleCancelDialogClick)
        content.addEventListener('click', handleCancelFormClick)
        content.addEventListener('click', handleDeleteClick)
        content.addEventListener('submit', handleSubmitDialog)
        content.addEventListener('submit', handleSubmitForm)
    }

    const clearEventListeners = () => {
        content.removeEventListener('click', handleProjectContainerClick)
        content.removeEventListener('click', handleEditOptionClick)
        content.removeEventListener('click', handleCancelDialogClick)
        content.removeEventListener('click', handleCancelFormClick)
        content.removeEventListener('click', handleDeleteClick)
        content.removeEventListener('submit', handleSubmitDialog)
        content.removeEventListener('submit', handleSubmitForm)
    }

    const clearPage = () => {
        clearEventListeners()
        while (content.hasChildNodes()) {
            content.removeChild(content.lastChild);
        }
        while (editDialog.hasChildNodes()) {
            editDialog.removeChild(editDialog.lastChild)
        }
    }

    const appendProjects = () => {
        const projects = document.createElement('div');
        projects.classList.add('projects');
        const title = document.createElement('p');
        title.classList.add('title');
        title.innerText = 'My Projects';
        projects.appendChild(title);

        for (const project of projectStorage) {
            let newProject = createProject(project)
            projects.append(newProject)
        }
        content.appendChild(projects)
        project.appendAddButton(projects, 'Add project')
    }

    const appendDropdown = (item) => {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        const dropdownButton = document.createElement('button');
        dropdownButton.classList.add('dropdownButton', 'itemButton');
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

    const createProject = (project) => {
        const projectContainer = document.createElement('div');
        projectContainer.classList.add('projectContainer');
        const projectName = document.createElement('p');
        projectName.classList.add('projectName');
        projectName.innerText = project.name;
        projectContainer.appendChild(projectName);
        appendDropdown(projectContainer);
        projectContainer.setAttribute('data-projectId', project._id);
        return projectContainer
    }

    const initPage = () => {
        initEventListeners()
        appendProjects()
        createEditProjectName()
    }

    return { initPage }
})();

export { home };
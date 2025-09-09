import {projectStorage} from './logic.js'
import {P} from "caniuse-lite/data/browsers";
const home= (function () {
    const content = document.querySelector('#content');

    //initializing dialog in order to access it in the ProjectItemEdit
    const createItemEditForm = () => {
        // create dialog, its form and inputs for task name and description
        const itemDialog = document.createElement('dialog');
        itemDialog.id = 'itemEditDialog';
        itemDialog.setAttribute('data-projectId', '');
        itemDialog.setAttribute('data-itemId', '');
        const itemEditForm = document.createElement('form');
        itemEditForm.classList.add('itemEditForm');
        itemEditForm.setAttribute('method', 'dialog');
        const itemEdit = document.createElement('div');
        itemEdit.classList.add('itemEdit');
        const inputName = document.createElement('textarea');
        inputName.setAttribute('name', 'itemName');
        inputName.setAttribute('placeholder', 'Task name');
        inputName.setAttribute('required', '');
        const inputDesc = document.createElement('textarea');
        inputDesc.setAttribute('name', 'itemDesc');
        inputDesc.setAttribute('placeholder', 'Description');

        // create auxiliary inputs, such as date input and priority selector
        const itemEditAux = document.createElement('div');
        itemEditAux.classList.add('itemEditAux');
        const inputDate = document.createElement('input');
        inputDate.id = 'dueDate';
        inputDate.setAttribute('type', 'date');
        inputDate.setAttribute('name', 'dueDate');
        inputDate.setAttribute('value', '');
        inputDate.setAttribute('min', '');
        const inputDateLabel = document.createElement('label');
        inputDateLabel.innerText = 'Date';
        inputDateLabel.setAttribute('for', 'dueDate')
        itemEditAux.appendChild(inputDateLabel)
        itemEditAux.appendChild(inputDate);
        // create priority selector and its options
        const selectorContainer = document.createElement('div');
        selectorContainer.classList.add('selectorContainer');
        const prioritySelectorLabel = document.createElement('label');
        prioritySelectorLabel.setAttribute('for', 'prioritySelector');
        prioritySelectorLabel.innerText = 'Priority';
        const prioritySelector = document.createElement('select');
        prioritySelector.id = 'prioritySelector';
        prioritySelector.name = 'prior';
        prioritySelector.appendChild(new Option('None', '0'));
        prioritySelector.appendChild(new Option('Low', '1'));
        prioritySelector.appendChild(new Option('Medium', '2'));
        prioritySelector.appendChild(new Option('High', '3'));
        selectorContainer.appendChild(prioritySelectorLabel);
        selectorContainer.appendChild(prioritySelector);
        itemEditAux.appendChild(selectorContainer);

        // create buttons for editForm
        const itemEditButtons = document.createElement('div');
        itemEditButtons.classList.add('itemEditButtons');
        const cancelEditButton = document.createElement('input');
        cancelEditButton.setAttribute('value', 'Cancel');
        cancelEditButton.setAttribute('type', 'submit');
        const confirmEditButton = document.createElement('input');
        confirmEditButton.setAttribute('value', 'Save');
        confirmEditButton.setAttribute('type', 'submit');
        itemEditButtons.appendChild(cancelEditButton);
        itemEditButtons.appendChild(confirmEditButton);

        itemDialog.appendChild(itemEditForm);
        itemEditForm.appendChild(itemEdit);
        // itemEdit.appendChild(labelName);
        itemEdit.appendChild(inputName);
        // itemEdit.appendChild(labelDesc);
        itemEdit.appendChild(inputDesc);
        itemEditForm.appendChild(itemEditButtons)
        itemEditForm.appendChild(itemEditAux);

        content.appendChild(itemDialog);
    }
    createItemEditForm()

    class ProjectItemEdit {
        constructor() {
            this.content = document.querySelector('#content')
            this.dialog = document.querySelector('#itemEditDialog');

            this.content.addEventListener('click', e => {
                if (e.target.closest('.itemContainer')) {
                    const projectId = e.target.closest('.wrapper').dataset.projectid
                    const itemContainer = e.target.closest('.itemContainer');
                    this.dialog.dataset.itemid = itemContainer.dataset.itemid;
                    this.dialog.dataset.projectid = projectId;
                    const itemName = itemContainer.firstChild.innerText;
                    let itemDesc = '';
                    if (itemContainer.lastChild.className === 'itemDesc') {
                        itemDesc = itemContainer.lastChild.innerText;
                    }
                    const itemDate = itemContainer.dataset.itemdate;
                    const itemPrior = itemContainer.dataset.itemprior;
                    let dialogItemName = this.dialog.querySelector('textarea[name="itemName"]');
                    let dialogItemDesc = this.dialog.querySelector('textarea[name="itemDesc"]');
                    let dialogItemDate = this.dialog.querySelector('input[name="dueDate"]');
                    let dialogItemPrior = this.dialog.querySelector('select#prioritySelector');
                    dialogItemName.value = itemName;
                    dialogItemDesc.value = itemDesc;
                    // console.log(itemDate)
                    dialogItemDate.value = itemDate;
                    dialogItemDate.min = itemDate;
                    dialogItemPrior.options[itemPrior].selected = true;
                    this.dialog.showModal()
                }
            })

            this.content.addEventListener('submit', e => {
                if (e.target.closest('.itemEditForm') && (e.submitter.value === 'Save')) {
                    e.preventDefault()
                    const itemInputs = Object.fromEntries(new FormData(e.target).entries());
                    console.log(itemInputs)
                    const dialogItemName = this.dialog.querySelector('input[name="itemName"]');
                    const dialogItemDesc = this.dialog.querySelector('input[name="itemDesc"]');
                    const dialogProjectId = this.dialog.dataset.projectid;
                    const dialogItemId = this.dialog.dataset.itemid;

                    const currentProjectElement = document.querySelector(`.wrapper[data-projectid="${dialogProjectId}"]`);
                    const currentItemElement = document.querySelector(`.itemContainer[data-itemid="${dialogItemId}"]`);
                    let currentItemName = currentItemElement.querySelector('.itemName');
                    let currentItemDesc = currentItemElement.querySelector('.itemDesc');
                    let currentItemDate = currentItemElement.dataset.itemdate;
                    let currentItemPrior = currentItemElement.dataset.itemprior;
                    if (!(currentItemName.innerText === itemInputs.itemName)) {
                        this.findItem(dialogProjectId, dialogItemId, this.changeName, itemInputs.itemName);
                        currentItemName.innerText = itemInputs.itemName;
                    }
                    if (!(currentItemDesc.innerText === itemInputs.itemDesc)) {
                        this.findItem(dialogProjectId, dialogItemId, this.changeDesc, itemInputs.itemDesc);
                        currentItemDesc.innerText = itemInputs.itemDesc;
                    }
                    if (!(currentItemDate === itemInputs.dueDate)) {
                        this.findItem(dialogProjectId, dialogItemId, this.changeDate, itemInputs.dueDate)
                        currentItemElement.dataset.itemdate = itemInputs.dueDate;
                    }
                    if (!(currentItemPrior === itemInputs.prior)) {
                        this.findItem(dialogProjectId, dialogItemId, this.changePriority, itemInputs.prior);
                        currentItemElement.dataset.itemprior = itemInputs.prior;
                    }
                    this.dialog.close()
                } else if (e.target.closest('.itemEditForm') && (e.submitter.value === 'Cancel')) {
                    e.preventDefault()
                    this.dialog.close()
                }
            })

            this.content.addEventListener('click', e => {
                if (e.target.closest('.checkboxItem')) {
                    console.log(projectStorage._items[0]._items[0].status);
                    const itemId = e.target.closest('.checkboxItem').dataset.itemid;
                    const projectId = e.target.closest('.wrapper').dataset.projectid;
                    const projectItem = e.target.closest('.projectItem');
                    const itemName = projectItem.querySelector('.itemName');
                    const itemDesc = projectItem.querySelector('.itemDesc');

                    this.checkboxFindItem(projectId, itemId);
                    e.target.classList.toggle('pressed');
                    itemName.classList.toggle('done');
                    itemDesc.classList.toggle('done');
                    console.log(projectStorage._items[0]._items[0]);
                }
            })

            // autoresize textareas with users input, so they won't be cooked;
            document.querySelectorAll('textarea').forEach(function(textarea) {
                textarea.style.height = textarea.scrollHeight + 'px';
                textarea.style.overflowY = 'hidden';

                textarea.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = this.scrollHeight + 'px';
                })
            });
        }

        checkboxFindItem(projectId, itemId) {
            for (const project of projectStorage) {
                if (project._id === projectId) {
                    for (const item of project) {
                        if (item._id === itemId) {
                            this.changeStatus(item)
                        }
                    }
                }
            }
        }
        findItem(projectId, itemId, func, newValue) {
            for (const project of projectStorage) {
                if (project._id === projectId) {
                    for (const item of project) {
                        if (item._id === itemId) {
                            // apply the needed func that changes either name, desc, priority, date, or status
                            func(item, newValue)
                        }
                    }
                }
            }
        }

        changeName(item, newName) {
            console.log(newName);
            item.name = newName;
            console.log(item.name)
        };

        changeDesc(item, newDesc) {
            item.description = newDesc;
        };

        changePriority(item, newPriority) {
            item.priority = newPriority;
        };

        changeDate(item, newDate) {
            item.dueDate = newDate;
        };

        changeStatus(item) {
            if (item.status === 0) {
                item.status = 1;
            } else {
                item.status = 0;
            }
        }
    }

    const projectItemEditInstance = new ProjectItemEdit();

    // this big boy creates all DOM stuff concerning project and it items
    const createProject = () => {
        const projects = document.createElement('div');
        projects.classList.add('projects');
        const title = document.createElement('p');
        title.classList.add('title');
        title.innerText = 'My Projects';

        projects.appendChild(title);

        for (const project of projectStorage) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('wrapper');
            const projectName = document.createElement('p');
            projectName.classList.add('projectName');
            projectName.innerText = project.name;
            wrapper.appendChild(projectName);
            wrapper.setAttribute('data-projectId', project._id);

            for (const item of project) {
                const projectItem = document.createElement('div');
                projectItem.classList.add('projectItem');
                const checkboxItem = document.createElement('button');
                checkboxItem.classList.add('checkboxItem');
                checkboxItem.innerText = '✓';
                checkboxItem.setAttribute('data-itemId', item._id);

                const itemContainer = document.createElement('div');
                itemContainer.classList.add('itemContainer');
                itemContainer.setAttribute('data-itemId', item._id);
                itemContainer.setAttribute('data-itemPrior', item.priority);
                itemContainer.setAttribute('data-itemDate', item.dueDate);
                const itemName = document.createElement('p');
                itemName.classList.add('itemName');
                const itemDesc = document.createElement('p');
                itemDesc.innerText = item.description;
                itemDesc.classList.add('itemDesc');
                itemName.innerText = item.name;
                projectItem.appendChild(checkboxItem)
                itemContainer.appendChild(itemName);
                itemContainer.appendChild(itemDesc);
                projectItem.appendChild(itemContainer);
                wrapper.appendChild(projectItem)
            }
            projects.appendChild(wrapper);
        }
        content.appendChild(projects)
    }

    const createLayout = () => {
        createProject()
    }

    return { createLayout }
})();

export { home };
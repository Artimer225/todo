import {projectStorage, logic} from './logic.js'
import {P} from "caniuse-lite/data/browsers";
const home= (function () {
    const content = document.querySelector('#content');
    const appendPrioritySelector = (item) => {
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
        item.appendChild(selectorContainer)
    }

    const appendFormButtons = (item, className) => {
        const formButtons = document.createElement('div');
        formButtons.classList.add(className);
        const cancelButton = document.createElement('input');
        cancelButton.value = 'Cancel';
        cancelButton.type = 'button';
        const saveButton = document.createElement('input');
        saveButton.value = 'Save';
        saveButton.type = 'submit';
        formButtons.appendChild(cancelButton);
        formButtons.appendChild(saveButton);
        item.appendChild(formButtons)
    }
    // initialize dialog in order to access it in the ProjectEventListener
    const createItemEditForm = () => {
        // create dialog, its form and inputs for task name and description
        const itemDialog = document.createElement('dialog');
        itemDialog.id = 'itemEditDialog';
        itemDialog.setAttribute('data-projectId', '');
        itemDialog.setAttribute('data-itemId', '');
        const itemEditForm = document.createElement('form');
        itemEditForm.classList.add('itemEditForm');
        itemEditForm.method = 'dialog'
        const itemEdit = document.createElement('div');
        itemEdit.classList.add('itemEdit');
        const inputName = document.createElement('textarea');
        inputName.name = 'itemName';
        inputName.placeholder = 'Task name';
        inputName.required = true;
        const inputDesc = document.createElement('textarea');
        inputDesc.name = 'itemDesc';
        inputDesc.placeholder = 'Description'

        // create auxiliary inputs, such as date input and priority selector
        const itemEditAux = document.createElement('div');
        itemEditAux.classList.add('itemEditAux');
        const inputDate = document.createElement('input');
        inputDate.id = 'dueDate';
        inputDate.type = 'date';
        inputDate.name = 'dueDate';
        inputDate.value = '';
        inputDate.min = '';
        const inputDateLabel = document.createElement('label');
        inputDateLabel.innerText = 'Date';
        inputDateLabel.for = 'dueDate';
        itemEditAux.appendChild(inputDateLabel)
        itemEditAux.appendChild(inputDate);
        appendPrioritySelector(itemEditAux)

        itemDialog.appendChild(itemEditForm);
        itemEditForm.appendChild(itemEdit);
        itemEdit.appendChild(inputName);
        itemEdit.appendChild(inputDesc);
        appendFormButtons(itemEditForm, 'itemEditButtons');
        itemEditForm.appendChild(itemEditAux);

        content.appendChild(itemDialog);
    }
    createItemEditForm()

    // fill in dialog with item contents (name, desc, priority, date)
    class ProjectEventListener {
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
                    if (itemContainer.lastChild.className.includes('itemDesc')) {
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
                    const dialogProjectId = this.dialog.dataset.projectid;
                    const dialogItemId = this.dialog.dataset.itemid;

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
                        this.findItem(dialogProjectId, dialogItemId, this.changePriority, itemInputs.prior, currentItemElement);
                        currentItemElement.dataset.itemprior = itemInputs.prior;
                    }
                    this.dialog.close()
                }
            })

            // on click change status either to done or not done yet
            this.content.addEventListener('click', e => {
                if (e.target.closest('.checkboxItem')) {
                    const itemId = e.target.closest('.checkboxItem').dataset.itemid;
                    const projectId = e.target.closest('.wrapper').dataset.projectid;
                    const projectItem = e.target.closest('.projectItem');
                    const itemName = projectItem.querySelector('.itemName');
                    const itemDesc = projectItem.querySelector('.itemDesc');

                    this.checkboxFindItem(projectId, itemId);
                    e.target.classList.toggle('pressed');
                    itemName.classList.toggle('done');
                    itemDesc.classList.toggle('done');
                }
                // close edit dialog on cancel button
                if (e.target.closest('.itemEditForm') && (e.target.value === 'Cancel')) {
                    e.preventDefault()
                    this.dialog.close()
                }
                // remove addForm and show addItem again
                if (e.target.closest('#addForm') && (e.target.value === 'Cancel')) {
                    e.preventDefault();
                    const currentWrapper = e.target.closest('.wrapper');
                    currentWrapper.querySelector('.addItem').classList.toggle('hidden');
                    const addForm = document.querySelector('#addForm');
                    addForm.remove()
                }
            })

            this.content.addEventListener('click', e => {
                if (e.target.closest('.addItem')) {
                    const currentAddItem = e.target;
                    const addForm = createAddForm();
                    currentAddItem.classList.toggle('hidden');
                    currentAddItem.insertAdjacentElement('beforebegin', addForm)
                }
            })

            // creates item after addForm save
            this.content.addEventListener('submit', e => {
                if (e.target.closest('#addForm') && (e.submitter.value === 'Save')) {
                    e.preventDefault();
                    const i = Object.fromEntries(new FormData(e.target).entries())
                    const currentProject = e.target.closest('.wrapper');
                    const currentProjectId = e.target.closest('.wrapper').dataset.projectid;
                    for (const project of projectStorage) {
                        if (project._id === currentProjectId) {
                            project.items = new logic.ProjectItem(i.itemName, i.itemDesc, i.prior, i.dueDate);
                            // get newly created item
                            const itemReference = project._items.at(-1);
                            let newItem = createItem(itemReference);
                            currentProject.lastElementChild.insertAdjacentElement('beforebegin', newItem);
                        }
                    }
                    currentProject.querySelector('.addItem').classList.toggle('hidden');
                    const addForm = document.querySelector('#addForm');
                    addForm.remove()
                }
            })

            // autoresize textareas (makes height bigger or smaller) with users input, so they won't be cooked;
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
        findItem(projectId, itemId, func, newValue, DOMItem) {
            for (const project of projectStorage) {
                if (project._id === projectId) {
                    for (const item of project) {
                        if (item._id === itemId) {
                            // apply the needed func that changes either name, desc, priority, date, or status
                            // DOMItem is an optional variable, used only for changePriority func, as it uses slightly
                            // different approach, compared to other functions
                            func(item, newValue, DOMItem)
                        }
                    }
                }
            }
        }

        changeName(item, newName) {
            console.log(newName);
            item.name = newName;
        };

        changeDesc(item, newDesc) {
            item.description = newDesc;
        };


        // call appendPriority in order to change visual representation of current priority
        changePriority(item, newPriority, DOMItem) {
            // console.log(DOMItem);
            let priorityToChange = DOMItem.closest('.projectItem').querySelector('.priorityItem')
            appendPriority(priorityToChange, newPriority)
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

    const projectEventListenerInstance = new ProjectEventListener();

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
                let newItem = createItem(item);
                wrapper.appendChild(newItem)
            }
            appendAddButton(wrapper);
            projects.appendChild(wrapper);
        }
        content.appendChild(projects)
    }

    // creates and appends populated item to its parent
    const createItem = (item) => {
        const projectItem = document.createElement('div');
        projectItem.classList.add('projectItem');
        const statusItem = document.createElement('div');
        statusItem.classList.add('statusItem');
        const checkboxItem = document.createElement('button');
        checkboxItem.classList.add('checkboxItem');
        checkboxItem.innerText = '✓';
        checkboxItem.setAttribute('data-itemId', item._id);
        const priorityItem = document.createElement('p');
        priorityItem.classList.add('priorityItem');
        statusItem.appendChild(checkboxItem);
        statusItem.appendChild(priorityItem);

        const itemContainer = document.createElement('div');
        itemContainer.classList.add('itemContainer');
        itemContainer.setAttribute('data-itemId', item._id);
        itemContainer.setAttribute('data-itemPrior', item.priority);
        itemContainer.setAttribute('data-itemDate', item.dueDate);

        appendPriority(priorityItem, item.priority)
        const itemName = document.createElement('p');
        itemName.classList.add('itemName');
        const itemDesc = document.createElement('p');
        itemDesc.innerText = item.description;
        itemDesc.classList.add('itemDesc');
        itemName.innerText = item.name;
        projectItem.appendChild(statusItem);
        itemContainer.appendChild(itemName);
        itemContainer.appendChild(itemDesc);
        projectItem.appendChild(itemContainer);
        return projectItem;
    }

    const appendAddButton = (wrapper) => {
        const addItem = document.createElement('button');
        addItem.classList.add('addItem');
        const addIcon = document.createElement('span');
        addItem.appendChild(addIcon);
        addIcon.innerText = '+';
        let addItemText = document.createTextNode('Add task');
        addItem.appendChild(addItemText);
        wrapper.appendChild(addItem);
    }

    const createAddForm = () => {
        const addForm = document.createElement('form');
        addForm.id = 'addForm';
        const itemMain = document.createElement('div');
        itemMain.classList.add('itemMain');
        const itemNameInput = document.createElement('input');
        itemNameInput.classList.add('itemNameInput');
        itemNameInput.placeholder = 'Task name';
        itemNameInput.required = true;
        itemNameInput.name = 'itemName';
        const itemDescInput = document.createElement('input');
        itemDescInput.classList.add('itemDescInput');
        itemDescInput.placeholder = 'Description';
        itemDescInput.name = 'itemDesc'
        itemMain.appendChild(itemNameInput);
        itemMain.appendChild(itemDescInput);

        const itemAux = document.createElement('div');
        itemAux.classList.add('itemAux');
        const itemDateInput = document.createElement('input');
        itemDateInput.type = 'date';
        itemDateInput.name = 'dueDate';
        itemDateInput.value = logic.todayDate();
        itemDateInput.min = itemDateInput.value;
        itemAux.appendChild(itemDateInput);
        appendPrioritySelector(itemAux);


        addForm.appendChild(itemMain);
        addForm.appendChild(itemAux);
        appendFormButtons(addForm, 'itemButtons')
        return addForm
    };

    // creates priority object and populates it ! signs
    const appendPriority = (item, num) => {
        let priorNum = Number(num)
        let prior = '!';
        const priorList = ['priorityNone', 'priorityOne', 'priorityTwo', 'priorityThree']
        // check whether priorityItem already has a class appended; if it has, remove it before assigning a new one
        for (let i = 0; i < priorList.length; i++) {
            if (Array.prototype.includes.call(item.classList, priorList[i])) {
                item.classList.remove(priorList[i]);
            }
        }
        item.innerText = prior.repeat(priorNum);
        item.classList.add(priorList[priorNum]);
        console.log(item.classList)
    }

    const createLayout = () => {
        createProject()
    }

    return { createLayout }
})();

export { home };
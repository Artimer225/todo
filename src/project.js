import {projectStorage, logic, findProject} from './logic.js';
import {P} from "caniuse-lite/data/browsers";
const project= (function () {
    const content = document.querySelector('#content');
    const editDialog = document.querySelector('#editDialog')
    // if flag is true, append label
    const appendPrioritySelector = (item, flag = true) => {
        const selectorContainer = document.createElement('div');
        selectorContainer.classList.add('selectorContainer');
        if (flag) {
            const prioritySelectorLabel = document.createElement('label');
            prioritySelectorLabel.setAttribute('for', 'prioritySelector');
            prioritySelectorLabel.innerText = 'Priority';
            selectorContainer.appendChild(prioritySelectorLabel);
        }
        const prioritySelector = document.createElement('select');
        prioritySelector.id = 'prioritySelector';
        prioritySelector.name = 'prior';
        prioritySelector.appendChild(new Option('None', '0'));
        prioritySelector.appendChild(new Option('Low', '1'));
        prioritySelector.appendChild(new Option('Medium', '2'));
        prioritySelector.appendChild(new Option('High', '3'));
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
        editDialog.setAttribute('data-projectId', '');
        editDialog.setAttribute('data-itemId', '');
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

        editDialog.appendChild(itemEditForm);
        itemEditForm.appendChild(itemEdit);
        itemEdit.appendChild(inputName);
        itemEdit.appendChild(inputDesc);
        appendFormButtons(itemEditForm, 'itemEditButtons');
        itemEditForm.appendChild(itemEditAux);

        content.appendChild(editDialog);
    }

    // clears the dialog and content div
    const clearPage = () => {
        while (content.hasChildNodes()) {
            content.removeChild(content.lastChild);
        }
        while (editDialog.hasChildNodes()) {
            editDialog.removeChild(editDialog.lastChild)
        }
    }

    // fill in dialog with item contents (name, desc, priority, date)
    class ProjectEventListener {
        constructor() {
            createItemEditForm()
            // this.dialog = document.getElementById('itemEditDialog');


            // show modal on item (task) click
            content.addEventListener('click', e => {
                if (e.target.closest('.itemContainer')) {
                    const projectId = e.target.closest('.wrapper').dataset.projectid
                    const itemContainer = e.target.closest('.itemContainer');
                    let itemId = itemContainer.dataset.itemid
                    editDialog.dataset.itemid = itemContainer.dataset.itemid;
                    editDialog.dataset.projectid = projectId;
                    const itemName = itemContainer.querySelector('.itemName').innerText;
                    let itemDesc = itemContainer.querySelector('.itemDesc').innerText;
                    const itemDate = itemContainer.dataset.itemdate;
                    const itemPrior = itemContainer.dataset.itemprior;
                    let dialogItemName = editDialog.querySelector('textarea[name="itemName"]');
                    let dialogItemDesc = editDialog.querySelector('textarea[name="itemDesc"]');
                    let dialogItemDate = editDialog.querySelector('input[name="dueDate"]');
                    let dialogItemPrior = editDialog.querySelector('select#prioritySelector');
                    dialogItemName.value = itemName;
                    dialogItemDesc.value = itemDesc;
                    dialogItemDate.value = itemDate;
                    dialogItemDate.min = itemDate;
                    dialogItemPrior.options[itemPrior].selected = true;
                    editDialog.showModal()
                }
            })

            // save modal fields
            content.addEventListener('submit', e => {
                if (e.target.closest('.itemEditForm') && (e.submitter.value === 'Save')) {
                    e.preventDefault()
                    const itemInputs = Object.fromEntries(new FormData(e.target).entries());
                    const dialogProjectId = editDialog.dataset.projectid;
                    const dialogItemId = editDialog.dataset.itemid;

                    const currentItemElement = document.querySelector(`.itemContainer[data-itemid="${dialogItemId}"]`);
                    let currentItemName = currentItemElement.querySelector('.itemName');
                    let currentItemDesc = currentItemElement.querySelector('.itemDesc');
                    let currentItemDate = currentItemElement.dataset.itemdate;
                    let currentItemDateElement = currentItemElement.querySelector('.itemDate')
                    let currentItemPrior = currentItemElement.dataset.itemprior;
                    if (!(currentItemName.innerText === itemInputs.itemName)) {
                        this.editItem(dialogProjectId, dialogItemId, this.changeName, itemInputs.itemName);
                        currentItemName.innerText = itemInputs.itemName;
                    }

                    if (!(currentItemDesc.innerText === itemInputs.itemDesc)) {
                        this.editItem(dialogProjectId, dialogItemId, this.changeDesc, itemInputs.itemDesc);
                        currentItemDesc.innerText = itemInputs.itemDesc;
                    }

                    if (!(currentItemDate === itemInputs.dueDate)) {
                        this.editItem(dialogProjectId, dialogItemId, this.changeDate, itemInputs.dueDate)
                        currentItemElement.dataset.itemdate = itemInputs.dueDate;
                        currentItemDateElement.innerText = logic.fancyDate(itemInputs.dueDate)
                    }

                    if (!(currentItemPrior === itemInputs.prior)) {
                        this.editItem(dialogProjectId, dialogItemId, this.changePriority, itemInputs.prior, currentItemElement);
                        currentItemElement.dataset.itemprior = itemInputs.prior;
                    }

                    editDialog.close()
                }
            })

            // on click change status either to done or not done yet
            content.addEventListener('click', e => {
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
                    editDialog.close()
                }
                // remove addForm and show addItem again
                if (e.target.closest('#addForm') && (e.target.value === 'Cancel')) {
                    e.preventDefault();
                    const currentWrapper = e.target.closest('.wrapper');
                    currentWrapper.querySelector('.addItem').classList.toggle('hidden');
                    const addForm = document.querySelector('#addForm');
                    addForm.remove()
                }

                // deletes item on delete button click
                if (e.target.value === 'delete') {
                    const project = e.target.closest('.wrapper');
                    const projectId = project.dataset.projectid;
                    const item = e.target.closest('.projectItem')
                    const itemId = item.querySelector('.itemContainer').dataset.itemid
                    this.deleteItem(projectId, itemId)
                    item.remove()
                }
            })

            content.addEventListener('click', e => {
                if (e.target.closest('.addItem') && !!this.checkAddFormStatus() === false) {
                    const currentAddItem = e.target;
                    const addForm = createAddForm();
                    currentAddItem.classList.toggle('hidden');
                    currentAddItem.insertAdjacentElement('beforebegin', addForm)
                } else if (e.target.closest('.addItem') && !!this.checkAddFormStatus() === true) {
                    const previousAddForm = document.querySelector('#addForm');
                    const previousAddButton = previousAddForm.closest('.wrapper').querySelector('.addItem')
                    previousAddForm.remove()
                    // TOGGLE THE PREVIOUSADDBUTTON CLASS, SO IT WOULD BE VISIBLE ONCE AGAIN
                    previousAddButton.classList.toggle('hidden');
                    const currentAddItem = e.target;
                    const addForm = createAddForm();
                    currentAddItem.classList.toggle('hidden');
                    currentAddItem.insertAdjacentElement('beforebegin', addForm)
                }
            })

            // creates item after addForm save
            content.addEventListener('submit', e => {
                if (e.target.closest('#addForm') && (e.submitter.value === 'Save')) {
                    e.preventDefault();
                    const i = Object.fromEntries(new FormData(e.target).entries())
                    const currentProject = e.target.closest('.wrapper');
                    const currentProjectId = document.querySelector('.wrapper').dataset.projectid
                    const currentProjectObj = findProject(currentProjectId)
                    console.log(i)
                    currentProjectObj.items = new logic.ProjectItem(i.itemName, i.itemDesc, i.prior, i.dueDate);
                    // get newly created item
                    const itemReference = currentProjectObj._items.at(-1);
                    let newItem = createItem(itemReference);
                    currentProject.lastElementChild.insertAdjacentElement('beforebegin', newItem);


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

        // checks if addForm is present in DOM; if it's, return true
        checkAddFormStatus() {
            return document.querySelector('#addForm')
        };

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
        };

        findItem(projectId, itemId, returnIndex = false) {
            const project = findProject(projectId);
            for (const item of project) {
                if (item._id === itemId && !returnIndex) {
                    return item
                } else if (item._id === itemId && returnIndex) {
                    return project._items.indexOf(item);
                }
            }
        };

        deleteItem(projectId, itemId) {
            const project = findProject(projectId);
            const item = this.findItem(projectId, itemId, true);
            project._items.splice(item, 1)
            return project
        };



        // editItem uses findProject and findItem to find needed item, then edits it with corresponding function
        editItem(projectId, itemId, func, newValue, DOMItem) {
            const itemToEdit = this.findItem(projectId, itemId);
            func(itemToEdit, newValue, DOMItem)
        };

        // all change functions change (wow) properties of an item
        changeName(item, newName) {
            item.name = newName;
        };

        changeDesc(item, newDesc) {
            item.description = newDesc;
        };

        // calls appendPriority in order to change visual representation of current priority
        changePriority(item, newPriority, DOMItem) {
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

    const createProject = (project) => {
        const projects = document.createElement('div');
        projects.classList.add('projects');
        const title = document.createElement('p');
        title.classList.add('title');
        title.innerText = project.name;
        projects.appendChild(title);
        const wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');
        wrapper.dataset.projectid = project._id;
        for (const item of project) {
            console.log(item)
            let newItem = createItem(item);
            wrapper.appendChild(newItem)
        }
        appendAddButton(wrapper);
        projects.appendChild(wrapper);
        content.appendChild(projects);
        const projectEventListenerInstance = new ProjectEventListener();
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
        itemName.className = 'itemName';
        const itemDesc = document.createElement('p');
        itemDesc.className = 'itemDesc';
        const itemDate = document.createElement('p');
        itemDate.className = 'itemDate'
        itemDesc.innerText = item.description;
        itemName.innerText = item.name;
        itemDate.innerText = logic.fancyDate(item.dueDate);
        projectItem.appendChild(statusItem);
        itemContainer.appendChild(itemName);
        itemContainer.appendChild(itemDesc);
        itemContainer.appendChild(itemDate)
        projectItem.appendChild(itemContainer);
        appendDelButton(projectItem);
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

    const appendDelButton = (item) => {
        const delButton = document.createElement('button');
        delButton.className = 'delButton';
        delButton.value = 'delete';
        delButton.innerText = 'DEL';
        item.appendChild(delButton);
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
        itemDateInput.value = '';
        itemDateInput.min = logic.todayDate();
        itemAux.appendChild(itemDateInput);
        appendPrioritySelector(itemAux, false);


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
    }

    const createLayout = (project) => {
        createProject(project)
    }

    return { createLayout, appendFormButtons, clearPage }
})();

export { project };
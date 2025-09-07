import {projectStorage} from './logic.js'
import {P} from "caniuse-lite/data/browsers";
const home= (function () {
    const content = document.querySelector('#content');

    //initializing dialog in order to access it in the ProjectItemEdit
    const createItemEditForm = () => {
        const itemDialog = document.createElement('dialog');
        itemDialog.id = 'itemEditDialog';
        itemDialog.setAttribute('data-projectId', '');
        itemDialog.setAttribute('data-itemId', '');
        // itemDialog.classList.add('itemDialog');
        const itemEditForm = document.createElement('form');
        itemEditForm.classList.add('itemEditForm');
        itemEditForm.setAttribute('method', 'dialog');
        const itemEdit = document.createElement('div');
        itemEdit.classList.add('itemEdit');
        // const labelName = document.createElement('label');
        // labelName.setAttribute('for', 'changeName');
        const inputName = document.createElement('input');
        inputName.setAttribute('name', 'itemName');

        // const labelDesc = document.createElement('label');
        // labelDesc.setAttribute('for', 'changeDesc');
        const inputDesc = document.createElement('input');
        inputDesc.setAttribute('name', 'itemDesc');



        // create buttons for editForm

        const itemEditButtons = document.createElement('div');
        itemEditButtons.classList.add('itemEditButtons');
        const cancelEditButton = document.createElement('input');
        cancelEditButton.setAttribute('value', 'cancel');
        cancelEditButton.setAttribute('type', 'submit');
        const confirmEditButton = document.createElement('input');
        confirmEditButton.setAttribute('value', 'confirm');
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
                    let dialogItemName = this.dialog.querySelector('input[name="itemName"]');
                    let dialogItemDesc = this.dialog.querySelector('input[name="itemDesc"]');
                    dialogItemName.value = itemName;
                    dialogItemDesc.value = itemDesc;
                    this.dialog.showModal()
                    // console.log(projectStorage)
                }
            })

            this.content.addEventListener('submit', e => {
                if (e.target.closest('.itemEditForm') && (e.submitter.value === 'confirm')) {
                    const itemInputs = Object.fromEntries(new FormData(e.target).entries());
                    const dialogItemName = this.dialog.querySelector('input[name="itemName"]');
                    const dialogItemDesc = this.dialog.querySelector('input[name="itemDesc"]');
                    const dialogProjectId = this.dialog.dataset.projectid;
                    const dialogItemId = this.dialog.dataset.itemid;

                    const currentProjectElement = document.querySelector(`.wrapper[data-projectid="${dialogProjectId}"]`);
                    const currentItemElement = document.querySelector(`.itemContainer[data-itemid="${dialogItemId}"]`);
                    let currentItemName = currentItemElement.querySelector('.itemName');
                    let currentItemDesc = currentItemElement.querySelector('.itemDesc');
                    if (!(currentItemName.innerText === itemInputs.itemName)) {
                        this.findItem(dialogProjectId, dialogItemId, this.changeName, itemInputs.itemName);
                        currentItemName.innerText = itemInputs.itemName;
                        // console.log(projectStorage)
                    }
                    if (!(currentItemDesc.innerText === itemInputs.itemDesc)) {
                        this.findItem(dialogProjectId, dialogItemId, this.changeDesc, itemInputs.itemDesc);
                        currentItemDesc.innerText = itemInputs.itemDesc;
                        // console.log(projectStorage)
                    }
                    e.preventDefault()
                    this.dialog.close()
                } else if (e.target.closest('.itemEditForm') && (e.submitter.value === 'cancel')) {
                    e.preventDefault()
                    this.dialog.close()
                }
            })
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
                // to be changed into proper checkbox
                const checkboxTest = document.createElement('p');
                checkboxTest.innerText = '✓';
                checkboxItem.appendChild(checkboxTest);

                const itemContainer = document.createElement('div');
                itemContainer.classList.add('itemContainer');
                itemContainer.setAttribute('data-itemId', item._id);
                const itemName = document.createElement('p');
                itemName.classList.add('itemName');
                const itemDesc = document.createElement('p');
                itemDesc.innerText = item.description;
                itemDesc.classList.add('itemDesc');

                // createItemEditForm(itemContainer);

                // const itemPrior = document.createElement('p');
                // const itemDate = document.createElement('p');
                // const itemStatus = document.createElement('p');

                itemName.innerText = item.name;

                // itemPrior.innerText = item.priority;
                // itemDate.innerText = item.dueDate;
                // itemStatus.innerText = item.status;

                projectItem.appendChild(checkboxItem)
                itemContainer.appendChild(itemName);
                itemContainer.appendChild(itemDesc);

                // projectItem.appendChild(itemPrior);
                // projectItem.appendChild(itemDate);
                // projectItem.appendChild(itemStatus);
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
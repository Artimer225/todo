import {
  projectStorage,
  logic,
  findProject,
  projectStorageSave,
} from "./logic.js";
const project = (function () {
  const content = document.querySelector("#content");
  const editDialog = document.querySelector("#editDialog");
  const deleteDialog = document.querySelector("#deleteDialog");

  // if flag is true, append label
  const appendPrioritySelector = (item, flag = true) => {
    const prioritySelector = document.createElement("select");
    prioritySelector.id = "prioritySelector";
    prioritySelector.name = "prior";
    prioritySelector.appendChild(new Option("None", "0"));
    prioritySelector.appendChild(new Option("Low", "1"));
    prioritySelector.appendChild(new Option("Medium", "2"));
    prioritySelector.appendChild(new Option("High", "3"));
    if (flag) {
      const prioritySelectorLabel = document.createElement("label");
      prioritySelectorLabel.setAttribute("for", "prioritySelector");
      prioritySelectorLabel.innerText = "Priority";
      item.appendChild(prioritySelectorLabel);
    }
    item.appendChild(prioritySelector);
  };

  const appendFormButtons = (
    item,
    className,
    saveButtonValue = "Save",
    disabled = false,
  ) => {
    const formButtons = document.createElement("div");
    formButtons.classList.add(className);
    const cancelButton = document.createElement("input");
    cancelButton.className = "cancelButton";
    cancelButton.value = "Cancel";
    cancelButton.type = "button";
    const saveButton = document.createElement("input");
    saveButton.className = "confirmButton";
    saveButton.value = saveButtonValue;
    saveButton.type = "submit";
    saveButton.disabled = disabled;
    formButtons.appendChild(cancelButton);
    formButtons.appendChild(saveButton);
    item.appendChild(formButtons);
  };
  // initialize dialog in order to access it in the ProjectEventListener
  const createItemEditForm = () => {
    // create dialog, its form and inputs for task name and description
    editDialog.setAttribute("data-projectId", "");
    editDialog.setAttribute("data-itemId", "");
    const itemEditForm = document.createElement("form");
    itemEditForm.classList.add("itemEditForm");
    itemEditForm.method = "dialog";
    const itemUpperPanel = document.createElement("div");
    itemUpperPanel.className = "itemUpperPanel";
    const itemTitle = document.createElement("p");
    itemTitle.className = "itemTitle";
    itemTitle.innerText = "Edit task";
    const itemDeleteButton = document.createElement("button");
    itemDeleteButton.classList.add("itemButton", "itemDeleteButton");
    const itemCloseButton = document.createElement("button");
    itemCloseButton.classList.add("itemButton", "itemCloseButton");
    itemUpperPanel.appendChild(itemTitle);
    itemUpperPanel.appendChild(itemDeleteButton);
    itemUpperPanel.appendChild(itemCloseButton);

    const itemEdit = document.createElement("div");
    itemEdit.classList.add("itemEdit", "itemEditInput");
    const inputName = document.createElement("textarea");
    inputName.name = "itemName";
    inputName.placeholder = "Task name";
    inputName.required = true;
    const inputDesc = document.createElement("textarea");
    inputDesc.name = "itemDesc";
    inputDesc.placeholder = "Description";

    // create auxiliary inputs, such as date input and priority selector
    const itemEditAux = document.createElement("div");
    itemEditAux.classList.add("itemEditAux");
    const inputDateLabel = document.createElement("label");
    inputDateLabel.innerText = "Date";
    inputDateLabel.setAttribute("for", "dueDate");
    const inputDate = document.createElement("input");
    inputDate.id = "dueDate";
    inputDate.type = "date";
    inputDate.name = "dueDate";
    inputDate.className = "itemDateInput";
    inputDate.value = "";
    inputDate.min = "";
    // inputDateLabel.appendChild(inputDate)
    itemEditAux.appendChild(inputDateLabel);
    itemEditAux.appendChild(inputDate);
    appendPrioritySelector(itemEditAux);

    editDialog.appendChild(itemEditForm);
    itemEditForm.appendChild(itemUpperPanel);
    itemEditForm.appendChild(itemEdit);
    itemEdit.appendChild(inputName);
    itemEdit.appendChild(inputDesc);
    appendFormButtons(itemEditForm, "itemEditButtons");
    itemEditForm.appendChild(itemEditAux);

    content.appendChild(editDialog);
  };

  const createDeleteDialog = (item = true) => {
    deleteDialog.dataset.projectid = "";
    const titleDialog = document.createElement("p");
    titleDialog.className = "titleDialog";
    if (item) {
      titleDialog.innerText = "Delete task?";
      deleteDialog.dataset.itemid = "";
    } else {
      titleDialog.innerText = "Delete project?";
    }

    const bodyDialog = document.createElement("p");
    bodyDialog.className = "bodyDialog";

    const deleteButtons = document.createElement("div");
    deleteButtons.className = "deleteButtons";
    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.className = "cancelButton";

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.className = "confirmButton";
    deleteButton.id = "deleteButton";
    deleteButtons.appendChild(cancelButton);
    deleteButtons.appendChild(deleteButton);

    deleteDialog.appendChild(titleDialog);
    deleteDialog.appendChild(bodyDialog);
    deleteDialog.appendChild(deleteButtons);
    content.appendChild(deleteDialog);
  };

  const checkboxFindItem = (projectId, itemId) => {
    for (const project of projectStorage) {
      if (project._id === projectId) {
        for (const item of project) {
          if (item._id === itemId) {
            changeStatus(item);
            projectStorageSave();
          }
        }
      }
    }
  };

  const findItem = (projectId, itemId, returnIndex = false) => {
    const project = findProject(projectId);
    for (const item of project) {
      if (item._id === itemId && !returnIndex) {
        return item;
      } else if (item._id === itemId && returnIndex) {
        return project._items.indexOf(item);
      }
    }
  };

  const deleteItem = (projectId, itemId) => {
    const project = findProject(projectId);
    const item = findItem(projectId, itemId, true);
    project._items.splice(item, 1);
    return project;
  };

  // editItem uses findProject and findItem to find needed item, then edits it with corresponding function
  const editItem = (projectId, itemId, func, newValue, DOMItem) => {
    const itemToEdit = findItem(projectId, itemId);
    func(itemToEdit, newValue, DOMItem);
    projectStorageSave();
  };

  // all change functions change (wow) properties of an item
  const changeName = (item, newName) => {
    item.name = newName;
  };

  const changeDesc = (item, newDesc) => {
    item.description = newDesc;
  };

  // calls appendPriority in order to change visual representation of current priority
  const changePriority = (item, newPriority, DOMItem) => {
    let priorityToChange =
      DOMItem.closest(".projectItem").querySelector(".priorityItem");
    appendPriority(priorityToChange, newPriority);
    item.priority = newPriority;
  };

  const changeDate = (item, newDate) => {
    item.dueDate = newDate;
  };

  const changeStatus = (item) => {
    // using XOR assignment operator to change status in a neat way!
    item.status ^= 1;
  };

  const createAddForm = () => {
    const addForm = document.createElement("form");
    addForm.id = "addForm";
    const itemMain = document.createElement("div");
    itemMain.classList.add("itemMain");
    const itemNameInput = document.createElement("input");
    itemNameInput.classList.add("itemNameInput");
    itemNameInput.placeholder = "Task name";
    // itemNameInput.required = true;
    itemNameInput.name = "itemName";
    const itemDescInput = document.createElement("input");
    itemDescInput.classList.add("itemDescInput");
    itemDescInput.placeholder = "Description";
    itemDescInput.name = "itemDesc";
    itemMain.appendChild(itemNameInput);
    itemMain.appendChild(itemDescInput);

    const itemAux = document.createElement("div");
    itemAux.classList.add("itemAux");
    const itemDateInput = document.createElement("input");
    itemDateInput.type = "date";
    itemDateInput.name = "dueDate";
    itemDateInput.className = "itemDateInput";
    itemDateInput.value = "";
    itemDateInput.min = logic.todayDate();
    itemAux.appendChild(itemDateInput);
    appendPrioritySelector(itemAux, false);

    addForm.appendChild(itemMain);
    addForm.appendChild(itemAux);
    appendFormButtons(addForm, "itemButtons", "Add task", true);
    return addForm;
  };

  const handleItemContainerClick = (e) => {
    if (e.target.closest(".itemContainer")) {
      const projectId = e.target.closest(".wrapper").dataset.projectid;
      const itemContainer = e.target.closest(".itemContainer");
      editDialog.dataset.itemid = itemContainer.dataset.itemid;
      editDialog.dataset.projectid = projectId;
      const itemName = itemContainer.querySelector(".itemName").innerText;
      let itemDesc = itemContainer.querySelector(".itemDesc").innerText;
      const itemDate = itemContainer.dataset.itemdate;
      const itemPrior = itemContainer.dataset.itemprior;
      let dialogItemName = editDialog.querySelector(
        'textarea[name="itemName"]',
      );
      let dialogItemDesc = editDialog.querySelector(
        'textarea[name="itemDesc"]',
      );
      let dialogItemDate = editDialog.querySelector('input[name="dueDate"]');
      let dialogItemPrior = editDialog.querySelector("select#prioritySelector");
      dialogItemName.value = itemName;
      dialogItemDesc.value = itemDesc;
      dialogItemDate.value = itemDate;
      dialogItemDate.min = itemDate;
      dialogItemPrior.options[itemPrior].selected = true;
      editDialog.showModal();

      document.querySelectorAll("textarea").forEach(function (textarea) {
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.style.overflowY = "hidden";

        textarea.addEventListener("input", function () {
          this.style.height = "auto";
          this.style.height = this.scrollHeight + "px";
        });
      });
    }
  };

  const checkAddFormStatus = () => {
    return document.querySelector("#addForm");
  };

  //toggle disabled state if name input has length less than one
  const checkNameInputLength = () => {
    if (document.querySelector("#addForm")) {
      const nameInput = document.querySelector(".itemNameInput");
      const addForm = nameInput.closest("#addForm");
      const confirmButton = addForm.querySelector(".confirmButton");
      confirmButton.disabled = !nameInput.value.length;
    }
  };

  const handleAddTaskClick = (e) => {
    if (e.target.closest(".addItem") && !!checkAddFormStatus() === false) {
      const currentAddItem = e.target;
      const addForm = createAddForm();
      currentAddItem.classList.toggle("hidden");
      currentAddItem.insertAdjacentElement("beforebegin", addForm);
    } else if (
      e.target.closest(".addItem") &&
      !!checkAddFormStatus() === true
    ) {
      const previousAddForm = document.querySelector("#addForm");
      const previousAddButton = previousAddForm
        .closest(".wrapper")
        .querySelector(".addItem");
      previousAddForm.remove();
      // TOGGLE THE PREVIOUSADDBUTTON CLASS, SO IT WOULD BE VISIBLE ONCE AGAIN
      previousAddButton.classList.toggle("hidden");
      const currentAddItem = e.target;
      const addForm = createAddForm();
      currentAddItem.classList.toggle("hidden");
      currentAddItem.insertAdjacentElement("beforebegin", addForm);
    }
  };

  const handleCheckboxClick = (e) => {
    if (e.target.closest(".checkboxItem")) {
      const itemId = e.target.closest(".checkboxItem").dataset.itemid;
      const projectId = e.target.closest(".wrapper").dataset.projectid;
      const projectItem = e.target.closest(".projectItem");
      const itemName = projectItem.querySelector(".itemName");
      const itemDesc = projectItem.querySelector(".itemDesc");

      checkboxFindItem(projectId, itemId);
      e.target.classList.toggle("pressed");
      itemName.classList.toggle("done");
      itemDesc.classList.toggle("done");
    }
  };

  const handleDeleteButtonClick = (e) => {
    if (
      e.target.closest(".itemDeleteButton") &&
      e.target.parentElement.className === "itemUpperPanel"
    ) {
      e.preventDefault();
      const itemName = e.target
        .closest(".itemEditForm")
        .querySelector('textarea[name="itemName"]').value;
      const bodyDialog = document.querySelector(".bodyDialog");
      bodyDialog.innerHTML = `The <b>${itemName}</b> task will be permanently deleted.`;
      deleteDialog.dataset.itemid = editDialog.dataset.itemid;
      deleteDialog.dataset.projectid = editDialog.dataset.projectid;
      deleteDialog.showModal();
    }
    if (
      e.target.value === "delete" &&
      e.target.parentElement.className === "projectItem"
    ) {
      e.preventDefault();
      const item = e.target.previousSibling;
      const itemId = item.dataset.itemid;
      const projectId = item.closest(".wrapper").dataset.projectid;
      const itemName = item.querySelector(".itemName").innerText;
      const bodyDialog = document.querySelector(".bodyDialog");
      bodyDialog.innerHTML = `The <b>${itemName}</b> task will be permanently deleted.`;
      deleteDialog.dataset.itemid = itemId;
      deleteDialog.dataset.projectid = projectId;
      deleteDialog.showModal();
    }
  };

  const handleDialogCancelClick = (e) => {
    if (
      (e.target.closest(".itemEditForm") && e.target.value === "Cancel") ||
      e.target.closest(".itemCloseButton")
    ) {
      e.preventDefault();
      editDialog.close();
    }
    if (
      e.target.closest(".cancelButton") &&
      e.target.parentElement.className === "deleteButtons"
    ) {
      e.preventDefault();
      deleteDialog.close();
    }
  };

  const handleAddFormCancelClick = (e) => {
    if (e.target.closest("#addForm") && e.target.value === "Cancel") {
      e.preventDefault();
      const currentWrapper = e.target.closest(".wrapper");
      currentWrapper.querySelector(".addItem").classList.toggle("hidden");
      const addForm = document.querySelector("#addForm");
      addForm.remove();
    }
  };

  const handleDeleteItemClick = (e) => {
    // confirm delete in a pop-up dialog
    if (
      e.target.closest("#deleteButton") &&
      e.target.parentElement.className === "deleteButtons"
    ) {
      const itemId = deleteDialog.dataset.itemid;
      const projectId = deleteDialog.dataset.projectid;
      const item = document
        .querySelector(`.itemContainer[data-itemid="${itemId}"]`)
        .closest(".projectItem");
      deleteItem(projectId, itemId);
      item.remove();
      projectStorageSave();
      deleteDialog.close();
      editDialog.close();
    }
  };

  const handleEditItemSubmit = (e) => {
    if (e.target.closest(".itemEditForm") && e.submitter.value === "Save") {
      e.preventDefault();
      const itemInputs = Object.fromEntries(new FormData(e.target).entries());
      const dialogProjectId = editDialog.dataset.projectid;
      const dialogItemId = editDialog.dataset.itemid;

      const currentItemElement = document.querySelector(
        `.itemContainer[data-itemid="${dialogItemId}"]`,
      );
      let currentItemName = currentItemElement.querySelector(".itemName");
      let currentItemDesc = currentItemElement.querySelector(".itemDesc");
      let currentItemDate = currentItemElement.dataset.itemdate;
      let currentItemDateElement =
        currentItemElement.querySelector(".itemDate");
      let currentItemPrior = currentItemElement.dataset.itemprior;
      if (!(currentItemName.innerText === itemInputs.itemName)) {
        editItem(
          dialogProjectId,
          dialogItemId,
          changeName,
          itemInputs.itemName,
        );
        currentItemName.innerText = itemInputs.itemName;
      }

      if (!(currentItemDesc.innerText === itemInputs.itemDesc)) {
        editItem(
          dialogProjectId,
          dialogItemId,
          changeDesc,
          itemInputs.itemDesc,
        );
        currentItemDesc.innerText = itemInputs.itemDesc;
      }

      if (!(currentItemDate === itemInputs.dueDate)) {
        editItem(dialogProjectId, dialogItemId, changeDate, itemInputs.dueDate);
        currentItemElement.dataset.itemdate = itemInputs.dueDate;
        currentItemDateElement.innerText = logic.fancyDate(itemInputs.dueDate);
      }

      if (!(currentItemPrior === itemInputs.prior)) {
        editItem(
          dialogProjectId,
          dialogItemId,
          changePriority,
          itemInputs.prior,
          currentItemElement,
        );
        currentItemElement.dataset.itemprior = itemInputs.prior;
      }
      editDialog.close();
      projectStorageSave();
    }
  };

  const handleCreateItemSubmit = (e) => {
    if (e.target.closest("#addForm") && e.submitter.value === "Add task") {
      e.preventDefault();
      const i = Object.fromEntries(new FormData(e.target).entries());
      console.log(i)
      const currentProject = e.target.closest(".wrapper");
      const currentProjectId =
        document.querySelector(".wrapper").dataset.projectid;
      const currentProjectObj = findProject(currentProjectId);
      currentProjectObj.items = new logic.ProjectItem(
        i.itemName,
        i.itemDesc,
        i.prior,
        i.dueDate
      );
      // get newly created item
      const itemReference = currentProjectObj._items.at(-1);
      let newItem = createItem(itemReference);
      currentProject.lastElementChild.insertAdjacentElement(
        "beforebegin",
        newItem,
      );

      currentProject.querySelector(".addItem").classList.toggle("hidden");
      const addForm = document.querySelector("#addForm");
      addForm.remove();
      projectStorageSave();
    }
  };

  const initEventListeners = () => {
    content.addEventListener("click", handleItemContainerClick);
    content.addEventListener("click", handleAddTaskClick);
    content.addEventListener("input", checkNameInputLength);
    content.addEventListener("click", handleCheckboxClick);
    content.addEventListener("click", handleDialogCancelClick);
    content.addEventListener("click", handleDeleteButtonClick);
    content.addEventListener("click", handleAddFormCancelClick);
    content.addEventListener("click", handleDeleteItemClick);
    content.addEventListener("submit", handleEditItemSubmit);
    content.addEventListener("submit", handleCreateItemSubmit);
  };

  const clearEventListeners = () => {
    content.removeEventListener("click", handleItemContainerClick);
    content.removeEventListener("click", handleCheckboxClick);
    content.removeEventListener("click", handleAddTaskClick);
    content.removeEventListener("input", checkNameInputLength);
    content.removeEventListener("click", handleDialogCancelClick);
    content.removeEventListener("click", handleAddFormCancelClick);
    content.removeEventListener("click", handleDeleteItemClick);
    content.removeEventListener("submit", handleEditItemSubmit);
    content.removeEventListener("submit", handleCreateItemSubmit);
  };

  // create whole layout and populate it with actual project items
  const createProject = (project) => {
    const projects = document.createElement("div");
    projects.classList.add("projects");
    const title = document.createElement("p");
    title.classList.add("title");
    title.innerText = project.name;
    projects.appendChild(title);
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    wrapper.dataset.projectid = project._id;
    for (const item of project) {
      let newItem = createItem(item);
      wrapper.appendChild(newItem);
    }
    appendAddButton(wrapper, "Add task");
    projects.appendChild(wrapper);
    content.appendChild(projects);
  };

  // creates and appends populated item to its parent
  const createItem = (item) => {
    const projectItem = document.createElement("div");
    projectItem.classList.add("projectItem");
    const statusItem = document.createElement("div");
    statusItem.classList.add("statusItem");
    const checkboxItem = document.createElement("button");
    checkboxItem.classList.add("checkboxItem");
    checkboxItem.innerText = "✓";
    checkboxItem.setAttribute("data-itemId", item._id);
    const priorityItem = document.createElement("p");
    priorityItem.classList.add("priorityItem");
    statusItem.appendChild(checkboxItem);
    statusItem.appendChild(priorityItem);

    const itemContainer = document.createElement("div");
    itemContainer.classList.add("itemContainer");
    itemContainer.setAttribute("data-itemId", item._id);
    itemContainer.setAttribute("data-itemPrior", item.priority);
    itemContainer.setAttribute("data-itemDate", item.dueDate);

    appendPriority(priorityItem, item.priority);
    const itemName = document.createElement("p");
    itemName.className = "itemName";
    const itemDesc = document.createElement("p");
    itemDesc.className = "itemDesc";

    // apply 'done' style if item status is 1
    if (item.status) {
      checkboxItem.classList.toggle("pressed");
      itemName.classList.toggle("done");
      itemDesc.classList.toggle("done");
    }

    const itemDate = document.createElement("p");
    itemDate.className = "itemDate";
    itemDesc.innerText = item.description;
    itemName.innerText = item.name;
    itemDate.innerText = logic.fancyDate(item.dueDate);
    projectItem.appendChild(statusItem);
    itemContainer.appendChild(itemName);
    itemContainer.appendChild(itemDesc);
    itemContainer.appendChild(itemDate);
    projectItem.appendChild(itemContainer);
    appendDelButton(projectItem);
    return projectItem;
  };

  const appendAddButton = (wrapper, addText) => {
    const addItem = document.createElement("button");
    addItem.classList.add("addItem");
    const addIcon = document.createElement("span");
    addItem.appendChild(addIcon);
    addIcon.innerText = "+";
    let addItemText = document.createTextNode(addText);
    addItem.appendChild(addItemText);
    wrapper.appendChild(addItem);
  };

  const appendDelButton = (item) => {
    const delButton = document.createElement("button");
    delButton.classList.add("itemButton", "itemDeleteButton");
    delButton.value = "delete";
    item.appendChild(delButton);
  };

  // creates priority object and populates it ! signs
  const appendPriority = (item, num) => {
    let priorNum = Number(num);
    let prior = "!";
    const priorList = [
      "priorityNone",
      "priorityOne",
      "priorityTwo",
      "priorityThree",
    ];
    // check whether priorityItem already has a class appended; if it has, remove it before assigning a new one
    for (let i = 0; i < priorList.length; i++) {
      if (Array.prototype.includes.call(item.classList, priorList[i])) {
        item.classList.remove(priorList[i]);
      }
    }
    item.innerText = prior.repeat(priorNum);
    item.classList.add(priorList[priorNum]);
  };

  const clearPage = () => {
    clearEventListeners();
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild);
    }
    while (editDialog.hasChildNodes()) {
      editDialog.removeChild(editDialog.lastChild);
    }
    while (deleteDialog.hasChildNodes()) {
      deleteDialog.removeChild(deleteDialog.lastChild);
    }
  };

  const initPage = (project) => {
    createItemEditForm();
    createDeleteDialog();
    initEventListeners();
    createProject(project);
  };

  return {
    appendFormButtons,
    appendAddButton,
    clearPage,
    createItemEditForm,
    createDeleteDialog,
    initPage,
  };
})();

export { project };

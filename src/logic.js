const logic = (function () {
  const delProject = {
    removeItem(id) {
      const project = findProject(id);
      console.log(project);
      const removeItem = this._items.indexOf(project);
      if (!(removeItem === -1)) {
        this._items.splice(removeItem, 1);
      }
    },
  };

  class ProjectCollection {
    constructor() {
      this._items = [];
    }

    set items(item) {
      this._items.push(item);
    }

    applyData(json) {
      Object.assign(this, json);
    }

    clear() {
      this._items = [];
    }

    [Symbol.iterator]() {
      return this._items[Symbol.iterator]();
    }
  }

  Object.assign(ProjectCollection.prototype, delProject);

  class Project {
    constructor(name) {
      this.name = name;
      this._items = [];
      this._id = crypto.randomUUID();
    }

    set items(item) {
      this._items.push(item);
    }

    applyData(json) {
      Object.assign(this, json);
    }

    [Symbol.iterator]() {
      return this._items[Symbol.iterator]();
    }
  }

  const formatter = (date) => {
    return date.toISOString().split("T")[0];
  };

  const fancyDate = (date) => {
    const monthsName = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const newDate = date.split("-");
    let day = newDate[2];
    if (day[0] === "0") {
      day = day[1];
    }
    let month = monthsName[newDate[1] - 1];
    let year = newDate[0];
    return day + " " + month + " " + year;
  };

  const todayDate = () => {
    return formatter(new Date());
  };

  class ProjectItem {
    constructor(
      name = "",
      description = "",
      priority = "0",
      dueDate = todayDate(),
      status = 0,
    ) {
      this.name = name;
      this.description = description;
      this.priority = priority === "" ? "0" : priority;
      this.dueDate = dueDate.length === 10 ? dueDate : todayDate();
      this.status = status;
      this._id = crypto.randomUUID();
    }

    applyData(json) {
      Object.assign(this, json);
    }
  }

  return { ProjectCollection, Project, ProjectItem, todayDate, fancyDate };
})();

// parses projectStorage from JSON (the one from localStorage) to a functional object for further use
const parseFromJSON = (json) => {
  const parsedJSON = JSON.parse(json);
  const testCollection = new logic.ProjectCollection();
  testCollection.applyData(parsedJSON);
  for (const item of testCollection._items) {
    let testProject = new logic.Project();
    testProject.applyData(item);
    let itemIndex = testCollection._items.indexOf(item);
    testCollection._items.splice(itemIndex, 1, testProject);
    for (const task of testProject._items) {
      let testTask = new logic.ProjectItem();
      testTask.applyData(task);
      let taskIndex = testProject._items.indexOf(task);
      testProject._items.splice(taskIndex, 1, testTask);
    }
  }
  return testCollection;
};
let projectStorage = new logic.ProjectCollection();
/*
projectStorageCheck checks whether there is projectStorage key in the localStorage
if there is, then projectStorage is assigned to the retrieved JSON from localStorage
otherwise, projectStorageInit() runs, setting up a basic example project
*/
const projectStorageCheck = () => {
  if (localStorage.getItem("projectStorage")) {
    const retrievedProjectStorage = localStorage.getItem("projectStorage");
    projectStorage = parseFromJSON(retrievedProjectStorage);
    // console.log(projectStorage)
  } else {
    projectStorageInit();
  }
};
const projectStorageInit = () => {
  const testProject = new logic.Project("Cleaning the house");
  testProject.items = new logic.ProjectItem(
    "Wash the dishes",
    "Also, need to buy some gel for dishes",
    "3",
  );

  testProject.items = new logic.ProjectItem("Buy some towels");
  testProject.items = new logic.ProjectItem(
    "Move all my stuff to another table",
    "Do it before the 9 pm, otherwise I won't have much time for this",
  );
  projectStorage.items = testProject;

  localStorage.setItem("projectStorage", JSON.stringify(projectStorage));
};

const projectStorageSave = () => {
  localStorage.setItem("projectStorage", JSON.stringify(projectStorage));
};
function findProject(projectId) {
  for (const project of projectStorage) {
    if (project._id === projectId) {
      return project;
    }
  }
}

// this function makes sure that projectStorage filled with up-to-date data
projectStorageCheck();

export {
  logic,
  projectStorage,
  findProject,
  projectStorageCheck,
  projectStorageSave,
};

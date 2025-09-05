const logic = (function () {
    const remover = {
        removeItem(item) {
            const removeItem = this.items.indexOf(item);
            if (!(removeItem === -1)) {
                this.items.splice(removeItem, 1)
            }
        }
    }

    const changeName = {
        changeName(item) {
            this.name = name;
        }
    }

    class ProjectCollection {
        constructor() {
            this._items = []
        };

        set items(item) {
            this._items.push(item)
        }

        [Symbol.iterator]() {
            return this._items[Symbol.iterator]();
        };
    }

    Object.assign(ProjectCollection.prototype, remover);

    class Project {
        constructor(name) {
            this.name = name;
            this._items = [];
        };

        set items(item) {
            this._items.push(item)
        }

        [Symbol.iterator]() {
            return this._items[Symbol.iterator]();
        };
    }

    // Object.assign(Project.prototype, adder);
    Object.assign(Project.prototype, remover);
    Object.assign(Project.prototype, changeName);

    class ProjectItem {
        constructor(name, description = '', priority = 0, dueDate = new Date().getDate(), status = 0) {
            this.name = name;
            this.description = description;
            this.priority = priority;
            this.dueDate = dueDate;
            this.status = status;
        };

        set changeDescription(text) {
            this.description = text;
        };

        set changePriority(num) {
            this.priority = num;
        };

        set changeDueDate(date) {
            this.dueDate = date;
        };

        set changeStatus(num) {
            this.status = num;
        }

    }

    Object.assign(ProjectItem.prototype, changeName);

    return {ProjectCollection, Project, ProjectItem}
})();

const projectStorage = new logic.ProjectCollection();
const testProject = new logic.Project('Very Cool Project');
testProject.items = new logic.ProjectItem('Cook bolognese for lunch', 'I need to buy some macaroni');
testProject.items = new logic.ProjectItem('Play some Armored Core');
projectStorage.items = testProject;


export { logic, projectStorage };
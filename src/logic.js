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
            this._items = [];
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
            this._id = crypto.randomUUID();
        };

        set items(item) {
            this._items.push(item)
        }

        [Symbol.iterator]() {
            return this._items[Symbol.iterator]();
        };
    }

    Object.assign(Project.prototype, remover);
    Object.assign(Project.prototype, changeName);

    const formatter = (date) =>  {
        return date.toISOString().split('T')[0]
    }

    const todayDate = () => {
        return formatter(new Date())
    }

    class ProjectItem {
        constructor(name, description = '', priority = '0', dueDate = todayDate(), status = 0) {
            this.name = name;
            this.description = description;
            this.priority = priority;
            this.dueDate = dueDate;
            this.status = status;
            this._id = crypto.randomUUID();
        };
    }

    Object.assign(ProjectItem.prototype, changeName);

    return {ProjectCollection, Project, ProjectItem, todayDate}
})();

const projectStorage = new logic.ProjectCollection();
const testProject = new logic.Project('Very Cool Project');
testProject.items = new logic.ProjectItem(
    'Cook bolognese for lunch',
    'I need to buy some macaroni',
    '3',
    );
testProject.items = new logic.ProjectItem('Play some Armored Core');
const anotherTestProject = new logic.Project('Another Good Project');
anotherTestProject.items = new logic.ProjectItem('Speedrun Dark Souls 3');
projectStorage.items = testProject;
projectStorage.items = anotherTestProject;


export { logic, projectStorage };
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

    // Object.assign(Project.prototype, adder);
    Object.assign(Project.prototype, remover);
    Object.assign(Project.prototype, changeName);

    class ProjectItem {
        constructor(name, description = '', priority = '0', dueDate = this.formatter(new Date()), status = 0) {
            this.name = name;
            this.description = description;
            this.priority = priority;
            this.dueDate = dueDate;
            this.status = status;
            this._id = crypto.randomUUID();
        };

        // formatter = new Intl.DateTimeFormat('en-US', {
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit',
        //
        // })

        // format to ISO, so the value could be used in date input
        formatter (date) {
            return date.toISOString().split('T')[0]
        }
            // const year = date.getFullYear()
            // const month = date.getMonth();
            // const day = date.getDay();
            // const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            // const day = date.getDate();
    }

    Object.assign(ProjectItem.prototype, changeName);

    return {ProjectCollection, Project, ProjectItem}
})();

const projectStorage = new logic.ProjectCollection();
const testProject = new logic.Project('Very Cool Project');
testProject.items = new logic.ProjectItem('Cook bolognese for lunch', 'I need to buy some macaroni');
testProject.items = new logic.ProjectItem('Play some Armored Core');
const anotherTestProject = new logic.Project('Another Good Project');
anotherTestProject.items = new logic.ProjectItem('Beat the shit out of Dark Souls boss');
projectStorage.items = testProject;
projectStorage.items = anotherTestProject;


export { logic, projectStorage };
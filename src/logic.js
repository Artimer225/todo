const logic = (function () {
    const delProject = {
        removeItem(id) {
            const project = findProject(id)
            console.log(project)
            const removeItem = this._items.indexOf(project);
            if (!(removeItem === -1)) {
                this._items.splice(removeItem, 1)
            }
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

    Object.assign(ProjectCollection.prototype, delProject);

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

    const formatter = (date) =>  {
        return date.toISOString().split('T')[0]
    }

    const fancyDate = (date) => {
        const monthsName = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        const newDate = date.split('-');
        let day = newDate[2]
        if (day[0] === '0') {
            day = day[1]
        }
        let month = monthsName[newDate[1]-1];
        let year = newDate[0]
        return day + ' ' + month + ' ' + year
    }

    const todayDate = () => {
        return formatter(new Date())
    }

    class ProjectItem {
        constructor(name, description = '', priority = '0', dueDate = todayDate(), status = 0) {
            this.name = name;
            this.description = description;
            this.priority = priority === '' ? '0' : priority;
            this.dueDate = typeof(dueDate) === 'object' ? dueDate : todayDate();
            this.status = status;
            this._id = crypto.randomUUID();
        };
    }

    return {ProjectCollection, Project, ProjectItem, todayDate, fancyDate}
})();

const projectStorage = new logic.ProjectCollection();
const testProject = new logic.Project('Very Cool Project');
testProject.items = new logic.ProjectItem(
    'Cook bolognese for lunch',
    'I need to buy some macaroni',
    '3',
    );

testProject.items = new logic.ProjectItem('Play some Armored Core');
testProject.items = new logic.ProjectItem('Damn', 'Boi', '', '')
const anotherTestProject = new logic.Project('Another Good Project');
anotherTestProject.items = new logic.ProjectItem('Speedrun Dark Souls 3');
projectStorage.items = testProject;
projectStorage.items = anotherTestProject;

function findProject(projectId) {
     for (const project of projectStorage) {
         if (project._id === projectId) {
             return project
         }
     }
}


export { logic, projectStorage, findProject };
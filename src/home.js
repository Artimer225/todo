import {projectStorage} from './logic.js'
const home= (function () {
    const content = document.querySelector('#content');

    class ProjectItemEdit {
        constructor() {
            this.projects = document.querySelector('.projects')


            this.projects.addEventListener('click', e => {
                if (e.target.matches('.itemContainer')) {

                }
            })
        }

    }

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
                const itemName = document.createElement('p');
                itemName.classList.add('itemName');

                // const itemPrior = document.createElement('p');
                // const itemDate = document.createElement('p');
                // const itemStatus = document.createElement('p');

                itemName.innerText = item.name;

                // itemPrior.innerText = item.priority;
                // itemDate.innerText = item.dueDate;
                // itemStatus.innerText = item.status;

                projectItem.appendChild(checkboxItem)
                itemContainer.appendChild(itemName);
                if (item.description) {
                    const itemDesc = document.createElement('p');
                    itemDesc.innerText = item.description;
                    itemDesc.classList.add('itemDesc');
                    itemContainer.appendChild(itemDesc);
                }

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
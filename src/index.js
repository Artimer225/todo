import './styles.css';
import { project } from './project.js';
import { home } from './home.js';

class SectionManager {
    constructor() {
        const homePage = document.querySelector('#home');
        const content = document.querySelector('#content');
        const editDialog = document.querySelector('#editDialog');

    homePage.addEventListener('click', e => {
            project.clearPage()
            home.initPage()
        });
    }
}

const sectionManagerInstance = new SectionManager();

home.initPage()

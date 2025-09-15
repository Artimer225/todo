import './styles.css';
import { project } from './project.js';
import { home } from './home.js';

class SectionManager {
    constructor() {
        const homePage = document.querySelector('#home');
        const content = document.querySelector('#content');
        const editDialog = document.querySelector('#editDialog');

    // const clearPage = () => {
    //     while (content.hasChildNodes()) {
    //         content.removeChild(content.lastChild);
    //     }
    //     while (editDialog.hasChildNodes()) {
    //         editDialog.removeChild(editDialog.lastChild)
    //     }
    // }

    homePage.addEventListener('click', e => {
            project.clearPage()
            home.createLayout()
        });
    }
}

const sectionManagerInstance = new SectionManager();

home.createLayout()
// project.createLayout()
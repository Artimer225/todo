import "./styles.css";
import { project } from "./project.js";
import { home } from "./home.js";

const homePage = document.querySelector("#home");
homePage.addEventListener("click", (e) => {
    project.clearPage();
    home.initPage();
  });

home.initPage();

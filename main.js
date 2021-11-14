import { debounce } from "./debounce.js";
import { createVidReq } from "./createVidReq.js";
import { checkValidity } from "./checkValidity.js";
import API from "./api.js";
// const listOfVidElm = document.getElementById("listOfRequests");
const SUBER_USER_ID = "19900411";
export const state = {
  sortByValue: "newFirst", // to send when search in search box
  searchValue: "", // to became global with sortByValue
  filterBy: "all",
  userId: "",
  isSuperUser: false,
};


// Submit a video request. (API: POST -> `/video-request`)
document.addEventListener("DOMContentLoaded", function () {
  const formVidReqElm = document.getElementById("formVideoRequest");
  // start for signup form
  const formLoginElm = document.querySelector(".form-login");
  const appContentElm = document.querySelector(".app-content");

  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get("id");
    // console.log(userId);
    if (state.userId === SUBER_USER_ID) {
      state.isSuperUser = true;
      document.querySelector(".normal-user-content").classList.add("d-none");
    }
    formLoginElm.classList.add("d-none");
    appContentElm.classList.remove("d-none");
  }

  // End for signup form
  formVidReqElm.addEventListener("submit", (e) => {
    e.preventDefault();
    /* Data not send when using new FormData() , because FormData()
                بتتعامل مع ال form 
                على انها Multi part
                كأنى بعمل ==> upload to file
                الحل؟
                some changes in server side
                to make type of data sent is multi part
                what changes?
                1- install multer by (npm install multer)
                2- using multer in index.js file
      */
    const formData = new FormData(formVidReqElm);
    formData.append("author_id", state.userId); // add id to form
    /*
     there two ways to validate form
     first: By HTML5 , i made it in html and canceled it by write ==> novalidate in form 
     second : manual valdiation
   */
    const isValid = checkValidity(formData);
    if (!isValid) return;

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((bolb) => bolb.json())
      .then((data) => {
        // console.log(data);
        createVidReq(data, state, true);
        // listOfVidElm.prepend(vidReqContainerElm);
      });
  });

  API.loadAllVidReqs();

  // Sorting options `new first` the default one, and `top voted first`
  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  // imortant notes
  /*
       if using arrow function in addEventListener , this keyword which 
       refers to parent so console.log(this.querySelector("input"))
       which print first element input in Dom ==> 
       <input class="form-control" name="author_name" placeholder="Write your name here">
       so you should not use arrow function in this case
    */
  sortByElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      state.sortByValue = this.querySelector("input").value;
      // console.log(state.sortByValue);
      API.loadAllVidReqs(state.sortByValue, state.searchValue, state.filterBy);
      this.classList.add("active");
      if (state.sortByValue == "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }
    });
  });

  // for filter by All , new ,planned and done
  const filterByElms = document.querySelectorAll("[id^=filter_by_]");

  filterByElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      state.filterBy = e.target.getAttribute("id").split("_")[2];
      API.loadAllVidReqs(state.sortByValue, state.searchValue, state.filterBy);
      filterByElms.forEach((option) => option.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Search box to search for video requests
  const searchBoxElm = document.getElementById("search_box");
  searchBoxElm.addEventListener(
    "input",
    debounce((e) => {
      state.searchValue = e.target.value;
      API.loadAllVidReqs(state.sortByValue, state.searchValue, state.filterBy);
    }, 500)
  );
});


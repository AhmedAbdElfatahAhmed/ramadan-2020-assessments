const listOfVidElm = document.getElementById("listOfRequests");
let sortByValue; // to send when search in search box
let searchValue; // to became global with sortByValue
let userId = "";
// Submit a video request. (API: POST -> `/video-request`)
document.addEventListener("DOMContentLoaded", function () {
  const formVidReqElm = document.getElementById("formVideoRequest");
  // start for signup form
  const formLoginElm = document.querySelector(".form-login");
  const appContentElm = document.querySelector(".app-content");

  if (window.location.search) {
    userId = new URLSearchParams(window.location.search).get("id");
    console.log(userId);
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
    formData.append("author_id", userId); // add id to form
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
        createVidReq(data, true);
        // listOfVidElm.prepend(vidReqContainerElm);
      });
  });

  // Show list of requests below the form. (API: GET -> `/video-request`)
  function loadAllVidReqs(sortBy = "newFirst", searchValue = "") {
    fetch(
      `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchValue}`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        listOfVidElm.innerHTML = "";
        data.forEach((vidInfo) => {
          createVidReq(vidInfo);
        });
      });
  }
  loadAllVidReqs();

  /* solve problem when search , every letter write in search box send request 
   this is not the best practies 
   you should send one request after write all letters(word)
   How ? used debounce function by me 
   note : there is library contain debounce called lodash
   */
  function debounce(fn, time) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn.apply(this, args);
      }, time);
    };
  }
  

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
      sortByValue = this.querySelector("input").value;
      console.log(sortByValue)
      loadAllVidReqs(sortByValue, searchValue);
      this.classList.add("active");
      if (sortByValue == "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }
    });
  });
  // Search box to search for video requests
  const searchBoxElm = document.getElementById("search_box");
  searchBoxElm.addEventListener(
    "input",
    debounce((e) => {
      searchValue = e.target.value;
      loadAllVidReqs(sortByValue, searchValue);
    }, 500)
  );
});

function createVidReq(vidInfo, isPrepend = false) {
  const vidReqContainerElm = document.createElement("div");
  const vidReqTemplate = `
<div class="card mb-3">
<div class="card-body d-flex justify-content-between flex-row">
  <div class="d-flex flex-column">
    <h3>${vidInfo.topic_title}</h3>
    <p class="text-muted mb-2">${vidInfo.topic_details}</p>
    <p class="mb-0 text-muted">
    ${
      vidInfo.expected_result &&
      ` <strong>Expected results:</strong>${vidInfo.expected_result}`
    }
    </p>
  </div>
  <div class="d-flex flex-column text-center">
    <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
    <h3 id="score_vote_${vidInfo._id}">${
    vidInfo.votes.ups.length - vidInfo.votes.downs.length
  }</h3>
    <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
  </div>
</div>
<div class="card-footer d-flex flex-row justify-content-between">
  <div>
    <span class="text-info">${vidInfo.status}</span>
    &bullet; added by <strong>${vidInfo.author_name}</strong> on
    <strong>${new Date(vidInfo.submit_date).toLocaleString()}</strong>
  </div>
  <div
    class="d-flex justify-content-center flex-column 408ml-auto mr-2"
  >
    <div class="badge badge-success">${vidInfo.target_level}</div>
  </div>
</div>
</div>
`;
  vidReqContainerElm.innerHTML = vidReqTemplate;
  if (isPrepend) {
    listOfVidElm.prepend(vidReqContainerElm);
  } else {
    listOfVidElm.appendChild(vidReqContainerElm);
  }
  
  // calling function for indector of Votes
  applyVoteStyle(vidInfo._id,vidInfo.votes)

  // after get data from database declar next element
  const votesElms = document.querySelectorAll(
    `[id^=votes_][id$=_${vidInfo._id}]`
  );
  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);
  // Vote up and down on each request. (API: PUT -> `/video-request/vote`)
  votesElms.forEach(elm=>
    {
      elm.addEventListener("click",function(e)
      {
        e.preventDefault();
        // console.log(e.target.getAttribute('id'))
        const [, vote_type, id]=e.target.getAttribute('id').split("_");//using Destructuring in ES6
        fetch("http://localhost:7777/video-request/vote", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, vote_type, user_id:userId }),
        })
          .then((response) => response.json())
          .then((data) => {
            /* go to video-requests.data.js file 
                    to add object to fix bug occur when clicked on up and down button*/
            scoreVoteElm.innerText = data.ups.length - data.downs.length;

            // calling function for indector of Votes
            applyVoteStyle(id,data,vote_type)
  

          });
      });
    });

  
// console.log(voteUpsElm)
// console.log(voteDownsElm)
// console.log("ups ="+vidInfo.votes.ups)
// console.log("downs ="+vidInfo.votes.downs)

  // Vote up and down on each request. (API: PUT -> `/video-request/vote`)
  // clicked on voteUpsElm
  // voteUpsElm.addEventListener("click", () => {
  //   fetch("http://localhost:7777/video-request/vote", {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ id: vidInfo._id, vote_type: "ups" }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // console.log(data);
  //       /* go to video-requests.data.js file 
  //               to add object to fix bug occur when clicked on up and down button*/
  //       scoreVoteElm.innerText = data.ups - data.downs;
  //     });
  // });
  // clicked on voteDownsElm
  // voteDownsElm.addEventListener("click", () => {
  //   fetch("http://localhost:7777/video-request/vote", {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ id: vidInfo._id, vote_type: "downs" }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // console.log(data);
  //       /* go to video-requests.data.js file 
  //               to add object to fix bug occur when clicked on up and down button*/
  //       scoreVoteElm.innerText = data.ups - data.downs;
  //     });
  // });
}

// Implementing form validation
function checkValidity(formData) {
  // const name = formData.get("author_name");
  // const email = formData.get("author_email");
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");
  // const emailPattern =
  //   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // if (!name) {
  //   document.querySelector("[name=author_name]").classList.add("is-invalid");
  // }
  // if (!email || !emailPattern.test(email)) {
  //   document.querySelector("[name=author_email]").classList.add("is-invalid");
  // }
  if (!topic || topic.length > 30) {
    document.querySelector("[name=topic_title]").classList.add("is-invalid");
  }
  if (!topicDetails) {
    document.querySelector("[name=topic_details]").classList.add("is-invalid");
  }
  const allInvalidElms = document
    .getElementById("formVideoRequest")
    .querySelectorAll(".is-invalid");
  if (allInvalidElms.length) {
    allInvalidElms.forEach((elm) => {
      elm.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    });
    return false;
  }

  return true;
}



// function for indector of Votes
function applyVoteStyle(video_id,votes_list,vote_type)
{
  if(!vote_type)
  {
  if(votes_list.ups.includes(userId))
  {
    vote_type="ups"
  }
  else if(votes_list.downs.includes(userId))
  {
    vote_type="downs"
  }
  else{
    return
  }
  }

  const voteUpsElm = document.getElementById(`votes_ups_${video_id}`);
  const voteDownsElm = document.getElementById(`votes_downs_${video_id}`);

  const voteDirElm = vote_type==="ups" ? voteUpsElm : voteDownsElm ;
  const otherDirElm = vote_type==="ups" ? voteDownsElm : voteUpsElm ;

if(votes_list[vote_type].includes(userId))
  {
    voteDirElm.style.opacity=1;
    otherDirElm.style.opacity=0.5;
  }
  else{
    otherDirElm.style.opacity=1;
  }
}


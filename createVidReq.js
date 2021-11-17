const listOfVidElm = document.getElementById("listOfRequests");
import api from "./api.js";
import { applyVoteStyle } from "./applyVoteStyle.js";
import dataService from "./dataService.js";

function formatDate(date) {
  return new Date(date).toLocaleString();
}
function getAdminDom(id, status) {
  return `<div class="card-header d-flex justify-content-between">
            <select id="admin_change_status_${id}">
              <option value="new">new</option>
              <option value="planned">planned</option>
              <option value="done">done</option>
            </select>
            <div class="input-group ml-2 mr-5 ${
              status !== "done" ? "d-none" : ""
            }" id="admin_video_res_container_${id}">
              <input type="text" class="form-control" placeholder="paste here youtube video" 
              id="admin_video_res_${id}">
              <div class='input-group-append'>
                <button class="btn btn-outline-secondary"
                id="admin_save_video_res_${id}"
                 type="button">Save</button>
              </div>
            </div>
            <button id="admin_delete_video_req_${id}" class='btn btn-danger'>delete</button>
          </div>`;
}

function bindAdminActions(id, state, status, videoRef, title) {
  const adminChangeStatusElm = document.getElementById(
    `admin_change_status_${id}`
  );

  const adminVideoResContainer = document.getElementById(
    `admin_video_res_container_${id}`
  );
  const adminVideoResElm = document.getElementById(`admin_video_res_${id}`);
  const adminSaveVideoResElm = document.getElementById(
    `admin_save_video_res_${id}`
  );
  const adminDeleteVideoReqElm = document.getElementById(
    `admin_delete_video_req_${id}`
  );

  if (state.isSuperUser) {
    adminChangeStatusElm.value = status;
    adminVideoResElm.value = videoRef.link;

    adminChangeStatusElm.addEventListener("change", (e) => {
      // console.log(e.target.value);
      if (e.target.value == "done") {
        adminVideoResContainer.classList.remove("d-none");
      } else {
        dataService.updateVideoStatus(id, e.target.value);
      }
    });

    adminSaveVideoResElm.addEventListener("click", (e) => {
      e.preventDefault();
      if (!adminVideoResElm.value) {
      }
      adminVideoResElm.classList.add("is-invalid");
      adminVideoResElm.addEventListener("input", () => {
        adminVideoResElm.classList.remove("is-invalid");
      });
      dataService.updateVideoStatus(id, "done", adminVideoResElm.value);
    });
    adminDeleteVideoReqElm.addEventListener("click", (e) => {
      e.preventDefault();
      const isSure = confirm(`Are you sure you want to delete ${title}`);
      if (!isSure) return;

      dataService.deletVideoReq(vidInfo).then((_) => {
        // console.log(data);
        window.location.reload();
      });
    });
  }
}

function bindVotesActions(id, state, status) {
  // after get data from database declar next element
  const votesElms = document.querySelectorAll(`[id^=votes_][id$=_${id}]`);
  const scoreVoteElm = document.getElementById(`score_vote_${id}`);
  // Vote up and down on each request. (API: PUT -> `/video-request/vote`)
  votesElms.forEach((elm) => {
    if (state.isSuperUser || status == "done") return;
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      // console.log(e.target.getAttribute('id'))
      const [, vote_type, id] = e.target.getAttribute("id").split("_"); //using Destructuring in ES6
      dataService.updateVotes(id, vote_type, state).then((data) => {
        /* go to video-requests.data.js file 
                       to add object to fix bug occur when clicked on up and down button*/
        scoreVoteElm.innerText = data.ups.length - data.downs.length;

        // calling function for indector of Votes
        applyVoteStyle(id, data, status === "done", state, vote_type);
      });
    });
  });
}
export function createVidReq(vidInfo, state, isPrepend = false) {
  const vidReqContainerElm = document.createElement("div");
  // To do not repeat , using Destructuring to not repeat vidInfo
  // and change name inside object by ====> _id:id
  const {
    _id: id,
    status,
    topic_title: title,
    topic_details: details,
    expected_result: expected,
    video_ref: videoRef,
    votes,
    author_name: author,
    submit_date: submitDate,
    target_level: level,
  } = vidInfo;

  const statusClass =
    status === "done"
      ? "text-success"
      : status === "planned"
      ? "text-primary"
      : "";
  const voteScore = votes.ups.length - votes.downs.length;
  const vidReqTemplate = `
  <div class="card mb-3">
  ${state.isSuperUser ? getAdminDom(id, status) : ""}
  <div class="card-body d-flex justify-content-between flex-row">
    <div class="d-flex flex-column">
      <h3>${title}</h3>
      <p class="text-muted mb-2">${details}</p>
      <p class="mb-0 text-muted">
      ${expected && ` <strong>Expected results:</strong>${expected}`}
      </p>
    </div>
    <div class="ml-auto mr-3">
    <iframe width="240" height="135" 
    src="${videoRef.link}"  
    frameborder="0" allowfullscreen></iframe>
    </div>
    <div class="d-flex flex-column text-center">
      <a id="votes_ups_${id}" class="btn btn-link">🔺</a>
      <h3 id="score_vote_${id}">${voteScore}</h3>
      <a id="votes_downs_${id}" class="btn btn-link">🔻</a>
    </div>
  </div>
  <div class="card-footer d-flex flex-row justify-content-between">
    <div class="${statusClass}">
      <span>
      ${status.toUpperCase()} ${
    status === "done" ? `on ${formatDate(videoRef.date)}` : ""
  }</span>
      &bullet; added by <strong>${author}</strong> on
      <strong>${formatDate(submitDate)}</strong>
    </div>
    <div
      class="d-flex justify-content-center flex-column 408ml-auto mr-2"
    >
      <div class="badge badge-success">${level}</div>
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

  //Start for super admin
  bindAdminActions(id, state, status, videoRef, title);
  //End for super admin

  // calling function for indector of Votes
  applyVoteStyle(id, votes, status === "done", state);

  bindVotesActions(id, state, status);
}







// console.log(voteUpsElm)
// console.log(voteDownsElm)
// console.log("ups ="+votes.ups)
// console.log("downs ="+votes.downs)

// Vote up and down on each request. (API: PUT -> `/video-request/vote`)
// clicked on voteUpsElm
// voteUpsElm.addEventListener("click", () => {
//   fetch("http://localhost:7777/video-request/vote", {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ id: id, vote_type: "ups" }),
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
//     body: JSON.stringify({ id: id, vote_type: "downs" }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       // console.log(data);
//       /* go to video-requests.data.js file
//               to add object to fix bug occur when clicked on up and down button*/
//       scoreVoteElm.innerText = data.ups - data.downs;
//     });
// });

const listOfVidElm = document.getElementById("listOfRequests");
import { applyVoteStyle } from "./applyVoteStyle.js";
import API from "./api.js";

export function createVidReq(vidInfo,state,isPrepend = false) {
    const vidReqContainerElm = document.createElement("div");
   const vidReqTemplate = `
  <div class="card mb-3">
  ${
    state.isSuperUser
      ? `<div class="card-header d-flex justify-content-between">
            <select id="admin_change_status_${vidInfo._id}">
              <option value="new">new</option>
              <option value="planned">planned</option>
              <option value="done">done</option>
            </select>
            <div class="input-group ml-2 mr-5 ${
              vidInfo.status !== "done" ? "d-none" : ""
            }" id="admin_video_res_container_${vidInfo._id}">
              <input type="text" class="form-control" placeholder="paste here youtube video" 
              id="admin_video_res_${vidInfo._id}">
              <div class='input-group-append'>
                <button class="btn btn-outline-secondary"
                id="admin_save_video_res_${vidInfo._id}"
                 type="button">Save</button>
              </div>
            </div>
            <button id="admin_delete_video_req_${
              vidInfo._id
            }" class='btn btn-danger'>delete</button>
          </div>`
      : ""
  }
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
    <div class="ml-auto mr-3">
    <iframe width="240" height="135" 
    src="${vidInfo.video_ref.link}"  
    frameborder="0" allowfullscreen></iframe>
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
    <div class="${
      vidInfo.status === "done"
        ? "text-success"
        : vidInfo.status === "planned"
        ? "text-primary"
        : ""
    }">
      <span>${vidInfo.status.toUpperCase()} ${
      vidInfo.status === "done"
        ? `on ${new Date(vidInfo.video_ref.date).toLocaleString()}`
        : ""
    }</span>
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
  
    //Start for super admin
    const adminChangeStatusElm = document.getElementById(
      `admin_change_status_${vidInfo._id}`
    );
  
    const adminVideoResContainer = document.getElementById(
      `admin_video_res_container_${vidInfo._id}`
    );
    const adminVideoResElm = document.getElementById(
      `admin_video_res_${vidInfo._id}`
    );
    const adminSaveVideoResElm = document.getElementById(
      `admin_save_video_res_${vidInfo._id}`
    );
    const adminDeleteVideoReqElm = document.getElementById(
      `admin_delete_video_req_${vidInfo._id}`
    );
  
    if (state.isSuperUser) {
      adminChangeStatusElm.value = vidInfo.status;
      adminVideoResElm.value = vidInfo.video_ref.link;
  
      adminChangeStatusElm.addEventListener("change", (e) => {
        // console.log(e.target.value);
        if (e.target.value == "done") {
          adminVideoResContainer.classList.remove("d-none");
        } else {
          API.updateVideoStatus(vidInfo._id, e.target.value);
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
        API.updateVideoStatus(vidInfo._id, "done", adminVideoResElm.value);
      });
      adminDeleteVideoReqElm.addEventListener("click", (e) => {
        e.preventDefault();
        const isSure = confirm(
          `Are you sure you want to delete ${vidInfo.topic_title}`
        );
        if (!isSure) return;
        fetch("http://localhost:7777/video-request", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: vidInfo._id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log(data);
            window.location.reload();
          });
      });
    }
   
    //End for super admin
  
    // calling function for indector of Votes
    applyVoteStyle(vidInfo._id, vidInfo.votes,vidInfo.status === "done",state);
  
    // after get data from database declar next element
    const votesElms = document.querySelectorAll(
      `[id^=votes_][id$=_${vidInfo._id}]`
    );
    const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);
    // Vote up and down on each request. (API: PUT -> `/video-request/vote`)
    votesElms.forEach((elm) => {
      if (state.isSuperUser || vidInfo.status == "done") return;
      elm.addEventListener("click", function (e) {
        e.preventDefault();
        // console.log(e.target.getAttribute('id'))
        const [, vote_type, id] = e.target.getAttribute("id").split("_"); //using Destructuring in ES6
        fetch("http://localhost:7777/video-request/vote", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, vote_type, user_id: state.userId }),
        })
          .then((response) => response.json())
          .then((data) => {
            /* go to video-requests.data.js file 
                      to add object to fix bug occur when clicked on up and down button*/
            scoreVoteElm.innerText = data.ups.length - data.downs.length;
  
            // calling function for indector of Votes
            applyVoteStyle(id, data, vidInfo.status === "done",state, vote_type);
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


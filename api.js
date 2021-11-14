import { createVidReq } from "./createVidReq.js";
import { state } from "./main.js";

export default {
  updateVideoStatus: (videoId, status, videoResValue = "") => {
    fetch("http://localhost:7777/video-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: videoId,
        status,
        resVideo: videoResValue,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        window.location.reload();
      });
  },
  // function loadAllVidReqs To Show list of requests below the form. (API: GET -> `/video-request`)
  loadAllVidReqs: (
    sortBy = "newFirst",
    searchValue = "",
    filterBy = "all",
    localState = state
  ) => {
    const listOfVidElm = document.getElementById("listOfRequests");
    fetch(
      `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchValue}&filterBy=${filterBy}`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        listOfVidElm.innerHTML = "";
        data.forEach((vidInfo) => {
          createVidReq(vidInfo, localState);
        });
      });
  },
};

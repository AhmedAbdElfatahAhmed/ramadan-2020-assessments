import { createVidReq } from "./createVidReq.js";
import { state } from "./main.js";
import API from "./api.js";
export default {
  addVideoReq: (formData) => {
    return API.videoReq.post(formData);
  },
  updateVideoStatus: (videoId, status, resVideo = "") => {
    return API.videoReq
      .update(videoId, status, resVideo)
      .then((_) => {
        // console.log(data);
        window.location.reload();
      });
  },
  deletVideoReq: (id) => {
    return API.videoReq.delete(id);
  },
  // function loadAllVidReqs To Show list of requests below the form. (API: GET -> `/video-request`)
  loadAllVidReqs: (
    sortBy = "newFirst",
    searchValue = "",
    filterBy = "all",
    localState = state
  ) => {
    const listOfVidElm = document.getElementById("listOfRequests");

    return API.videoReq.get(sortBy, searchValue, filterBy).then((data) => {
      // console.log(data);
      listOfVidElm.innerHTML = "";
      data.forEach((vidInfo) => {
        createVidReq(vidInfo, localState);
      });
    });
  },
  updateVotes: (id, vote_type, state) => {
    return API.votes.update(id, vote_type, state);
  },
};

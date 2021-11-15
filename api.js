const apiUrl = "http://localhost:7777";
export default {
  videoReq: {
    get: (sortBy, searchValue, filterBy) => {
      return fetch(
        `${apiUrl}/video-request?sortBy=${sortBy}&searchTerm=${searchValue}&filterBy=${filterBy}`
      ).then((response) => response.json());
    },
    post: (formData) => {
      return fetch(`${apiUrl}/video-request`, {
        method: "POST",
        body: formData,
      }).then((bolb) => bolb.json());
    },
    update: (videoId, status, videoResValue = "") => {
      return fetch(`${apiUrl}/video-request`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: videoId,
          status,
          resVideo: videoResValue,
        }),
      }).then((response) => response.json());
    },
    delete: (vidInfo) => {
      return fetch(`${apiUrl}/video-request`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: vidInfo._id,
        }),
      }).then((response) => response.json());
    },
  },
  votes: {
    update: (id, vote_type, state) => {
      return fetch(`${apiUrl}/video-request/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, vote_type, user_id: state.userId }),
      }).then((response) => response.json());
    },
  },
};

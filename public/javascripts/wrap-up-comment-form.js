const initCommentForm = (() => {
  const form = document.getElementById("comment-form");
  const openBtn = document.getElementById("open-form");
  const closeBtn = document.getElementById("close-form");
  const commentSection = document.getElementById("comments");

  openBtn.onclick = toggleForm;
  closeBtn.onclick = toggleForm;

  form.onsubmit = (e) => {
    e.preventDefault();
    let data = {
      name: form.elements["name"].value,
      text: form.elements["text"].value,
      timestamp: Date.now(),
    };

    postData(document.URL, data)
      .then((response) => {
        if (response.ok) {
          appendComment(data);
        }
      });
  }

  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response;
  }

  function appendComment(data) {
    const commentSection = document.getElementById("comments");
    const commentForm = document.getElementById("comment-form");

    const container = document.createElement("div");
    container.classList.add("comment-container");

    const header = document.createElement("div");
    header.classList.add("comment-header");

    const name = document.createElement("div");
    name.classList.add("comment-name");
    name.innerHTML = data.name;

    const date = document.createElement("div");
    date.classList.add("comment-date");
    date.innerHTML = data.date;

    const text = document.createElement("div");
    text.classList.add("comment-text");
    text.innerHTML = data.text;

    header.append(name, date);
    container.append(header, text);

    commentSection.insertBefore(container, commentForm.nextSibling);
  }

  function toggleForm() {
    form.classList.toggle("hide");
  }

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-comment")) {
        deleteComment(e.target);
    }
  });

  function deleteComment(target) {
    const comment_id = target.parentElement.id;
    postData(document.URL + "/comment/" + comment_id + "/delete", {});
    commentSection.removeChild(target.parentElement);
  }
})();


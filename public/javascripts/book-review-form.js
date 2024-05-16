const initReview = (() => {
  // initialize tinymce editor, on initialization set content to review
  tinymce.init({
    selector: "textarea#my-expressjs-tinymce-app",
    plugins: "lists link image table code help wordcount",
    promotion: false,
    setup: function (editor) {
      editor.on("init", function (e) {
        const review = document.getElementById("review-hidden").value;
        editor.setContent(review);
      });
    },
  });

  const form = document.querySelector("#book-review-form");
  const messageDiv = document.getElementById("message");

  form.onsubmit = async (e) => {
    e.preventDefault();

    try {
      let data = {
        title: form.elements["title"].value,
        author: form.elements["author"].value,
        review: tinymce.activeEditor.getContent(),
        tags: getTags(),
      };

      const response = await postData(document.URL, data);
      const result = await response.json();
      if (response.ok) {
        displayMessage("success", result);
        clearForm();
      } else {
        displayMessage("error", result);
      }
    } catch (err) {
      console.log(err);
    }
  };

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

  function displayMessage(type, result) {
    form.style.pointerEvents = "none";
    form.style.opacity = 0.5;

    if (type === "success") {
      messageDiv.innerHTML = "";
      let p = document.createElement("p");
      p.innerHTML = "Review successfully saved. ";

      let a = document.createElement("a");
      a.href = result.url;
      a.innerHTML = "View review.";
      p.append(a);

      const button = document.createElement("button");
      button.innerHTML = "x";
      button.onclick = closeMessage;

      messageDiv.append(p, button);
      messageDiv.classList.add("pop-up");
    } else {
      messageDiv.innerHTML = "";
      let ul = document.createElement("ul");
      let p = (document.createElement("p").innerHTML = "Error(s) saving book:");
      for (const error of result) {
        let li = document.createElement("li");
        li.innerHTML = error.msg;
        ul.append(li);
      }

      const button = document.createElement("button");
      button.innerHTML = "x";
      button.onclick = closeMessage;

      messageDiv.append(button, p, ul);

      messageDiv.classList.add("pop-up");
    }
  }

  function getTags() {
    const tags = document.querySelectorAll("li");
    let tagValues = [];
    for (const tag of tags) {
      tagValues.push(tag.innerHTML.split("<")[0]);
    }
    return tagValues;
  }

  function displayErrors(data) {
    errorContainer.style.opacity = 1;

    if (!typeof data.errors === "object") {
      data.errors.forEach((error) => {
        const li = document.createElement("li");
        li.innerHTML = error.msg;
        errorContainer.querySelector("ul").append(li);
      });
    } else {
      const li = document.createElement("li");
      li.innerHTML = "There was an internal error saving your review.";
      errorContainer.querySelector("ul").append(li);
    }
  }

  function hideErrors() {
    errorContainer.style.opacity = 0;
    errorContainer.innerHTML = "";
    errorContainer.appendChild(document.createElement("ul"));
  }

  function displaySuccess(data) {
    // scroll to top of window
    form.style.opacity = 0.8;
    form.style.pointerEvents = "none";
    successContainer.querySelector("a").setAttribute("href", data.url);
    successContainer.classList.toggle("hide");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    form.elements["date_read"].value = "";
    form.elements["title"].value = "";
    form.elements["author"].value = "";
    form.elements["series"].value = "";
    form.elements["series_number"].value = "";
    form.elements["pages"].value = "";
    form.elements["rating"].value = "";
    fileInput.value = "";
  }

  function closeMessage() {
    messageDiv.classList.remove("pop-up");
    messageDiv.innerHTML = "";
    form.style.pointerEvents = "auto";
    form.style.opacity = 1;
  }
})();

const initTags = (() => {
  // Get the tags and input elements from the DOM
  const tags = document.getElementById("tags");
  const input = document.getElementById("input-tag");

  // Add an event listener for keydown on the input element
  input.addEventListener("keydown", function (event) {
    // Check if the key pressed is 'Enter'
    if (event.key === "Enter") {
      // Prevent the default action of the keypress
      // event (submitting the form)
      event.preventDefault();

      // Create a new list item element for the tag
      const tag = document.createElement("li");

      // Get the trimmed value of the input element
      const tagContent = input.value.trim();

      // If the trimmed value is not an empty string
      if (tagContent !== "") {
        // Set the text content of the tag to
        // the trimmed value
        tag.innerText = tagContent;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-button");
        deleteBtn.innerHTML = "X";

        // Add a delete button to the tag
        tag.appendChild(deleteBtn);

        // Append the tag to the tags list
        tags.appendChild(tag);

        // Clear the input element's value
        input.value = "";
      }
    }
  });

  // Add an event listener for click on the tags list
  tags.addEventListener(
    "click",
    function (event) {
      // If the clicked element has the class 'delete-button'
      if (event.target.classList.contains("delete-button")) {
        // Remove the parent element (the tag)
        event.target.parentNode.remove();
      }
    },
    { passive: false }
  );
})();

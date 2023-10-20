// TODO: create a search bar for finding a book

function saveReview() {
  let form = document.querySelector("#book-review-form");
  let tags = document.querySelectorAll("li");
  let content = tinyMCE.activeEditor.getContent();

  const tagsInput = document.querySelector("#tag_input");
  const reviewInput = document.querySelector("#review_body");

  let tagValues = [];

  for (const tag of tags) {
    tagValues.push(tag.innerHTML.split("<")[0]);
  }

  tagsInput.setAttribute("value", tagValues);
  reviewInput.setAttribute("value", content);

  form.submit();
}

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

function loadReview() {
  // need to replace &lt; with < &gt; with >
  // review: defined as variable in pug form
  if (review !== undefined && review !== "") {
    setTimeout(() => {
      tinyMCE.activeEditor.setContent(he.decode(review));
    }, 1000);
  }
}

loadReview();

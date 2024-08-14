const init = (() => {
  // let index = 0;
  let imageData;
  const form = document.getElementById("book-form");
  const submit = document.getElementById("submit-form");
  const fileInput = document.getElementById("file");
  const reader = new FileReader();
  const messageDiv = document.getElementById("message");

  fileInput.addEventListener("change", readFile);
  reader.onload = () => {
    imageData = reader.result;
    submit.disabled = false;
  };

  reader.onerror = () => {
    displayMessage("error", [{ msg: "An error occurred loading the file." }]);
  };

  submit.onclick = submitForm;

  function readFile() {
    submit.disabled = true;
    const file = fileInput.files[0];
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  async function submitForm() {
    // let dates_read = [];
    // let containers = document.querySelectorAll(".input-container");
    // const hiddenInput = document.querySelector("#dates_read");

    // containers.forEach((el) => {
    //   if (el.querySelector("input").value !== "") {
    //     dates_read.push(el.querySelector("input").value);
    //   }
    // });

    // hiddenInput.value = dates_read;

    try {
      let data = {
        date_read: form.elements["date_read"].value,
        title: form.elements["title"].value,
        author: form.elements["author"].value,
        encoded_title: form.elements["title"].value
          .toLowerCase()
          .replace(/[^\w\s-]+/g, "")
          .replace(/\s+/g, "-"),
        encoded_author: form.elements["author"].value
          .toLowerCase()
          .replace(/[^\w\s-]+/g, "")
          .replace(/\s+/g, "-"),
        series: form.elements["series"].value,
        series_number: form.elements["series_number"].value,
        pages: form.elements["pages"].value,
        rating: form.elements["rating"].value,
        image: imageData,
        is_favorite: form.elements["is_favorite"].checked,
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
  }

  function displayMessage(type, result) {
    form.style.pointerEvents = "none";
    form.style.opacity = 0.5;

    if (type === "success") {
      messageDiv.innerHTML = "";
      let p = document.createElement("p");
      p.innerHTML = "Book successfully saved. ";

      let a = document.createElement("a");
      a.href = result.url;
      a.innerHTML = "View book.";
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

  function closeMessage() {
    messageDiv.classList.remove("pop-up");
    messageDiv.innerHTML = "";
    form.style.pointerEvents = "auto";
    form.style.opacity = 1;
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

  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    return response;
  }

  // const addInput = () => {
  //   index++;

  //   const inputContainer = document.querySelector(".input-container");
  //   let container = document.createElement("div");
  //   let input = document.createElement("input");
  //   let label = document.createElement("label");
  //   let deleteButton = document.createElement("button");

  //   label.innerHTML = "Date read";
  //   input.id = "date_read" + index;
  //   input.className = "date_read";
  //   input.setAttribute("type", "date");

  //   deleteButton.classList.add("delete-button");
  //   deleteButton.innerHTML = "X";
  //   deleteButton.onclick = (e) => {
  //     e.target.parentNode.remove();
  //   };

  //   container.className = "input-container";

  //   container.append(label, input, deleteButton);

  //   inputContainer.append(container);
  // };

  // return { addInput };
})();

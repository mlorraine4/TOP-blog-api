// Controller for appending date read inputs.

const init = (() => {
  // let index = 0;
  let imageData;
  const form = document.getElementById("book-form");
  const submit = document.getElementById("submit-form");
  const fileInput = document.getElementById("file");
  const reader = new FileReader();

  fileInput.addEventListener("change", readFile);
  reader.onload = () => {
    imageData = reader.result;
    console.log(imageData);
    submit.disabled = false;
  };

  reader.onerror = () => {
    submit.disabled = true;
    // pop up error msg
  };

  submit.onclick = submitForm;

  function readFile() {
    const file = fileInput.files[0];
    if (file) {
      reader.readAsDataURL(file);
      console.log(file);
    }
  }

  function submitForm() {
    // let dates_read = [];
    // let containers = document.querySelectorAll(".input-container");
    // const hiddenInput = document.querySelector("#dates_read");

    // containers.forEach((el) => {
    //   if (el.querySelector("input").value !== "") {
    //     dates_read.push(el.querySelector("input").value);
    //   }
    // });

    // hiddenInput.value = dates_read;

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
    };

    postData(document.URL, data)
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // function readFile(file) {
  //   return new Promise((resolve, reject) => {
  //     const fileReader = new FileReader();
  //     fileReader.readAsDataURL(file);
  //     fileReader.onload = () => {
  //       resolve(fileReader.result);
  //     };
  //     fileReader.onerror = () => {
  //       reject(`Error occurred reading file: ${file.name}`);
  //     };
  //   });
  // }

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

// function displayMsg(type, msg) {
//   document.querySelector("#message").innerHTML = msg;
//   document.querySelector("#message").classList.remove("no-opacity");

//   if (type === "error") {
//     document.querySelector("#message").classList = "error";
//   } else {
//     document.querySelector("#message").classList = "success";
//   }
// }

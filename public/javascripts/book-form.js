// Controller for appending date read inputs.

const init = (() => {
  let index = 0;

  const addInput = () => {
    index++;

    const inputContainer = document.querySelector(".input-container");
    let container = document.createElement("div");
    let input = document.createElement("input");
    let label = document.createElement("label");
    let deleteButton = document.createElement("button");

    label.innerHTML = "Date read";
    input.id = "date_read" + index;
    input.className = "date_read";
    input.setAttribute("type", "date");

    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = "X";
    deleteButton.onclick = (e) => {
      e.target.parentNode.remove();
    };

    container.className = "input-container";

    container.append(label, input, deleteButton);

    inputContainer.append(container);
  };

  return { addInput };
})();

function submitForm() {
  let dates_read = [];
  let containers = document.querySelectorAll(".input-container");
  const form = document.querySelector("#book-form");
  const hiddenInput = document.querySelector("#dates_read");

  containers.forEach((el) => {
    if (el.querySelector("input").value !== "") {
      dates_read.push(el.querySelector("input").value);
    }
  });

  hiddenInput.value = dates_read;
  form.submit();

  // let data = {
  //   date_read: dates_read,
  //   title: document.querySelector("#title").value,
  //   author: document.querySelector("#author").value,
  //   series: document.querySelector("#series").value,
  //   series_number: document.querySelector("#series_number").value,
  //   book_cover: document.querySelector("#book_cover").value,
  //   pages: document.querySelector("#pages").value,
  //   rating: document.querySelector("#rating").value,
  // };

  // postData("/gardenofpages/new-book", data)
  //   .then((response) => {
  //     console.log(response);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
}

// async function postData(url = "", data = {}) {
//   // Default options are marked with *
//   const response = await fetch(url, {
//     method: "POST", // *GET, POST, PUT, DELETE, etc.
//     mode: "cors", // no-cors, *cors, same-origin
//     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//     credentials: "same-origin", // include, *same-origin, omit
//     headers: {
//       "Content-Type": "application/json",
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     redirect: "follow", // manual, *follow, error
//     referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//     body: JSON.stringify(data), // body data type must match "Content-Type" header
//   });
//   return response;
// }

// function displayMsg(type, msg) {
//   document.querySelector("#message").innerHTML = msg;
//   document.querySelector("#message").classList.remove("no-opacity");

//   if (type === "error") {
//     document.querySelector("#message").classList = "error";
//   } else {
//     document.querySelector("#message").classList = "success";
//   }
// }
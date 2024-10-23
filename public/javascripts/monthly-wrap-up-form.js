const initMonthlyWrapUp = (() => {
  // initialize tinymce editor, on initialization set content to review
  tinymce.init({
    selector: "textarea#my-expressjs-tinymce-app",
    plugins: "lists link image table code help wordcount",
    promotion: false,
    setup: function (editor) {
      editor.on("init", function (e) {
        const summary = document.getElementById("summary").value;
        editor.setContent(summary);
      });
    },
    license_key: "gpl",
  });

  const form = document.getElementById("wrap-up-form");
  const summaryInput = document.getElementById("summary");
  const messageDiv = document.getElementById("message");

  form.onsubmit = async (e) => {
    e.preventDefault();

    try {
      summaryInput.value = tinymce.activeEditor.getContent();
      console.log(summaryInput.value);
      let data = {
        month: form.elements["month"].value,
        year: form.elements["year"].value,
        summary: tinymce.activeEditor.getContent(),
      };

      const response = await postData(document.URL, data);
      const result = await response.json();
      if (response.ok) {
        displayMessage("success", result);
      } else {
        displayMessage("error", result);
      }
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };

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
      for (const error of result.errors) {
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

    function closeMessage() {
      messageDiv.classList.remove("pop-up");
      messageDiv.innerHTML = "";
      form.style.pointerEvents = "auto";
      form.style.opacity = 1;
    }
  }
})();

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

  const form = document.querySelector("#wrap-up-form");
  const summaryInput = document.getElementById("summary");

  form.onsubmit = (e) => {
    e.preventDefault();
    summaryInput.value = tinymce.activeEditor.getContent();
    console.log(summaryInput.value);
    form.submit();
  };
})();

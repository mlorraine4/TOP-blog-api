const init = (() => {
  const dropDown = document.getElementById("myDropdown");
  const dropBtn = document.getElementById("drop-btn");

  dropBtn.onclick = toggleDrop;

  function toggleDrop() {
    dropDown.classList.toggle("show");
  }

  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches("#drop-btn")) {
      if (dropDown.classList.contains("show")) {
        dropDown.classList.toggle("show");
      }
    }
  };
})();

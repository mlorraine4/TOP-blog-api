const initDropDown = (() => {
  const dropDown = document.getElementById("drop-down");
  const dropBtn = document.getElementById("drop-btn");

  dropBtn.onclick = toggleDrop;

  function toggleDrop() {
    dropDown.classList.toggle("hide");
  }

  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches("#drop-btn")) {
      if (!dropDown.classList.contains("hide")) {
        dropDown.classList.toggle("hide");
      }
    }
  };
})();

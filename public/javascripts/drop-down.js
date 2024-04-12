const initLayout = (() => {
  const plusBtn = document.getElementById("dash-btn");
  const dashboard = document.getElementById("dashboard-pop-up");
  const dropDown = document.getElementById("drop-down");
  const dropBtn = document.getElementById("drop-btn");

  dropBtn.onclick = toggleDrop;
  plusBtn.onclick = togglePopUp;

  function toggleDrop() {
    dropDown.classList.toggle("hide");
  }

  function togglePopUp() {
    dashboard.classList.toggle("hide");
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

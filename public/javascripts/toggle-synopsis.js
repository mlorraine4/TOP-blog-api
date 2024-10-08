function toggleSynopsis(e) {
  const synopsis =
    e.target.parentNode.parentNode.querySelector(".synopsis-detail");
  const arrow = e.target.parentNode.parentNode.querySelector(".arrow");
  arrow.classList.toggle("triangle-right");
  arrow.classList.toggle("triangle-bottom");
  if (synopsis.classList.contains("active")) {
    synopsis.classList.toggle("active");
    synopsis.style.height = "0px";
  } else {
    synopsis.classList.toggle("active");
    synopsis.style.height = synopsis.querySelector("p").clientHeight + "px";
  }
}

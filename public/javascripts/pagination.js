const initPagination = (() => {
  const pageNavBar = document.getElementById("pageNavBar");

  function pagination(currentPage, totalPages) {
    const pageNumbers = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    console.log(pageNumbers);

    return pageNumbers;
  }

  function displayNavBar() {
    const pageNumbers = pagination(currentPage, totalPages);

    if (Number(currentPage) != 1) {
      pageNavBar.appendChild(previousLink());
    }

    pageNumbers.forEach((number) => {
      pageNavBar.appendChild(pageLink(number));
    });

    if (Number(currentPage) != totalPages) {
      pageNavBar.appendChild(nextLink());
    }
  }

  function pageLink(number) {
    let a = document.createElement("a");
    a.href = window.location.origin + "/page/" + number;
    a.innerHTML = number;
    console.log(number);
    console.log(currentPage);

    if (number === Number(currentPage)) {
      a.classList.add("current-page");
    }

    return a;
  }

  function previousLink() {
    let arrow = document.createElement("div");
    arrow.classList.add("arrow", "left");
    let previous = document.createElement("a");
    previous.innerHTML = "<< Prev";
    let previousPage = Number(currentPage) - 1;
    previous.href = window.location.origin + "/page/" + previousPage;

    return previous;
  }

  function nextLink() {
    let arrow = document.createElement("div");
    arrow.classList.add("arrow", "right");
    let next = document.createElement("a");
    next.innerHTML = "Next >>";
    let nextPage = Number(currentPage) + 1;
    next.href = window.location.origin + "/page/" + nextPage;

    return next;
  }

  displayNavBar();
})();

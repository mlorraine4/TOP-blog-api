const initQuery = (() => {
  const form = document.getElementById("queryForm");
  const button = document.getElementById("button");

  button.onclick = async () => {
    try {
      const url = "https://openlibrary.org/search.json?q=city+of+glass&limit=5";
      const headers = new Headers({
        "User-Agent": "GardenOfPages/1.0 (marialorrainesilvia4@gmail.com)",
      });
      const options = {
        method: "GET",
        headers: headers,
      };

      // fetch(url, options)
      //   .then((response) => response.json())
      //   .then((data) => console.log(data))
      //   .catch((error) => console.error("Error:", error));

      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };
})();

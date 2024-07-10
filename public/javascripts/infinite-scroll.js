const initScroll = (() => {
  let review_ids = [];
  let wrap_ids = [];
  let skip = 0;
  const post_list = document.getElementById("post-list");

  window.onscroll = () => {
    handleScroll();
  };

  getPosts();

  function handleScroll() {
    // is this compatible with OS?
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      // user hits bottom of page, load more content
      console.log("end of page");
      getPosts();
    }
  }

  function getPosts() {
    let data = {
      reviews: review_ids,
      wraps: wrap_ids,
      skip: skip,
    };

    postData("/posts", data).then((response) => {
      displayPosts(response.posts);
    });
    counter();
  }

  function displayPosts(posts) {
    for (const post of posts) {
      if (post.month) {
        // monthly wrap up, add id to wrap ups
        wrap_ids.push(post._id);

        // create post
        let div = document.createElement("div");
        div.className =
          "hover:text-accent w-[300px] h-[450px] relative m-4 overflow-hidden whitespace-nowrap text-ellipsis flex flex-col justify-center";
        let img = document.createElement("img");
        img.className = "shadow-lg h-[400px] w-[300px]";
        img.src = he.decode(post.cover_url);
        let a_one = document.createElement("a");
        a_one.href = `${post.url}`;
        a_one.className = "w-full h-full absolute top-0 left-0 opacity-0";
        let a_two = document.createElement("a");
        a_two.href = `${post.url}`;
        a_two.className =
          "text-xl overflow-hidden whitespace-nowrap text-ellipsis";
        a_two.innerHTML = `${post.month} Wrap Up`;
        let a_three = document.createElement("a");
        a_three.href = `${post.url}`;
        a_three.innerHTML = moment(post.timestamp).utc().format("MMM Do");

        div.append(img, a_one, a_two, a_three);
        post_list.append(div);
      } else {
        // review, add id to reviews
        review_ids.push(post._id);

        // create post
        let div = document.createElement("div");
        div.className =
          "hover:text-accent w-[300px] h-[450px] relative m-4 overflow-hidden whitespace-nowrap text-ellipsis flex flex-col justify-center";
        let img = document.createElement("img");
        img.className = "shadow-lg h-[400px] w-[300px]";
        img.src = he.decode(post.book_cover_url);
        let a_one = document.createElement("a");
        a_one.href = post.review_url;
        a_one.className = "w-full h-full absolute top-0 left-0 opacity-0";
        let a_two = document.createElement("a");
        a_two.href = post.review_url;
        a_two.className =
          "text-xl overflow-hidden whitespace-nowrap text-ellipsis";
        a_two.innerHTML = `A Review: ${post.title} by ${post.author}`;
        let a_three = document.createElement("a");
        a_three.href = post.review_url;
        a_three.innerHTML = moment(post.timestamp).utc().format("MMM Do");

        div.append(img, a_one, a_two, a_three);
        post_list.append(div);
      }
    }
  }

  function counter() {
    skip += 6;
  }

  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
})();

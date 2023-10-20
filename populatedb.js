#! /usr/bin/env node

const postBody = "The writing was fantastical and delightful. I thoroughly enjoyed Sanderson's style and thoughts of the narrative character. It was a very refreshing read, however I will say I wished it was paced somewhat differently.<br /><br />The introduction to the world was engaging, and right when I think the story and plot were going to really take off, it fell a little stagnant. For the majority of the book, we're in one 'place' (I say that loosely) while Tress learns about herself the characters around her. I had expectations of way more adventure and sight seeing, so in that way I felt a little unsatisfied as a reader.<br /><br />However, the last 200 pages really deliver. The action I was craving with a sense of higher stakes, the plot twists, and the way Sanderson wraps up the storyline made me fall in love with this book.<br /><br />In a perfect world, I wish I had those feelings the entire time reading it. But maybe if I went into this book knowing it had a slower paced vibe, I wouldn't have any critiques. Regardless, I highly recommend this book and its one I would absolutely re-read.";

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require("./models/category");
const Post = require("./models/post");
const Tags = require("./models/tags");

const categories = [];
const tags = [];
const posts = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createTags();
  await createPosts();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name) {
  const category = new Category({ name: name });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function tagsCreate(index, name) {
 const tag = new Tags({ name: name });
 await tag.save();
 tags[index] = tag;
 console.log(`Added tag: ${name}`);
}

async function postCreate(index, title, body, tags, category, book_cover_url) {
  const postdetail = {
    title: title,
    body: body,
    tags: tags,
    category: category,
    book_cover_url: book_cover_url,
  };

  const post = new Post(postdetail);
  await post.save();
  posts[index] = post;
  console.log(`Added post: ${title}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "Book Reviews"),
  ]);
}

async function createTags() {
  console.log("Adding tags");
  await Promise.all([
    tagsCreate(0, "tressoftheemeraldsea"),
    tagsCreate(1, "brandonsanderson"),
    tagsCreate(2, "fantasy"),
    tagsCreate(3, "ya"),
    tagsCreate(4, "thecosmere")
  ]);
}

async function createPosts() {
  console.log("Adding post");
  await Promise.all([
    postCreate(
      0,
      "Review: Tress of the Emerald Sea",
      postBody,
      [tags[0], tags[1], tags[2], tags[3], tags[4]],
      [categories[0]],
      "https://firebasestorage.googleapis.com/v0/b/book-blog-951ba.appspot.com/o/book-covers%2Ftress-of-the-emerald-sea.jpg?alt=media&token=f447a947-9a23-4884-9d4f-98d86c9aa63a"
    ),
  ]);
}

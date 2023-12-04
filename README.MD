# Garden of Pages (Book Blog)

# Summary
This is my project submission for The Odin Project's [Blog API](https://www.theodinproject.com/lessons/nodejs-blog-api). The goal of this project is to create a blog  with an API only back end and different front-ends (one for the public, one for the admin). To do this, I created a web server using NodeJS and used Mongoose as the database. I used Passport to handle user authentication, and the view changes based on an admin being signed in or not. This project is a book blog, where posts are either book reviews or monthly reading wrap up's.

## Get the live demo [here](https://mlorraine4.github.io/waldo-app/)!

# Built With

## Front End
* Pug

## Back End

* NodeJS
* Mongoose
* Firebase Storage

## Dependencies
* Passport
* BcryptJS: creates a hashed password to save in database for better security
* TinyMCE: a rich text editor

# Features
Admin can:
* add book reviews and customize them with a text editor
* create monthly wrap up's, give them a summary and specify the month and year
* display a google calendar for bookish needs (a to-be-released calendar, a special edition sale calendar, etc.)
* add books, including starred review and date read to library
* edit/delete each post
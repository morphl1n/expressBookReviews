const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // 1️⃣ Check if username & password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // 2️⃣ Check if the username already exists
    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // 3️⃣ Add new user to the users array
    users.push({ username, password });
  
    // 4️⃣ Send success response
    return res.status(200).json({ message: "User successfully registered. You can now log in." });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  jsonBooks = JSON.stringify(books)

  return res.status(200).json(jsonBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const params = req.params.isbn;
    const book = books[params];

    if (book) {
        return res.status(200).json(book);
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    });

  
// Get book details based on author
// Helper function to normalize strings:
// - lowercase
// - remove accents
// - strip spaces, punctuation, etc.
const normalize = (str) =>
  String(str)
    .toLowerCase()
    .normalize('NFD')                 // break accented characters
    .replace(/[\u0300-\u036f]/g, '')  // remove diacritics
    .replace(/[^a-z0-9]/g, '');       // remove spaces, punctuation, underscores, etc.

// Get book details based on author (forEach version)
public_users.get('/author/:author', function (req, res) {
  const authorParam = decodeURIComponent(req.params.author);
  const normalizedParam = normalize(authorParam);

  const keys = Object.keys(books);
  let matchingBooks = [];

  keys.forEach((key) => {
    const book = books[key];
    const normalizedAuthor = normalize(book.author);

    if (normalizedAuthor === normalizedParam) {
      matchingBooks.push({ isbn: key, ...book });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const titleParam = decodeURIComponent(req.params.title);
    const normalizedParam = normalize(titleParam);
  
    const keys = Object.keys(books);
    const matchingBooks = [];
  
    keys.forEach((key) => {
      const book = books[key];
      const normalizedTitle = normalize(book.title);
      if (normalizedTitle === normalizedParam) {
        matchingBooks.push({ isbn: key, ...book });
      }
    });
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // extract ISBN from URL

  // Find the book by ISBN
  const book = books[isbn];

  if (book) {
    // Return the reviews object (can be empty)
    return res.status(200).json(book.reviews);
  } else {
    // ISBN not found
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

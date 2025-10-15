const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (typeof username !== 'string') return false;
    const u = username.trim();
    if (!u) return false;
    // valid if not already registered
    return !users.some(user => user.username === u);
  };
  
  // Check if provided credentials match a registered user
  const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
  };
  
  // only registered users can login
  regd_users.post("/login", (req, res) => {
    const { username, password } = req.body || {};
  
    // Validate presence of credentials
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Verify credentials
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    // Create a JWT and store it in the session for downstream auth middleware
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
    req.session.authorization = { accessToken, username };
  
    return res.status(200).json({ message: "User successfully logged in" });
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
  
    // Get the logged-in username (session-based per lab; JWT payload is a nice fallback)
    const username =
      (req.session && req.session.authorization && req.session.authorization.username) ||
      (req.user && req.user.username);
  
    // Validate inputs & auth
    if (!username) {
      return res.status(401).json({ message: "Unauthorized: please log in" });
    }
    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({ message: "Review text is required via query parameter ?review=" });
    }
  
    // Check that ISBN exists
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Ensure reviews object exists
    if (!book.reviews) book.reviews = {};
  
    // Add or update the review for this user
    const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = reviewText.trim();
  
    return res.status(200).json({
      message: isUpdate ? "Review updated successfully" : "Review added successfully",
      isbn,
      username,
      reviews: book.reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

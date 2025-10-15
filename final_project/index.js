const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  // Session must contain the authorization object set during login
  if (!req.session || !req.session.authorization) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = req.session.authorization.accessToken; // set this on login
  if (!token) {
    return res.status(401).json({ message: "Missing access token" });
  }

  // Verify the JWT (use the same secret you used when signing)
  jwt.verify(token, "access", (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    // Attach useful info from the token (e.g., username) for downstream handlers
    req.user = payload;
    return next();
  })
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

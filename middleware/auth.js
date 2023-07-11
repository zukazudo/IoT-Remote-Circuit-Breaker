const jwt = require('jsonwebtoken');

const jwtSecret = "ef0b6ef366eaae1dd9166f08dc83d8b3a6c0e9bf2f644986d13eceda44b70b2c060f1d";

exports.user_auth = function(req, res, next) {
  const token = req.cookies.jwt;
  // console.log(JSON.stringify(next));
  if(token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if(err) {
        // console.log(err.message)
        return res.status(401).send("not authorized");
      }
      // console.log(req)
      next();
      // res.redirect(req.url);
    });
  }
  else {
    res.redirect("/login");
  }
};

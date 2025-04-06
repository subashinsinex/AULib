const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in the environment variables");
}

const jwtChecker = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    return res.status(401).json({ error: "Access Denied, Token Missing" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access Denied, Token Format Invalid" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Attach the decoded information to the request object (e.g., userId)
    req.userId = decoded.userId;
    next();
  });
};

module.exports = jwtChecker;

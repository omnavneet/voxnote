import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.idToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  jwt.verify(
    token,
    getKey,
    { algorithms: ["RS256"] },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;
      next();
    }
  );
};

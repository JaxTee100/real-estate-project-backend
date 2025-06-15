
import { jwtVerify } from "jose";

export const authenticateJwt = (
  req,
  res,
  next
) => {
    //get access token from the one saved in the cookies
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res
      .status(401)
      .json({ success: false, error: "Access denied, Login to continue" });
    return;
  }
  console.log("Access Token");

  jwtVerify(accessToken, new TextEncoder().encode(process.env.JWT_SECRET))
    .then((res) => {
      const payload = res.payload
      req.user = {
        userId: payload.userId,
        email: payload.email
      };
      next();
    })
    .catch((e) => {
      console.error(e);
      res
        .status(401)
        .json({ success: false, error: "Access token is not present" });
    });
};
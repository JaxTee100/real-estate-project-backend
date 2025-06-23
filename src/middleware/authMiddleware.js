
import { jwtVerify } from "jose";

export const authenticateJwt = (
  req,
  res,
  next
) => {
    //get access token from the one saved in the cookies
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    res
      .status(401)
      .json({ success: false, error: "Access denied, Login to continue" });
      console.log('authorization failed here')
    return;
  }
  console.log("Access Token");

  jwtVerify(accessToken, new TextEncoder().encode(process.env.JWT_SECRET))
    .then((res) => {
      const payload = res.payload
      req.user = {
        id: payload.userId,
        email: payload.email
      };
      next();
    })
    .catch((e) => {
      console.error(e);

      // Clear invalid tokens
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
      res
        .status(401)
        .json({ success: false, error: "Access token is not present" });
    });
};
import { prisma } from "../server.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

function generateToken(userId, email) {
  const accessToken = jwt.sign(
    {
      userId,
      email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

async function setTokens(
  res,
  accessToken,
  refreshToken
) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email exists!",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        refreshToken: uuidv4()
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      userId: user.id,
      name: user.name
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Registration failed ${e}` });
  }
};

export const login = async (req, res)=> {
  try {
    const { email, password } = req.body;
    const extractCurrentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !extractCurrentUser ||
      !(await bcrypt.compare(password, extractCurrentUser.password))
    ) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });

      return;
    }

    //create our access and refreshtoken
    const { accessToken, refreshToken } = generateToken(
      extractCurrentUser.id,
      extractCurrentUser.email
    );

    await prisma.user.update({
      where: { id: extractCurrentUser.id },
      data: { refreshToken },
    });


    //set out tokens
    await setTokens(res, accessToken, refreshToken);
    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        id: extractCurrentUser.id,
        name: extractCurrentUser.name,
        email: extractCurrentUser.email,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const refreshAccessToken = async (
  req,
  res
) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user.id,
      user.email,
    );
    //set out tokens
    await setTokens(res, accessToken, newRefreshToken);
    res.status(200).json({
      success: true,
      message: "Refresh token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Refresh token error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "User logged out successfully",
  });
};

import { signInWithCognito, signUpWithCognito, verifyCognitoUser, } from "../services/cognitoAuth.service.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const authResult = await signInWithCognito(email, password);

    const {
      AccessToken,
      IdToken,
      RefreshToken,
      ExpiresIn,
    } = authResult;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    res.cookie("accessToken", AccessToken, {
      ...cookieOptions,
      maxAge: ExpiresIn * 1000,
    });

    res.cookie("idToken", IdToken, {
      ...cookieOptions,
      maxAge: ExpiresIn * 1000,
    });

    res.cookie("refreshToken", RefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    console.log("User logged in:", email);

    return res.status(200).json({
      message: "Login successful",
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
};

/* SIGN UP */
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    await signUpWithCognito(email, password);

    return res.status(200).json({
      message: "Signup successful. Please verify your email.",
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

/* VERIFY EMAIL */
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    await verifyCognitoUser(email, code);

    return res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const me = async (req, res) => {
  return res.status(200).json({
    user: {
      sub: req.user.sub,
      email: req.user.email,
    },
  });
};

export const logout = async (req, res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("idToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  return res.status(200).json({
    message: "Logout successful",
  });
}
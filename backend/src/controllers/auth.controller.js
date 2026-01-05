import { signInWithCognito, signUpWithCognito, verifyCognitoUser, changeCognitoPassword, forgotCognitoPassword, confirmForgotCognitoPassword, deleteCognitoUser } from "../services/cognitoAuth.service.js";

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
      secure: true,
      sameSite: "none",
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

export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const result = await refreshCognitoSession(refreshToken);

    const { AccessToken, IdToken, ExpiresIn } = result;

    res.cookie("accessToken", AccessToken, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: ExpiresIn * 1000 });
    res.cookie("idToken", IdToken, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: ExpiresIn * 1000 });

    return res.json({ message: "Refreshed" });
  } catch {
    return res.status(401).json({ message: "Refresh failed" });
  }
};


export const logout = async (req, res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("idToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  return res.status(200).json({
    message: "Logout successful",
  });
}

/* DELETE USER */
export const deleteUser = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    await deleteCognitoUser(accessToken);
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("idToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* CHANGE PASSWORD */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const accessToken = req.cookies.accessToken;

    await changeCognitoPassword(accessToken, oldPassword, newPassword);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await forgotCognitoPassword(email);

    return res.status(200).json({ message: "Reset code sent to email" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* CONFIRM FORGOT PASSWORD */
export const confirmPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    await confirmForgotCognitoPassword(email, code, newPassword);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
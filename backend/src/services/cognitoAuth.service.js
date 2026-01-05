import {
  CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, ChangePasswordCommand,
  ForgotPasswordCommand, ConfirmForgotPasswordCommand, DeleteUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

/* SIGN IN USER */
export const signInWithCognito = async (email, password) => {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const response = await cognitoClient.send(command);
  return response.AuthenticationResult;
};

/* SIGN UP USER */
export const signUpWithCognito = async (email, password) => {
  const command = new SignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email }
    ],
  });

  return await cognitoClient.send(command);
};

/* VERIFY EMAIL */
export const verifyCognitoUser = async (email, code) => {
  const command = new ConfirmSignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });

  return await cognitoClient.send(command);
};

/* DELETE USER */
export const deleteCognitoUser = async (accessToken) => {
  const command = new DeleteUserCommand({
    AccessToken: accessToken,
  });
  return await cognitoClient.send(command);
}

/* CHANGE PASSWORD (logged in) */
export const changeCognitoPassword = async (accessToken, oldPassword, newPassword) => {
  const command = new ChangePasswordCommand({
    AccessToken: accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  });

  return await cognitoClient.send(command);
};

/* CHANGE PASSWORD (forgot password) */
export const forgotCognitoPassword = async (email) => {
  const command = new ForgotPasswordCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
  });
  return await cognitoClient.send(command);
};

/* CONFIRM FORGOT PASSWORD */
export const confirmForgotCognitoPassword = async (email, code, newPassword) => {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });
  return await cognitoClient.send(command);
};

/* REFRESH SESSION */
export const refreshCognitoSession = async (refreshToken) => {
  const command = new InitiateAuthCommand({
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  const response = await cognitoClient.send(command);
  return response.AuthenticationResult;
};

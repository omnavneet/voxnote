import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand} from "@aws-sdk/client-cognito-identity-provider";

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

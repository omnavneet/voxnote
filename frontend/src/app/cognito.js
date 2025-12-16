import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION
});

export const COGNITO = {
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
};
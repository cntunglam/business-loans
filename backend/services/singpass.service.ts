import { createPrivateKey, createPublicKey } from 'crypto';
import { readFileSync } from 'fs';
import { exportJWK } from 'jose';
import path from 'path';
//@ts-ignore
import MyInfoConnector from 'myinfo-connector-v4-nodejs';
import { CONFIG } from '../config';

const CLIENT_IDS = {
  staging: 'STG-53448662B-KOALA-LOANAPPLN',
  production: 'PROD-53448662B-KOALA-LOANAPPLN',
};

const PURPOSE_IDS = {
  staging: '9ba2ffda',
  production: '64061838',
};

const basePath = CONFIG.NODE_ENV === 'development' ? path.join(__dirname, '../cert/') : path.join(__dirname, 'cert/');
const signinKeyPem = readFileSync(path.join(basePath, 'sig.pem'), 'utf8');
const encKeyPem = readFileSync(path.join(basePath, 'enc.pem'), 'utf8');

const prefix = CONFIG.NODE_ENV === 'production' ? '' : 'test.';

let SINGPASS_CONFIG = {
  PURPOSE_ID: CONFIG.NODE_ENV === 'production' ? PURPOSE_IDS.production : PURPOSE_IDS.staging,
  MYINFO_API_AUTHORIZE: `https://${prefix}api.myinfo.gov.sg/com/v4/authorize`,
  CLIENT_ID: CONFIG.NODE_ENV === 'production' ? CLIENT_IDS.production : CLIENT_IDS.staging,
  SUBENTITY_ID: '',
  REDIRECT_URL: CONFIG.CLIENT_APP_URL + (CONFIG.NODE_ENV === 'development' ? '/callback' : '/spass/callback'),
  SCOPE: `uinfin name nationality dob sex race marital occupation email mobileno regadd housingtype hdbtype ownerprivate cpfcontributions`,
  LOGIN_SCOPE: `uinfin email mobileno`,
  AUTHORIZE_JWKS_URL: `https://${prefix}authorise.singpass.gov.sg/.well-known/keys.json`,
  MYINFO_JWKS_URL: `https://${prefix}authorise.singpass.gov.sg/.well-known/keys.json`,
  TOKEN_URL: `https://${prefix}api.myinfo.gov.sg/com/v4/token`,
  PERSON_URL: `https://${prefix}api.myinfo.gov.sg/com/v4/person`,
  CLIENT_ASSERTION_SIGNING_KID: 'RSHI-SIG', // optional parameter to specify specific kid for signing. Default will be thumbprint of JWK
  USE_PROXY: 'N',
  PROXY_TOKEN_URL: '',
  PROXY_PERSON_URL: '',
  DEBUG_LEVEL: 'OFF',
};

const connector = new MyInfoConnector(SINGPASS_CONFIG);

export const generateApplyUrl = () => {
  // call connector to generate code_challenge and code_verifier
  let pkceCodePair = connector.generatePKCECodePair();
  const authorizeUrl =
    SINGPASS_CONFIG.MYINFO_API_AUTHORIZE +
    '?client_id=' +
    SINGPASS_CONFIG.CLIENT_ID +
    '&scope=' +
    SINGPASS_CONFIG.SCOPE +
    '&purpose_id=' +
    SINGPASS_CONFIG.PURPOSE_ID +
    '&code_challenge=' +
    pkceCodePair.codeChallenge +
    '&code_challenge_method=S256' +
    '&redirect_uri=' +
    SINGPASS_CONFIG.REDIRECT_URL;
  //send code code_challenge to frontend to make /authorize call
  return { authorizeUrl, codeVerifier: pkceCodePair.codeVerifier };
};

export const generateLoginUrl = () => {
  // call connector to generate code_challenge and code_verifier
  let pkceCodePair = connector.generatePKCECodePair();
  const authorizeUrl =
    SINGPASS_CONFIG.MYINFO_API_AUTHORIZE +
    '?client_id=' +
    SINGPASS_CONFIG.CLIENT_ID +
    '&scope=' +
    SINGPASS_CONFIG.LOGIN_SCOPE +
    '&purpose_id=' +
    SINGPASS_CONFIG.PURPOSE_ID +
    '&code_challenge=' +
    pkceCodePair.codeChallenge +
    '&code_challenge_method=S256' +
    '&redirect_uri=' +
    SINGPASS_CONFIG.REDIRECT_URL;
  //send code code_challenge to frontend to make /authorize call
  return { authorizeUrl, codeVerifier: pkceCodePair.codeVerifier };
};

export const querySingpassMyInfo = async (authCode: string, codeVerifier: string) => {
  return connector.getMyInfoPersonData(authCode, codeVerifier, signinKeyPem, [encKeyPem]);
};

export const jwksKeys: any[] = [];

(async () => {
  const sigPrivateKey = createPrivateKey(signinKeyPem);
  const sigPublicKey = createPublicKey(sigPrivateKey);
  const sigJwk = await exportJWK(sigPublicKey);
  jwksKeys.push({
    ...sigJwk,
    use: 'sig',
    kid: 'RSHI-SIG', // Key ID; you can generate a more unique ID if required
    alg: 'ES256',
  });

  const encPrivateKey = createPrivateKey(encKeyPem);
  const encPublicKey = createPublicKey(encPrivateKey);
  const encJwk = await exportJWK(encPublicKey);
  jwksKeys.push({
    ...encJwk,
    use: 'enc',
    kid: 'RSHI-ENC', // Key ID; you can generate a more unique ID if required
    alg: 'ECDH-ES+A256KW',
  });
})();

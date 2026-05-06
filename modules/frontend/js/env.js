/**
 * env.js — Runtime environment configuration for CloudSentinel
 *
 * In production (AWS Amplify / S3 + CloudFront):
 *   Replace the placeholder strings below with your actual values
 *   via the Amplify environment variable build step, or use a
 *   server-side rewrite to serve a pre-rendered copy of this file.
 *
 * Required variables:
 *   COGNITO_POOL_ID    — e.g. us-east-1_AbCdEfGhI
 *   COGNITO_CLIENT_ID  — e.g. 1a2b3c4d5e6f7g8h9i0j
 *   API_URL            — e.g. https://abc123.execute-api.us-east-1.amazonaws.com/prod
 *   REGION             — e.g. us-east-1
 *
 * NEVER commit real credentials here. Use the deployment pipeline
 * to inject values at build time.
 */

window.ENV_COGNITO_POOL_ID   = "us-east-1_nsa2fJTq6";
window.ENV_COGNITO_CLIENT_ID = "2oic9j2thbd97o9phnj2fuuh1l";
window.ENV_API_URL            = "https://cbrg5o4rv9.execute-api.us-east-1.amazonaws.com/dev";
window.ENV_REGION             = "us-east-1";

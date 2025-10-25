/**
 * OAuth 配置
 * 
 * 配置 GitHub 和 Google OAuth 提供商
 */

export const oauthProviders = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: ['read:user', 'user:email'],
    callbackPath: '/api/auth/github/callback'
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    callbackPath: '/api/auth/google/callback'
  }
}

export function getOAuthConfig(provider) {
  const config = oauthProviders[provider]
  
  if (!config) {
    throw new Error(`不支持的 OAuth 提供商: ${provider}`)
  }
  
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
  
  return {
    ...config,
    redirectUri: `${apiBaseUrl}${config.callbackPath}`
  }
}

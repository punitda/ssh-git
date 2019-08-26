const oauth = {
  github: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    scopes: {
      basic: 'user',
      admin: 'admin:public_key',
    },
  },
  bitbucket: {
    basic_client_id: process.env.BITBUCKET_BASIC_CLIENT_ID,
    admin_client_id: process.env.BITBUCKET_ADMIN_CLIENT_ID,
    scopes: {
      basic: 'account',
      admin: 'repository:admin',
    },
  },
  gitlab: {
    client_id: process.env.GITLAB_CLIENT_ID,
    scopes: {
      basic: 'read_user',
      admin: 'api',
    },
  },
};

const providers = {
  GITHUB: 'github',
  BITBUCKET: 'bitbucket',
  GITLAB: 'gitlab',
};

const oauth_base_urls = {
  GITHUB: 'https://github.com/login/oauth',
  BITBUCKET: 'https://bitbucket.org/site/oauth2',
  GITLAB: 'https://gitlab.com/oauth',
};

const api_base_urls = {
  GITHUB: 'https://api.github.com/',
  BITBUCKET: 'https://api.bitbucket.org/2.0/',
  GITLAB: 'https://gitlab.com/api/v4/',
};

module.exports = {
  oauth,
  providers,
  oauth_base_urls,
  api_base_urls,
};

const oauth = {
  github: {
    client_id: process.env.GITHUB_CLIENT_ID,
    scopes: {
      basic: 'read:user,user:email',
    },
  },
  bitbucket: {
    client_id: process.env.BITBUCKET_CLIENT_ID,
    scopes: {
      basic: 'account',
    },
  },
  gitlab: {
    client_id: process.env.GITLAB_CLIENT_ID,
    scopes: {
      basic: 'read_user',
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

const sentry = {
  dsn: 'https://8ec04a93dbde4b6781a3e9d0fbe1d7f8@sentry.io/1837456',
};

const web_base_url = 'https://ssh-git.app';

module.exports = {
  oauth,
  providers,
  oauth_base_urls,
  api_base_urls,
  web_base_url,
  sentry,
};

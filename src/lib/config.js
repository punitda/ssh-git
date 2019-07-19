module.exports = {
  oauth: {
    github: {
      client_id: process.env.GITHUB_CLIENT_ID,
      scopes: 'user admin:public_key',
    },
    bitbucket: {
      client_id: process.env.BITBUCKET_CLIENT_ID,
      scopes: 'email repository:admin',
    },
    gitlab: {
      client_id: process.env.GITLAB_CLIENT_ID,
      scopes: 'api read_user',
    },
  },
};

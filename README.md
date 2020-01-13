# ssh-git

[![Github Actions](https://github.com/punitda/ssh-git/workflows/Release%20App/badge.svg)](https://github.com/punitda/ssh-git/actions)
[![License](https://img.shields.io/badge/MIT-LICENSE-blue)](https://github.com/punitda/ssh-git/blob/develop/LICENSE)

**ssh-git** is a desktop app to manage SSH keys for Github, Bitbucket and Gitlab accounts. [More info](https://ssh-git.app)
<br/>

## Download

App is available for Mac and Ubuntu and can be downloaded from website.

[Download App](https://ssh-git.app/download)

## Features

- Setup SSH keys in seconds 🚀
- No need to use terminal or dealing with SSH config files 😅
- Clone repo and Update remote url from UI 🤟
- Setup unlimited different Github, Bitbucket and Gitlab accounts on same machine ∞

## Tech

### Core:

- [Electron](https://electronjs.org/)
- [ReactJS](https://reactjs.org/)
- [TailwindCss](https://tailwindcss.com/)
- [node-pty](https://github.com/microsoft/node-pty)

### Tooling:

- [Parcel](https://parceljs.org/)
- [Electron-Builder](https://www.electron.build/)

## Bug and Feature Requests:

Have a bug or feature request?
The app has public Trello board where anyone can submit feature request and bugs using your Trello account.

👉 [Trello board link](https://trello.com/b/iJR6Xqhj/bug-feature-tracker-for-ssh-git)

If you don't prefer to use Trello board, you can file a Github issue as well.

## Developing:

App is written in Javascript using Electron framework. UI is written using ReactJS and TailwindCss. Parcel is used to bundle JS and Electron-Builder is used to package and build App.

To run this project locally you will need following things installed on your machine.

- NodeJS(min v10.15.+)
- Yarn

To run this project locally run following command:

```
yarn start
```

To build this project locally run following command:

```
yarn build
```

> Note : To both run and build this project you will need to create `.env` file with following properties.

_.env.sample_

```
GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>
GITLAB_CLIENT_ID=<YOUR_GITLAB_CLIENT_ID>
BITBUCKET_CLIENT_ID=<YOUR_BITBUCKET_CLIENT_ID>
```

## Donation:

This project is free to download and use but it has fix upfront cost to keep it running. So, if you use this app frequently to setup SSH keys for your accounts please consider donating 🙏

<img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;"></a>

## License:

[MIT](LICENSE) &copy; [Punit Dama](https://punitd.dev)

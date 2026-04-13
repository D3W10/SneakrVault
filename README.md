<p align="center">
    <br />
    <img src="https://raw.githubusercontent.com/D3W10/SneakrVault/refs/heads/main/public/logo.svg" alt="Logo" width="80" height="72">
    <h1 align="center">SneakrVault</h1>
    <h4 align="center">Organize your sneaker collection</h4>
    <p align="center">
        <a href="#about">About</a>
        ·
        <a href="https://ghostty.org/download">Releases</a>
        ·
        <a href="CONTRIBUTING.md">Contributing</a>
    </p>
</p>

&nbsp;

## Table of Contents

- [About](#about)
- [Deploy your own](#deploy-your-own)
- [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Setup environment](#setup-environment)
    - [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

&nbsp;

## About

SneakrVault is a self-hosted sneaker collection management web application that aims to help users manage and organize their sneaker collections. It was designed for people who want a good way to keep track of their all pairs, their locations or manage the collection between multiple people.

It provides a user-friendly interface for anyone to add new pairs plus an admininstrator dashboard to manage users, brands and locations. Some of the features include:
- Search pairs with multiple filters;
- Ability to create multiple accounts (including admin and guest accounts);
- Assign locations and owners to pairs, great when you have a shared collection;
- A system that allow users to pick sneakers for one another;
- Organize pairs into collections for better management.

## Deploy your own

SneakrVault is a self-hosted application so, in order to start using it, you need to deploy an instance of it yourself. Even with no development experience, you should be able to do it by following the steps. Note that you might need to create 3 accounts.

1. Go to [GitHub](https://github.com/) and create an account;
2. Go to [Vercel](https://vercel.com/) and create an account;
3. Go to [Convex](https://www.convex.dev/) and create an account;
4. Create a new project in Convex (you can choose any name you want);
5. On the top, switch from "Development (Cloud)" to "Production", making it switch from green to purple;
6. Click on the button below to deploy SneakrVault to Vercel, you may choose the project and repository names;

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FD3W10%2FSneakrVault&env=SESSION_SECRET,CONVEX_URL,CONVEX_DEPLOY_KEY)

7. For the "Environment Variables" section, you need to provide the following values:
    - Go to a website like [RandomKeygen](https://randomkeygen.com/encryption-key) and generate a 128 bit hexadecimal key, copy the resulting AES-128 key and paste it in the `SESSION_SECRET` field;
    - On Convex, head to the "Settings" tab and copy the Cloud URL and paste it in the `CONVEX_URL` field;
    - Also on Convex Settings, click on "Generate Production Deploy Key", give it a name, copy it and paste it in the `CONVEX_DEPLOY_KEY` field;
8. Wait until the deployment is finished;
9. Once finished, find the project settings on Vercel and go to "Build and Deployment", find the "Build Command" field, turn on override and paste:
```bash
bunx convex deploy --cmd 'bun run build'
```
10. Go back to the project overview page and select "Deployments", click on the three dots on the top right and then "Create Deployment", click on "main" and select "Create Deployment";
11. Wait for the deployment to finish;
12. Open [init.json](https://github.com/D3W10/SneakrVault/blob/main/convex/init.json), copy the contents and head over to the "Data" tab on Convex;
13. Select the "users" table, click on "Add" and replace the contents with the copied data, press "Save";
14. You're done! Head to the project overview on Vercel and tap on "Visit" to see the app. This is the URL you'll use to access SneakrVault;
15. First thing you should do is access the admin panel, change its password and create your first user. The default admin credentials are "admin" for both user and password;
16. Click the pencil to change the password of the admin user and log back in (**this is important, otherwise any attacker can easily guess the password and manipulate data without you knowing**);
17. Create a user for you, along with the brands of the pairs you want to use and locations, log out when you're done;
18. Log in with your own credentials and start adding your sneakers!

**Optional**

19. Go to the "Domains" tab on Vercel, here you can edit the domain name to where SneakrVault will be hosted.

## Development

The following instructions are for developers who want to run the project locally for testing purposes or contributing to the project.

### Prerequisites

- Bun (or any other JS runtime/package manager)
- Node.js 18+
- Convex CLI installed

### Setup environment

1. Clone the repository:
```bash
git clone https://github.com/D3W10/SneakrVault.git
cd SneakrVault
```
2. Install the dependencies:
```bash
bun install
```
3. Run the Convex CLI in dev mode:
```bash
bunx convex dev
```
4. Rename the `.env.local.example` file to `.env.local`;
5. Follow the instructions in the terminal to associate the local project with a Convex project. You can then stop the Convex CLI by pressing `Ctrl + C`;
6. Fill the rest of the required values in the `.env.local` file.
7. Run the app:
```bash
bun run dev
```

### Project structure

```
SneakrVault/
├── convex/               # Convex related files
├── public/               # Static assets publicly available
├── src/
│   ├── components/       # UI components of the app
│   ├── data/             # Contains data and session managers
│   ├── lib/              # Custom hooks and data types
│   ├── routes/           # Contains all pages of the app
│   ╰── styles.css        # Tailwind CSS styles
├── .env.local.example    # Required environment variables
╰── components.json       # shadcn/ui configuration
```

### Customize homepage order

The interface of the homepage is somewhat modular, each section is a block that can be reordered, removed and extended. All the available blocks are present in `src/components/blocks` and can be used in `src/routes/index.tsx`. You may create custom blocks under that folder for other things you may need.

## Contributing

If you have any ideas or issues and would like to contribute to SneakrVault, please check [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

SneakrVault is licensed under the [Mozilla Public License 2.0](LICENSE).
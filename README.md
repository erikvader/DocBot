# Ett kandidatarbetesprojekt
Atticus

## running instructions

First get all packages:
```sh
npm install
```

To run in development mode:
```sh
npm run dev
```

To run in production mode (doesn't need to build if using express???)
```sh
npm run start
```

## Code style

All pull requests that don't follow the code style will be rejected!

To format all files run:
```sh
make format-run
```

To verify whether all files are formatted (for reviewers) run:
```sh
make format-check
```

There are [editor packages](https://prettier.io/docs/en/editors.html) and [git integraton](https://prettier.io/docs/en/precommit.html) that could be used to automate this process. The git one is particularly nice as it automatically runs on the files that are about to get committed.

## directory structure

| Directory   | Purpose                                                                            |
| ---         | ---                                                                                |
| /pages      | Each file is a public page and each is accessed from *SERVER_IP*:*PORT*/*FILENAME* |
| /components | Shared [React](https://reactjs.org/) components between pages                      |
| /api        | Backend API stuff                                                                  |

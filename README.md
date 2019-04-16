# Ett kandidatarbetesprojekt
DocBot (temporary name)

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

## directory structure

| Directory   | Purpose                                                                            |
| ---         | ---                                                                                |
| /pages      | Each file is a public page and each is accessed from *SERVER_IP*:*PORT*/*FILENAME* |
| /components | Shared [React](https://reactjs.org/) components between pages                      |
| /api        | Backend API stuff                                                                  |

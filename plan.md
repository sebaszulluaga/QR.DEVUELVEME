# QR-Return MVP Architecture Plan

## Folder Structure

```
qr-return/
├── package.json
├── README.md
├── server.js
├── data.db
├── .env
├── .env.example
├── plan.md
├── db/
│   ├── init.sql
│   └── db.js
├── src/
│   ├── routes.js
│   ├── models.js
│   └── email.js
├── public/
│   ├── index.html
│   ├── js/
│   │   └── app.js
│   └── css/
│       └── styles.css
└── uploads/
```

## NPM Dependencies

- express
- better-sqlite3
- nodemailer
- multer
- dotenv
- nodemon (dev dependency)

## Task Plan (Files to Create)

1. package.json
2. README.md
3. server.js
4. db/init.sql
5. db/db.js
6. src/routes.js
7. src/models.js
8. src/email.js
9. public/index.html
10. public/js/app.js
11. public/css/styles.css
12. .env.example
13. (data.db will be created at runtime)
# Checkpoint: ready-for-demo
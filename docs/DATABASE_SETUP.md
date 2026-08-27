# Local Database Setup

## Current stack

- PostgreSQL 18 on `localhost:5432`
- Database: `career_companion`
- Prisma ORM 7.10 with the PostgreSQL driver adapter
- DBeaver or Prisma Studio for inspection

## One-time local setup

1. Open the root `.env` file.
2. Replace `YOUR_PASSWORD` with the local `postgres` password.
3. If the password contains URL-reserved characters such as `@`, `#`, `%`, `:`, `/`, or `?`, URL-encode the password first.
4. Run:

```bash
npm run db:migrate -- --name init
npm run db:generate
npm run db:seed
```

5. Refresh the `career_companion` database in DBeaver.

## Useful commands

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

`db:migrate` is for local development only. A future production environment must use `prisma migrate deploy`.

## Seed safety

The seed only replaces the fixed demo account `demo@career-companion.local`. It does not delete other users. All seeded names and workplace details are fictional demonstration data.

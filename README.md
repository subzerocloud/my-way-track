# MyWayTrack
## Track your job applications privately

This is an app that allows you to track your job applications privately.
I's built using the [subZero](https://subzero.cloud/) stack.
The data is stored in a [Turso](https://turso.tech/) database, which is actually a remote accessible SQLite database.

To run it locally, clone the repo and run `npm install` followed by `npm run dev`.

To deploy it to production:
* Get a Turso account and [create a database](https://docs.turso.tech/quickstart)
* Seed the database with (mywaytrack is the name of the database):
    ```
    turso db shell mywaytrack < db/include/schema.sql
    ```
* Get the connection string for the database:
    ```sh
    turso db show mywaytrack
    ```

* Get the access token for the database:
    ```sh
    turso db tokens create mywaytrack
    ```

* build the docker image using:
    ```
    docker build -t mywaytrack .
    ```
* run it using:
    ```sh
    docker run --rm \
    -p 3000:3000 \
    -e JWT_SECRET="<LONG_JWT_SECRET_HERE>" \
    -e DB_URI="<turso_connection_string_here>" \
    -e TURSO_TOKEN="<TURSO_ACCESS_TOKEN_HERE>" \
    my-way-track
    ```

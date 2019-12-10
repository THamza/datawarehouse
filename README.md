## Backend

### Database seeding:

In order to help you rebuild and populate your database quickly for both front-end and back-end debugging, a `seed.js` file is included in the ./db folder.

#### Script usage:

Run the following command to get the usage (features) of the script:

```
node ./db/seed.js -h
```

#### Clear database:

Run the following command to clear your database:

```
node ./db/seed.js -c
```
Please be careful when running the clear command. All **collections**, **documents**, and **indexes** will be **deleted**.

#### Database population:

Run the following command to populate your mongo local database with users:

```
node ./db/seed.js -d <coordinatorpassword>
```

Inside the `db` folder, there is a `users.txt` file from which the users are created. The file contains random full names. The list was generated from [here](http://listofrandomnames.com/index.cfm?generated). For simplicity, some contributors' names have been added to the list. As of now, the list contains **20** names.

You can add and delete names from the file as you see fit once you clone the repo. 

All users created by the `-d` command will have the following properties and values:

```
{
  email: firstname@cle.com,
  username: first letter of the last name + first name,
  firstname,
  lastname,
  password: firstname in reversed order
  //values for other properties are random
}
```

Please note that any field that utilizes the firstname or lastname is **all lowercase**.

Below is an example of a user with full name 'Zakaria Elasri':
```
{
  email: 'zakaria@cle.com',
  username: 'ezakaria',
  firstname: 'Zakaria',
  lastname: 'Elasri',
  password: 'airakaz'
}
```

**Note**: The above object is not the schema used for our user type.

#### Coordinator creation:
The script also creates 1 (as of now) coordinator. You will need to provide an argument to the `-d` command that will be set as the coordinator's password:
```
node ./db/seed.js -d <coordinatorpass>
```

The coordinator created by the script will hold the following values:
```
{
  email: 'najwa@cle.com',
  firstname: 'Najwa',
  lastname: 'Laabid',
  username: 'lnajwa',
  password: 'coordinatorpass'
}
```
Additional commands will be added to the script as the team progresses through the backend API. Any contribution to the script is welcome.


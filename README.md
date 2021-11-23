Voice to Text - Institut G4 - Groupe 6
=======


This is a computer science school project, which consists of a voice recognition AI that execute different actions when you pronounce some keywords.


Installing and Running on a RaspberryPI
-----------


### Requierements

* wget
* nodejs 15.0.0
* npm
* mysql


### Database creation

* Create new database named "db_exotica"
* Import tables from create_database.sql file
* Edit server.js with your database user credentials


### Downloading AI model

To get the AI training model you should use these commands:

```sh
# Go into models folder
cd models/

# Download custom model
wget https://pac.center/download/customModel_fr.tflite
```


### Starting the app

To start the application you should use these commands:

```sh
# Install NPM packages
npm install

# Start the React client
npm start 

# Start the NodeJS server (in an other terminal)
node server.js 
```

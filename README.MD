# Launch
To launch the program, simply run
```sh  
$ docker-compose up --build
```
# Seed
To seed the application, open an api testing client such as Postman. Create a new tab for a POST request to target 'localhost:8000/position'
Copy the contents of sample.json, found in the root directory of the project, and paste them into the body of the request. Make sure your 
headers are set appropriately (namely the Content-Type as application/json).
# View
The front end is viewable at http://localhost:3000
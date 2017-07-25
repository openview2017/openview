# OpenView Client

Using React, Redux and D3 for Data visualization

### Functionality of index.js

1. Send the front-end request to the back-end api server, written by NodeJs.
2. listen to Kafka and categorize messages to the front end.

### Initiate
`npm install` (node > 4, npm > 2)

### React  
```
cd public  
npm install   
npm run build  
```
### To start
`node index.js`  

visit http://localhost:5000

### Develop

1. Add host entries in /etc/hosts

    `devops-ip-address influxdb`

    `devops-ip-address api`

2. `npm start` , visit localhost:5000

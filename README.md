# BoiToi
It is an e-commerce web application that allows users to purchase and sell books. 
We used Nodejs, MongoDB, and a few other cutting-edge technologies to create this application.Except for Admin, there are two sorts of vendors: Publishers and Users.
Publishers are another type of user that add their books and keep track of their ratings and reviews, as well as their buying system. Users can purchase books based on their wish list, as well as through online transactions. STRIPE is a demonstration payment mechanism that we employ. The user can pay for his order with his Visa card, or cash on delivery is also an option. Our program allows users to track their orders.
## Features
- `Review and Rating system`
- ` Interactive and Responsive UI`
- ` Multi-user`
- ` Online payment system`
- ` Online invoice`
- ` Tracking order`

## :gear: Technologies and Tools
![](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

## :closed_lock_with_key: Dependencies
- `express` 
- `nodemon`
- `ejs`
- `mongoose`
- `express-validator`
- `connect-mongodb-session`


## Installation
- clone the project
- create a file in the folder named nodemon.json
- Edit the nodemon.json file in folloowing way

```
{
  "env": {
    "MONGO_USER": "your_mongodb_username",
    "MONGO_PASSWORD": "your_mongodb_password",
    "MONGO_DEFAULT_DATABASE": "your_mongodb_database_name"
    "STRIPE_key": "Your_STRIPE_KEY"
  }
}

```
- run `npm install`
- run `npm start` to run the project
- search in the brower using `localhost:3001`

## Screenshots
![home](https://user-images.githubusercontent.com/43216053/127352642-09d44951-35e8-49f6-afa5-d1dad851661e.png)
![Top_reviewed_products](https://user-images.githubusercontent.com/43216053/127352657-b0b364a4-a678-4cb8-9fc1-9a78c4ebd00a.png)
![Top_Sold_Products](https://user-images.githubusercontent.com/43216053/127352670-c7ec4496-4283-4909-acb7-316cc4b45aa0.png)

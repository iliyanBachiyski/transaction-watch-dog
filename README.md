# Transaction watch dog

Ruling system that is monitoring all Ethereum transactions. Every transaction is tested against a rule set called dynamic configuration. If it is matching all of the rules, the transaction is stored to the database. Foreign key to the configuration is also stored to the transaction.

**Important: When new configuration comes up, it is loaded without the need of restart.\
Important: After restart the latest configuration will be used.\
Important: After restart the latest configuration will be used.\
Important: Possible issues with DB connection because of the IP restrictions.**

## How to start the application:

#### In the project directory, you can run:

### `npm install`

##### Install all necessary dependencies

### `npm start`

##### Runs the application on port 8080. Also, initialize DB connection.

## Available API Endpoints

### `[GET] /transactions`

##### Returning all transactions, which were saved based on the dynamic configuration.

**Respone:**

    {
       "result":[
          {
             "transactionHash":"string",
             "configuration":{
                "fromAddress":"string | null",
                "toAddress":"string | null",
                "minBlockNumber":"number | null",
                "minTransactionValue":"number | null",
                "maxTransactionValue":"number | null",
                "isLatest":"boolean",
                "created_at":"Date",
                "id":"uuid"
             },
             "created_at":"Date",
             "id":"uuid"
          }
       ],
       "count":1
    }

### `[GET] /transactions/${id}`

##### Returning a single transaction, based on id.

**Respone:**

    {
       "transactionHash":"string",
       "configuration":{
          "fromAddress":"string | null",
          "toAddress":"string | null",
          "minBlockNumber":"number | null",
          "minTransactionValue":"number | null",
          "maxTransactionValue":"number | null",
          "isLatest":"boolean",
          "created_at":"Date",
          "id":"uuid"
       },
       "created_at":"Date",
       "id":"uuid"
    }

### `[POST] /configuration`

##### Create a dynamic configurations.

**Body:**

    {
      "fromAddress":"string | null",
      "toAddress":"string | null",
      "minBlockNumber":"number | null",
      "minTransactionValue":"number | null",
      "maxTransactionValue":"number | null",
    }

**Respone:**

    {
        "id": uuid
    }

### `[GET] /configuration`

##### Returning all dynamic configurations.

**Respone:**

    {
       "result":[
          {
             "fromAddress":"string | null",
             "toAddress":"string | null",
             "minBlockNumber":"number | null",
             "minTransactionValue":"number | null",
             "maxTransactionValue":"number | null",
             "isLatest":"boolean",
             "created_at":"Date",
             "id":"uuid"
          }
       ],
       "count":1
    }

### `[GET] /configuration/${id}`

##### Returning a single configuration, based on id.

**Respone:**

    {
       "fromAddress":"string | null",
       "toAddress":"string | null",
       "minBlockNumber":"number | null",
       "minTransactionValue":"number | null",
       "maxTransactionValue":"number | null",
       "isLatest":"boolean",
       "created_at":"Date",
       "id":"uuid"
    }

**The application is using Infura as a Ethereum Native Node Provider. Web3.js is using for to interact with the remote node using HTTP and WebSocket.**

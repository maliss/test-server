**Installing**
----

Server:

```bash
$ npm install
$ npm start
```

Application:

```bash
$ npm install
$ npm start
```

**API design**
----
  Returns data for a single game

* **URL**

  /

* **Method:**

  `Websocket`

* **Data Params**

    `gameId=[string]`
    `name=[string]`
    `viewCount=[number]`
    `boxArt=[string]`
    `numberStreamers=[number]`

* **Sample Call:**

  ```javascript
    const subject = webSocket("ws://localhost:8999");

    subject.subscribe(
        msg => console.log(msg),
        err => console.log(err), 
        () => console.log('complete') 
    );
  ```
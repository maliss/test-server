**Description**
----

The twitch api endpoint do not allow to fetch directly a game for it's view count.

To solve this, the server fetch all the streamers for each of the 3 games and get the total of view from each streamer. Then broadcast in realtime for each game.

**Online exemple**
----

My free dyno are probably on sleep for the first time, please wait and refresh the page for the backend to start
Application : [Link](https://test-ubisoft-app.herokuapp.com/)

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

**Bugs**
----

Twitch api cursor are sometime invalid for game with a lot of streamers. Also when you hit the last page of the api, twitch do not remove the cursor.

**Test**
----

Server:

```bash
$ npm test
```

Application:

```bash
$ npm test
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
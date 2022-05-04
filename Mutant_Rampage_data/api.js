

// local <= game call the API
const local = {
  game_end(o){
    // o = {score:##, name:##, email:#@#}
    G.wait=true;// put the game in wait state
    scoreboard=undefined;
    // call the api
    api.game_end(o, callback.game_end)

  }
};

/// local <= api send back the data from the server(data should be object)
const callback = {
  game_end(ns){
    G.wait=false;// end the wait state in the game
    scoreboard = ns;
  }
};

/* edit this part only */
// local <= here is the API(you will need to edit this code)
const api = {
  game_end(o, cb){
    // send ajax to server
    // server return back the scoreboard..... ex:new_scoreboard
    // callback cb(new_scoreboard);
    var new_scoreboard = [
      {name:"Mike",score:310},
      {name:"Lucy",score:200},
      {name:"Jhon",score:190},
      {name:"ccc",score:110},
      {name:"ccc",score:110},
      {name:"ccc",score:110},
      {name:"ccc",score:110},
      {name:"ccc",score:110},
      {name:"ccc",score:110},
      {name:"ccc",score:110},
    ];
    callback.game_end(new_scoreboard);
  }
};

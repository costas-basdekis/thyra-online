(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{219:function(e,t,a){e.exports=a(386)},224:function(e,t,a){},226:function(e,t,a){},227:function(e,t,a){},386:function(e,t,a){"use strict";a.r(t);var n,r=a(0),l=a.n(r),s=a(44),i=a.n(s),o=(a(224),a(14)),c=a(67),u=a(28),m=a(24),v=a(53),h=a(50),E=a(54),d=(a(225),a(391)),y=a(128),p=a(398),f=a(395),O=a(392),b=a(387),M=a(393),k=a(396),g=a(68),_=a(32),R=a(397),P=(a(226),a(20)),w=function(){function e(t,a,n,r,l){var s=this;if(Object(u.a)(this,e),!t||!a)throw new Error("You need to pass cells, status, and previous game");this.previous=n,this.history=(this.previous?this.previous.history:[]).filter(function(e){return!e.canUndo}).concat([this]),this.fullHistory=(this.previous?this.previous.fullHistory:[]).concat(this),this.isNextMove=l,this.moveCount=this.previous?l?this.previous.moveCount+1:this.previous.moveCount:1,this.chainCount=this.previous?this.previous.chainCount+1:0,this.lastMove=r,this.cells=t,this.allCells=Object.values(this.cells).map(function(e){return Object.values(e)}).reduce(function(e,t){return e.concat(t)}),this.rowsAndColumns=this.constructor.ROWS.map(function(e){return{y:e,cells:s.constructor.COLUMNS.map(function(t){return s.cells[e][t]})}});var i=a.nextPlayer,o=a.moveType,c=a.availableMoves,m=a.canUndo,v=a.resignedPlayer;this.nextPlayer=i,this.moveType=o,this.availableMoves=c,this.canUndo=m,this.resignedPlayer=v,this.winner=this.getWinner(),this.winner?this.finished=!0:this.hasAvailableMove(this.availableMoves)?this.finished=!1:(this.finished=!0,this.winner=this.constructor.OTHER_PLAYER[this.nextPlayer]),this.finished&&(this.availableMoves=this.constructor.noMovesAreAvailable())}return Object(m.a)(e,[{key:"createStep",value:function(e,t,a){return new this.constructor(e,t,this,a,!1)}},{key:"createNext",value:function(e,t,a){return new this.constructor(e,t,this,a,!0)}}],[{key:"create",value:function(){return new this(this.getInitialCells(),this.getInitialStatus(),null,null,!1)}}]),Object(m.a)(e,[{key:"serialize",value:function(){return{cells:this.cells,status:{nextPlayer:this.nextPlayer,moveType:this.moveType,availableMoves:this.availableMoves,canUndo:this.canUndo,resignedPlayer:this.resignedPlayer},previous:this.previous?this.previous.serialize():null,lastMove:this.lastMove,isNextMove:this.isNextMove}}},{key:"checkCoordinatesAreValid",value:function(e){var t=e.x,a=e.y;if(Math.floor(t)!==t||Math.floor(a)!==a)throw new Error("Coordinates '".concat(JSON.stringify({x:t,y:a}),"' are not valid"));if(void 0===this.availableMoves[a]||void 0===this.availableMoves[a][t])throw new Error("Coordinates '".concat(JSON.stringify({x:t,y:a}),"' are out of bounds"))}},{key:"getAvailableCoordinates",value:function(){return(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.availableMoves).map(function(e,t){return e.map(function(e,a){return e?{x:a,y:t}:null}).filter(function(e){return e})}).reduce(function(e,t){return e.concat(t)})}},{key:"hasAvailableMove",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.availableMoves;return this.getAvailableCoordinates(e).length>0}},{key:"getWinner",value:function(){if(this.resignedPlayer)return this.constructor.OTHER_PLAYER[this.resignedPlayer];var e=this.allCells.find(function(e){return e.player&&3===e.level});return e?e.player:null}},{key:"getEmptyCellsAvailableMoves",value:function(e){var t=this;return this.constructor.ROWS.map(function(a){return t.constructor.COLUMNS.map(function(t){return!e[a][t].player})})}},{key:"getPlayerAvailableMoves",value:function(e,t){var a=this;return this.constructor.ROWS.map(function(n){return a.constructor.COLUMNS.map(function(r){return e[n][r].player===t&&a.hasAvailableMove(a.getMovableAvailableMoves(e,{x:r,y:n}))})})}},{key:"getMovableAvailableMoves",value:function(e,t){var a=this,n=e[t.y][t.x].level+1;return this.constructor.ROWS.map(function(r){return a.constructor.COLUMNS.map(function(a){return Math.abs(a-t.x)<=1&&Math.abs(r-t.y)<=1&&!e[r][a].player&&e[r][a].level<=3&&e[r][a].level<=n})})}},{key:"getBuildableAvailableMoves",value:function(e,t){var a=this;return this.constructor.ROWS.map(function(n){return a.constructor.COLUMNS.map(function(a){return Math.abs(a-t.x)<=1&&Math.abs(n-t.y)<=1&&!e[n][a].player&&e[n][a].level<4})})}},{key:"checkCanMakeMove",value:function(e,t,a){if(this.finished)throw new Error("The game has already finished");if(this.moveType!==e)throw new Error('You cannot perform move of type "'.concat(e,'": you need to perform "').concat(this.moveType,'"'));if(this.checkCoordinatesAreValid(t),a&&this.checkCoordinatesAreValid(a),!this.availableMoves[t.y][t.x])throw new Error("Move ".concat(JSON.stringify(t)," is not one of the available ones"))}},{key:"resign",value:function(e){return this.createStep(this.cells,{nextPlayer:this.nextPlayer,moveType:this.moveType,availableMoves:this.availableMoves,canUndo:!1,resignedPlayer:e},null)}},{key:"makeMove",value:function(e){var t,a=(t={},Object(o.a)(t,this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,this.placeFirstWorker),Object(o.a)(t,this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,this.placeSecondWorker),Object(o.a)(t,this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,this.selectWorkerToMove),Object(o.a)(t,this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER,this.moveFirstWorker),Object(o.a)(t,this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,this.moveSecondWorker),Object(o.a)(t,this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,this.buildAroundWorker),t)[this.moveType];if(!a)throw new Error("Don't know how to perform move of type \"".concat(this.moveType,'"'));return a.bind(this)(e)}},{key:"undo",value:function(){if(!this.canUndo)throw new Error("Cannot undo");return this.previous}},{key:"placeFirstWorker",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,{x:t,y:a});var n=Object(P.a)({},this.cells,Object(o.a)({},a,Object(P.a)({},this.cells[a],Object(o.a)({},t,Object(P.a)({},this.cells[a][t],{player:this.nextPlayer,worker:this.constructor.WORKER_FIRST})))));return this.createStep(n,{nextPlayer:this.nextPlayer,moveType:this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,availableMoves:this.getEmptyCellsAvailableMoves(n),canUndo:!0,resignedPlayer:null},{x:t,y:a})}},{key:"placeSecondWorker",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,{x:t,y:a});var n=Object(P.a)({},this.cells,Object(o.a)({},a,Object(P.a)({},this.cells[a],Object(o.a)({},t,Object(P.a)({},this.cells[a][t],{player:this.nextPlayer,worker:this.constructor.WORKER_SECOND}))))),r=this.constructor.OTHER_PLAYER[this.nextPlayer];return this.createNext(n,{nextPlayer:r,moveType:r===this.constructor.PLAYER_A?this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE:this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,availableMoves:r===this.constructor.PLAYER_A?this.getPlayerAvailableMoves(n,r):this.getEmptyCellsAvailableMoves(n),canUndo:!1,resignedPlayer:null},{x:t,y:a})}},{key:"selectWorkerToMove",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,{x:t,y:a});var n=this.cells[a][t];return this.createStep(this.cells,{nextPlayer:this.nextPlayer,moveType:n.worker===this.constructor.WORKER_FIRST?this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER:this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,availableMoves:this.getMovableAvailableMoves(this.cells,{x:t,y:a}),canUndo:!0,resignedPlayer:null},{x:t,y:a})}},{key:"moveWorker",value:function(e,t){var a=this,n=this.allCells.find(function(e){return e.player===a.nextPlayer&&e.worker===t}),r=this.cells[e.y][e.x],l=Object(P.a)({},this.cells,Object(o.a)({},n.y,Object(P.a)({},this.cells[n.y],Object(o.a)({},n.x,Object(P.a)({},n,{player:null,worker:null})))));return l=Object(P.a)({},l,Object(o.a)({},e.y,Object(P.a)({},l[e.y],Object(o.a)({},e.x,Object(P.a)({},r,{player:n.player,worker:n.worker}))))),this.createStep(l,{nextPlayer:this.nextPlayer,moveType:this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,availableMoves:this.getBuildableAvailableMoves(l,e),canUndo:!0,resignedPlayer:null},{x:e.x,y:e.y})}},{key:"moveFirstWorker",value:function(e){var t=e.x,a=e.y;return this.checkCanMakeMove(this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER,{x:t,y:a}),this.moveWorker({x:t,y:a},this.constructor.WORKER_FIRST)}},{key:"moveSecondWorker",value:function(e){var t=e.x,a=e.y;return this.checkCanMakeMove(this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,{x:t,y:a}),this.moveWorker({x:t,y:a},this.constructor.WORKER_SECOND)}},{key:"buildAroundWorker",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,{x:t,y:a});var n=Object(P.a)({},this.cells,Object(o.a)({},a,Object(P.a)({},this.cells[a],Object(o.a)({},t,Object(P.a)({},this.cells[a][t],{level:this.cells[a][t].level+1}))))),r=this.constructor.OTHER_PLAYER[this.nextPlayer];return this.createNext(n,{nextPlayer:r,moveType:this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,availableMoves:this.getPlayerAvailableMoves(n,r),canUndo:!1,resignedPlayer:null},{x:t,y:a})}}],[{key:"deserialize",value:function(e){var t=e.cells,a=e.status,n=e.previous,r=e.lastMove,l=e.isNextMove;return n&&(n=this.deserialize(n)),new this(t,a,n,r,l)}},{key:"getInitialCells",value:function(){var e={},t=!0,a=!1,n=void 0;try{for(var r,l=this.ROWS[Symbol.iterator]();!(t=(r=l.next()).done);t=!0){var s=r.value;e[s]={};var i=!0,o=!1,c=void 0;try{for(var u,m=this.COLUMNS[Symbol.iterator]();!(i=(u=m.next()).done);i=!0){var v=u.value;e[s][v]={x:v,y:s,player:null,worker:null,level:0}}}catch(h){o=!0,c=h}finally{try{i||null==m.return||m.return()}finally{if(o)throw c}}}}catch(h){a=!0,n=h}finally{try{t||null==l.return||l.return()}finally{if(a)throw n}}return e}},{key:"getInitialStatus",value:function(){return{nextPlayer:this.PLAYER_A,moveType:this.MOVE_TYPE_PLACE_FIRST_WORKER,finished:!1,winner:null,availableMoves:this.allMovesAreAvailable(),canUndo:!1}}},{key:"allMovesAreAvailable",value:function(){var e=this;return this.ROWS.map(function(){return e.COLUMNS.map(function(){return!0})})}},{key:"noMovesAreAvailable",value:function(){var e=this;return this.ROWS.map(function(){return e.COLUMNS.map(function(){return!1})})}}]),e}();w.PLAYER_A="player-a",w.PLAYER_B="player-b",w.PLAYERS=[w.PLAYER_A,w.PLAYER_B],w.OTHER_PLAYER=(n={},Object(o.a)(n,w.PLAYER_A,w.PLAYER_B),Object(o.a)(n,w.PLAYER_B,w.PLAYER_A),n),w.WORKER_FIRST="first-worker",w.WORKER_SECOND="second-worker",w.MOVE_TYPE_PLACE_FIRST_WORKER="place-first-worker",w.MOVE_TYPE_PLACE_SECOND_WORKER="place-second-worker",w.MOVE_TYPE_SELECT_WORKER_TO_MOVE="select-worker-to-move",w.MOVE_TYPE_MOVE_FIRST_WORKER="move-first-worker",w.MOVE_TYPE_MOVE_SECOND_WORKER="move-second-worker",w.MOVE_TYPE_BUILD_AROUND_WORKER="build-around-worker",w.ROWS=Array.from({length:5},function(e,t){return t}),w.COLUMNS=Array.from({length:5},function(e,t){return t});var S=w,C=(a(227),a(3)),T=a.n(C),A=function(e){function t(){var e,a;Object(u.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(a=Object(v.a)(this,(e=Object(h.a)(t)).call.apply(e,[this].concat(r)))).makeMove=function(e){a.props.makeMove(a.props.game.makeMove({x:e.x,y:e.y}))},a.onSelect=function(){a.props.onSelect(a.props.game)},a}return Object(E.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this,t=this.props,a=t.game,n=t.small,r=t.makeMove,s=t.onSelect,i=t.selected,o=t.allowControl.includes(a.nextPlayer);return l.a.createElement("div",{className:T()("background",{small:n,editable:!!r&&o,selectable:!!s,selected:i}),onClick:s?this.onSelect:null},a.rowsAndColumns.map(function(t){return l.a.createElement("div",{key:"row-".concat(t.y),className:"row"},t.cells.map(function(t){var n=a.availableMoves[t.y][t.x];return l.a.createElement("div",{key:"row-".concat(t.x,"-").concat(t.y),className:T()("cell","level-".concat(t.level),{available:n}),onClick:e.props.makeMove&&n&&o?function(){return e.makeMove(t)}:null},l.a.createElement("div",{className:T()("level","level-1")},l.a.createElement("div",{className:T()("level","level-2")},l.a.createElement("div",{className:T()("level","level-3")},t.player?l.a.createElement("div",{className:T()("worker","player-".concat(t.player))}):4===t.level?l.a.createElement("div",{className:T()("level","level-4")}):null))))}))}))}}]),t}(r.Component);A.defaultProps={small:!1,selected:!1,allowControl:[S.PLAYER_A,S.PLAYER_B]};var x,W,j=A,U=a(394),L=function(e){function t(){var e,a;Object(u.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(a=Object(v.a)(this,(e=Object(h.a)(t)).call.apply(e,[this].concat(r)))).state={selectedGame:null,game:a.props.game},a.makeMove=function(e){a.props.submit?a.setState({game:e}):a.props.makeMove(e)},a.takeMoveBack=function(){a.makeMove(a.state.game.previous)},a.undo=function(){a.makeMove(a.state.game.undo())},a.newGame=function(){a.makeMove(S.create())},a.selectGame=function(e){a.setState({selectedGame:e===a.state.game?null:e})},a.makeMoveToSelected=function(e){a.selectGame(e)},a.takeMoveBackToSelected=function(){a.selectGame(a.state.selectedGame.previous)},a.undoToSelected=function(){a.selectGame(a.state.selectedGame.undo())},a.deselectGame=function(){a.selectGame(null)},a.submit=function(){var e=a.state.game.fullHistory,t=e.findIndex(function(e){return e===a.props.game}),n=e.slice(t+1),r=n.map(function(e){return e.lastMove});console.log("Submitting moves",{history:e,propsGameIndex:t,newHistory:n,moves:r}),a.props.submit(r)},a.resign=function(){a.props.submit("resign")},a}return Object(E.a)(t,e),Object(m.a)(t,[{key:"componentDidUpdate",value:function(e){this.props.game!==e.game&&this.setState({selectedGame:null,game:this.props.game,resigning:!1})}},{key:"render",value:function(){var e=this,t=this.props,a=t.names,n=t.allowControl,s=this.state,i=s.selectedGame,o=s.game,u=i||o,m=n.length>0;return l.a.createElement(r.Fragment,null,l.a.createElement(y.a,null,l.a.createElement(R.a.Group,{widths:"three",size:"tiny"},o.finished?l.a.createElement(R.a,{color:"green",value:a[o.winner],label:"Won!"}):l.a.createElement(R.a,{value:a[o.nextPlayer],label:this.constructor.MOVE_TYPE_NAMES[o.moveType]}),l.a.createElement(R.a,{value:o.moveCount,label:"Move"}),this.props.game.finished?this.props.submit?null:l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.newGame,disabled:!o.previous},"New Game")}):this.props.submit?l.a.createElement(R.a,{value:l.a.createElement(b.a,{positive:!0,onClick:this.submit,disabled:!!i||o===this.props.game||o.nextPlayer===this.props.game.nextPlayer&&!o.finished},"Submit")}):l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.props.submit?this.takeMoveBack:this.undo,disabled:!!i||(this.props.submit?o.chainCount<=this.props.game.chainCount:!o.canUndo)},"Undo")}))),this.props.submit&&m?l.a.createElement(y.a,null,l.a.createElement(R.a.Group,{widths:"two",size:"tiny"},l.a.createElement(R.a,{value:l.a.createElement(U.a,{trigger:l.a.createElement(b.a,{negative:!0,disabled:!!i||this.props.game.finished},"Resign"),header:"Resign?",content:"Are you sure you want to forfeit?",actions:[{key:"resign",content:"Resign",negative:!0,onClick:this.resign},{key:"continue",content:"Continue",positive:!0}]})}),l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.props.submit?this.takeMoveBack:this.undo,disabled:!!i||(this.props.submit?o.chainCount<=this.props.game.chainCount:!o.canUndo)},"Undo")}))):null,l.a.createElement(y.a,{style:{textAlign:"center"}},l.a.createElement(j,{game:u,makeMove:i?this.makeMoveToSelected:this.makeMove,allowControl:n})),l.a.createElement(y.a,null,l.a.createElement("div",null,Object(c.a)(o.history).reverse().map(function(t){return l.a.createElement(j,{key:t.chainCount,game:t,small:!0,onSelect:e.selectGame,selected:t===i})}))),i?l.a.createElement(y.a,{textAlign:"center"},l.a.createElement(p.a,{as:"h2"},"Reviewing previous move"),l.a.createElement(R.a.Group,{widths:"three",size:"small"},i.finished?l.a.createElement(R.a,{color:"green",value:a[i.winner],label:"Won!"}):l.a.createElement(R.a,{value:a[i.nextPlayer],label:this.constructor.MOVE_TYPE_NAMES[i.moveType]}),l.a.createElement(R.a,{value:i.moveCount,label:"Move"}),l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.undoToSelected,disabled:!i.canUndo},"Undo")})),l.a.createElement(R.a.Group,{widths:"two",size:"small"},l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.takeMoveBackToSelected,disabled:!i.previous},"Take Back a Move")}),l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.deselectGame},"Stop reviewing")}))):null,this.props.submit?null:l.a.createElement(y.a,null,l.a.createElement(R.a.Group,{widths:"two",size:"small"},l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.takeMoveBack,disabled:!!i||!o.previous},"Take Back a Move")}),l.a.createElement(R.a,{value:l.a.createElement(b.a,{negative:!0,onClick:this.newGame,disabled:!!i||!o.previous},"New Game")}))))}}]),t}(r.Component);L.MOVE_TYPE_NAMES=(W={},Object(o.a)(W,S.MOVE_TYPE_PLACE_FIRST_WORKER,"Place a worker"),Object(o.a)(W,S.MOVE_TYPE_PLACE_SECOND_WORKER,"Place a worker"),Object(o.a)(W,S.MOVE_TYPE_SELECT_WORKER_TO_MOVE,"Select a worker"),Object(o.a)(W,S.MOVE_TYPE_MOVE_FIRST_WORKER,"Move worker"),Object(o.a)(W,S.MOVE_TYPE_MOVE_SECOND_WORKER,"Move worker"),Object(o.a)(W,S.MOVE_TYPE_BUILD_AROUND_WORKER,"Build"),W),L.defaultProps={names:(x={},Object(o.a)(x,S.PLAYER_A,"Player A"),Object(o.a)(x,S.PLAYER_B,"Player B"),x),allowControl:[S.PLAYER_A,S.PLAYER_B]};var Y=L,G=function(){function e(){var t=this;Object(u.a)(this,e),this.gotUser=function(e){e&&(t.id=e.id,t.password=e.password,localStorage.setItem("user-id",t.id),localStorage.setItem("user-password",t.password)),t.user=e,t.onUser&&t.onUser(e)},this.gotUsers=function(e){t.users=e,t.usersById={};var a=!0,n=!1,r=void 0;try{for(var l,s=t.users[Symbol.iterator]();!(a=(l=s.next()).done);a=!0){var i=l.value;t.usersById[i.id]=i}}catch(o){n=!0,r=o}finally{try{a||null==s.return||s.return()}finally{if(n)throw r}}t.onUsers&&t.onUsers(e,t.usersById)},this.gotGames=function(e){t.games=e,t.onGames&&t.onGames(e)},this.id=localStorage.getItem("user-id")||null,this.password=localStorage.getItem("user-password")||null,window.io||(window.io=function(){return{on:function(){return console.warn("Socket script was missing")},emit:function(){return console.warn("Socket script was missing")},unavailable:!0}}),this.socket=window.io("localhost"===window.location.hostname?"http://localhost:4000":"http://thyra.basdekis.io"),this.available=!this.socket.unavailable,this.socket.on("connect",function(){t.getUser()}),this.socket.on("disconnect",function(){t.gotUser(null),t.gotUsers([])}),this.user=null,this.onUser=null,this.socket.on("user",this.gotUser),this.users=[],this.usersById={},this.onUsers=null,this.socket.on("users",this.gotUsers),this.games=[],this.onGames=null,this.socket.on("games",this.gotGames),this.getUser()}return Object(m.a)(e,[{key:"getUser",value:function(){this.socket.emit("create-user",{id:this.id,password:this.password})}},{key:"changeUsername",value:function(e){this.socket.emit("change-username",e)}},{key:"changeReadyToPlay",value:function(e){this.socket.emit("change-ready-to-play",!!e)}},{key:"submitGameMove",value:function(e,t){this.socket.emit("submit-game-moves",{id:e.id,moves:t})}}]),e}(),I=new G,V=function(e){function t(){var e,a;Object(u.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(a=Object(v.a)(this,(e=Object(h.a)(t)).call.apply(e,[this].concat(r)))).state={game:S.create(),user:I.user,username:I.user?I.user.name:null,users:I.users,usersById:I.usersById,games:I.games,liveGame:null,liveGameGame:null},a.makeMove=function(e){a.setState({game:e})},a.changeUsername=function(e){var t=e.target.value;a.setState({username:t})},a.updateUsername=function(){I.changeUsername(a.state.username)},a.changeReadyToPlay=function(e,t){var a=t.checked;I.changeReadyToPlay(a)},a.selectLiveGame=function(e){a.setState({liveGame:e,liveGameGame:S.deserialize(e.game)})},a.submit=function(e){I.submitGameMove(a.state.liveGame,e)},a}return Object(E.a)(t,e),Object(m.a)(t,[{key:"componentDidMount",value:function(){var e=this;I.onUser=function(t){e.setState({user:t,username:t?t.name:null}),t||e.setState({users:[],usersById:{},games:[],liveGame:null,liveGameGame:null})},I.onUsers=function(t,a){if(e.state.user){var n=t.findIndex(function(t){return t.id===e.state.user.id});n>=0&&(t=[t[n]].concat(Object(c.a)(t.slice(0,n)),Object(c.a)(t.slice(n+1))))}e.setState({users:t,usersById:a})},I.onGames=function(t){if(e.setState({games:t}),e.state.liveGame){var a=e.state.games.find(function(t){return t.id===e.state.liveGame.id});console.log("got games",e.state.liveGame,a),a?a.chainCount===e.state.liveGame.chainCount&&a.finished===e.state.liveGame.finished||e.setState({liveGame:a,liveGameGame:S.deserialize(a.game)}):e.setState({liveGame:null,liveGameGame:null})}}}},{key:"componentWillUnmount",value:function(){I.onUser=null,I.onUsers=null,I.onGames=null}},{key:"render",value:function(){var e=this,t=this.state,a=t.game,n=t.user,s=t.username,i=t.users,c=t.usersById,u=t.games,m=t.liveGame,v=t.liveGameGame,h=i.filter(function(e){return e.online}),E=u.filter(function(e){return!e.finished}),P=u.filter(function(e){return e.finished});return l.a.createElement(d.a,{text:!0},l.a.createElement(y.a,{textAlign:"center"},l.a.createElement(p.a,{as:"h1"},"Thyra Online")),l.a.createElement(f.a,{menu:{pointing:!0},panes:[I.available?{menuItem:"Lobby",render:function(){return l.a.createElement(f.a.Pane,{attached:!1},n?l.a.createElement(r.Fragment,null,"Welcome",l.a.createElement(O.a,{value:s,onChange:e.changeUsername}),l.a.createElement(b.a,{onClick:e.updateUsername},"Change"),l.a.createElement("br",null),l.a.createElement(M.a,{label:"Ready to play?",checked:n.readyToPlay,onChange:e.changeReadyToPlay}),l.a.createElement(f.a,{menu:{pointing:!0},panes:[{menuItem:"".concat(h.length," users online"),render:function(){return l.a.createElement(k.a,{bulleted:!0},h.map(function(e){return l.a.createElement(k.a.Item,{key:e.id},e.name,e.id===n.id?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null,e.readyToPlay?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"checkmark",color:"green"}),"Ready to play"):null)}))}},{menuItem:"".concat(E.length," live games"),render:function(){return l.a.createElement(k.a,{bulleted:!0},E.map(function(t){var a=c[t.userIds[0]],r=c[t.userIds[1]],s=a.id===n.id,i=r.id===n.id,o=s||i;return l.a.createElement(k.a.Item,{key:t.id},a.name," ",s?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null," vs ",r.name," ",i?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null,l.a.createElement(b.a,{onClick:function(){return e.selectLiveGame(t)}},o?"Play":"Spectate"))}))}},{menuItem:"".concat(P.length," past games"),render:function(){return l.a.createElement(k.a,{bulleted:!0},P.map(function(t){var a=c[t.userIds[0]],r=c[t.userIds[1]],s=a.id===n.id,i=r.id===n.id;return l.a.createElement(k.a.Item,{key:t.id},a.name,s?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null,t.finished&&s&&t.winnerUserId===n.id?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"trophy"}),"Winner"):null," vs ",r.name,i?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null,t.finished&&s&&t.winnerUserId===n.id?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"trophy"}),"Winner"):null,l.a.createElement(b.a,{onClick:function(){return e.selectLiveGame(t)}},"Review"))}))}}]})):"Connecting to server...")}}:null,I.available?{menuItem:m?m.finished?"Review":n&&m.userIds.includes(n.id)?"Live Play":"Spectate":"Live Play/Spectate/Review",render:function(){var t;if(!m||!n)return l.a.createElement(y.a,null,"Choose a game from the lobby");var a=c[m.userIds[0]],s=c[m.userIds[1]],i=a.id===n.id,u=s.id===n.id,h=i?S.PLAYER_A:u?S.PLAYER_B:null;return l.a.createElement(r.Fragment,null,l.a.createElement(y.a,null,l.a.createElement(R.a.Group,{widths:"three",size:"tiny"},l.a.createElement(R.a,{value:a.name,label:i?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null,color:i?"green":void 0}),l.a.createElement(R.a,{label:"vs"}),l.a.createElement(R.a,{value:s.name,label:u?l.a.createElement(g.a,null,l.a.createElement(_.a,{name:"user"}),"Me"):null,color:u?"green":void 0}))),l.a.createElement(Y,{game:v,names:(t={},Object(o.a)(t,S.PLAYER_A,a.name),Object(o.a)(t,S.PLAYER_B,s.name),t),allowControl:[h].filter(function(e){return e}),submit:e.submit}))}}:null,{menuItem:"Hotseat",render:function(){return l.a.createElement(f.a.Pane,{attached:!1},l.a.createElement(Y,{game:a,makeMove:e.makeMove}))}}].filter(function(e){return e})}))}}]),t}(r.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(l.a.createElement(V,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[219,1,2]]]);
//# sourceMappingURL=main.c40ab2f3.chunk.js.map
(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{133:function(e,t,a){e.exports=a(262)},138:function(e,t,a){},140:function(e,t,a){},141:function(e,t,a){},262:function(e,t,a){"use strict";a.r(t);var r,n=a(0),o=a.n(n),l=a(29),i=a.n(l),c=(a(138),a(26)),s=a(24),u=a(35),v=a(34),h=a(36),E=(a(139),a(268)),O=a(271),_=a(273),y=(a(140),a(17)),M=a(7),m=function(){function e(t,a,r,n){var o=this;if(Object(c.a)(this,e),!t||!a)throw new Error("You need to pass cells, status, and previous game");this.previous=r,this.moveCount=this.previous?n?this.previous.moveCount+1:this.previous.moveCount:1,this.chainCount=this.previous?this.previous.chainCount+1:0,this.cells=t,this.allCells=Object.values(this.cells).map(function(e){return Object.values(e)}).reduce(function(e,t){return e.concat(t)}),this.rowsAndColumns=this.constructor.ROWS.map(function(e){return{y:e,cells:o.constructor.COLUMNS.map(function(t){return o.cells[e][t]})}});var l=a.nextPlayer,i=a.moveType,s=a.availableMoves,u=a.canUndo;this.nextPlayer=l,this.moveType=i,this.availableMoves=s,this.canUndo=u,this.winner=this.getWinner(),this.winner?this.finished=!0:this.hasAvailableMove(this.availableMoves)?this.finished=!1:(this.finished=!0,this.winner=this.constructor.OTHER_PLAYER[this.nextPlayer]),this.finished&&(this.availableMoves=this.constructor.noMovesAreAvailable())}return Object(s.a)(e,[{key:"createStep",value:function(e,t){return new this.constructor(e,t,this,!1)}},{key:"createNext",value:function(e,t){return new this.constructor(e,t,this,!0)}}],[{key:"create",value:function(){return new this(this.getInitialCells(),this.getInitialStatus(),null,!1)}}]),Object(s.a)(e,[{key:"checkCoordinatesAreValid",value:function(e){var t=e.x,a=e.y;if(Math.floor(t)!==t||Math.floor(a)!==a)throw new Error("Coordinates '".concat(JSON.stringify({x:t,y:a}),"' are not valid"));if(void 0===this.availableMoves[a]||void 0===this.availableMoves[a][t])throw new Error("Coordinates '".concat(JSON.stringify({x:t,y:a}),"' are out of bounds"))}},{key:"getAvailableCoordinates",value:function(){return(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.availableMoves).map(function(e,t){return e.map(function(e,a){return e?{x:a,y:t}:null}).filter(function(e){return e})}).reduce(function(e,t){return e.concat(t)})}},{key:"hasAvailableMove",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.availableMoves;return this.getAvailableCoordinates(e).length>0}},{key:"getWinner",value:function(){var e=this.allCells.find(function(e){return e.player&&3===e.level});return e?e.player:null}},{key:"getEmptyCellsAvailableMoves",value:function(e){var t=this;return this.constructor.ROWS.map(function(a){return t.constructor.COLUMNS.map(function(t){return!e[a][t].player})})}},{key:"getPlayerAvailableMoves",value:function(e,t){var a=this;return this.constructor.ROWS.map(function(r){return a.constructor.COLUMNS.map(function(n){return e[r][n].player===t&&a.hasAvailableMove(a.getMovableAvailableMoves(e,{x:n,y:r}))})})}},{key:"getMovableAvailableMoves",value:function(e,t){var a=this,r=e[t.y][t.x].level+1;return this.constructor.ROWS.map(function(n){return a.constructor.COLUMNS.map(function(a){return Math.abs(a-t.x)<=1&&Math.abs(n-t.y)<=1&&!e[n][a].player&&e[n][a].level<=3&&e[n][a].level<=r})})}},{key:"getBuildableAvailableMoves",value:function(e,t){var a=this;return this.constructor.ROWS.map(function(r){return a.constructor.COLUMNS.map(function(a){return Math.abs(a-t.x)<=1&&Math.abs(r-t.y)<=1&&!e[r][a].player&&e[r][a].level<4})})}},{key:"checkCanMakeMove",value:function(e,t,a){if(this.finished)throw new Error("The game has already finished");if(this.moveType!==e)throw new Error('You cannot perform move of type "'.concat(e,'": you need to perform "').concat(this.moveType,'"'));if(this.checkCoordinatesAreValid(t),a&&this.checkCoordinatesAreValid(a),!this.availableMoves[t.y][t.x])throw new Error("Move ".concat(JSON.stringify(t)," is not one of the available ones"))}},{key:"makeMove",value:function(e){var t,a=(t={},Object(M.a)(t,this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,this.placeFirstWorker),Object(M.a)(t,this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,this.placeSecondWorker),Object(M.a)(t,this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,this.selectWorkerToMove),Object(M.a)(t,this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER,this.moveFirstWorker),Object(M.a)(t,this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,this.moveSecondWorker),Object(M.a)(t,this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,this.buildAroundWorker),t)[this.moveType];if(!a)throw new Error("Don't know how to perform move of type \"".concat(this.moveType,'"'));return a.bind(this)(e)}},{key:"undo",value:function(){if(!this.canUndo)throw new Error("Cannot undo");return this.previous}},{key:"placeFirstWorker",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,{x:t,y:a});var r=Object(y.a)({},this.cells,Object(M.a)({},a,Object(y.a)({},this.cells[a],Object(M.a)({},t,Object(y.a)({},this.cells[a][t],{player:this.nextPlayer,worker:this.constructor.WORKER_FIRST})))));return this.createStep(r,{nextPlayer:this.nextPlayer,moveType:this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,availableMoves:this.getEmptyCellsAvailableMoves(r),canUndo:!0})}},{key:"placeSecondWorker",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,{x:t,y:a});var r=Object(y.a)({},this.cells,Object(M.a)({},a,Object(y.a)({},this.cells[a],Object(M.a)({},t,Object(y.a)({},this.cells[a][t],{player:this.nextPlayer,worker:this.constructor.WORKER_SECOND}))))),n=this.constructor.OTHER_PLAYER[this.nextPlayer];return this.createStep(r,{nextPlayer:n,moveType:n===this.constructor.PLAYER_A?this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE:this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,availableMoves:n===this.constructor.PLAYER_A?this.getPlayerAvailableMoves(r,n):this.getEmptyCellsAvailableMoves(r),canUndo:!1})}},{key:"selectWorkerToMove",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,{x:t,y:a});var r=this.cells[a][t];return this.createStep(this.cells,{nextPlayer:this.nextPlayer,moveType:r.worker===this.constructor.WORKER_FIRST?this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER:this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,availableMoves:this.getMovableAvailableMoves(this.cells,{x:t,y:a}),canUndo:!0})}},{key:"moveWorker",value:function(e,t){var a=this,r=this.allCells.find(function(e){return e.player===a.nextPlayer&&e.worker===t}),n=this.cells[e.y][e.x],o=Object(y.a)({},this.cells,Object(M.a)({},r.y,Object(y.a)({},this.cells[r.y],Object(M.a)({},r.x,Object(y.a)({},r,{player:null,worker:null})))));return o=Object(y.a)({},o,Object(M.a)({},e.y,Object(y.a)({},o[e.y],Object(M.a)({},e.x,Object(y.a)({},n,{player:r.player,worker:r.worker}))))),this.createStep(o,{nextPlayer:this.nextPlayer,moveType:this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,availableMoves:this.getBuildableAvailableMoves(o,e),canUndo:!0})}},{key:"moveFirstWorker",value:function(e){var t=e.x,a=e.y;return this.checkCanMakeMove(this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER,{x:t,y:a}),this.moveWorker({x:t,y:a},this.constructor.WORKER_FIRST)}},{key:"moveSecondWorker",value:function(e){var t=e.x,a=e.y;return this.checkCanMakeMove(this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,{x:t,y:a}),this.moveWorker({x:t,y:a},this.constructor.WORKER_SECOND)}},{key:"buildAroundWorker",value:function(e){var t=e.x,a=e.y;this.checkCanMakeMove(this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,{x:t,y:a});var r=Object(y.a)({},this.cells,Object(M.a)({},a,Object(y.a)({},this.cells[a],Object(M.a)({},t,Object(y.a)({},this.cells[a][t],{level:this.cells[a][t].level+1}))))),n=this.constructor.OTHER_PLAYER[this.nextPlayer];return this.createNext(r,{nextPlayer:n,moveType:this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,availableMoves:this.getPlayerAvailableMoves(r,n),canUndo:!1})}}],[{key:"getInitialCells",value:function(){var e={},t=!0,a=!1,r=void 0;try{for(var n,o=this.ROWS[Symbol.iterator]();!(t=(n=o.next()).done);t=!0){var l=n.value;e[l]={};var i=!0,c=!1,s=void 0;try{for(var u,v=this.COLUMNS[Symbol.iterator]();!(i=(u=v.next()).done);i=!0){var h=u.value;e[l][h]={x:h,y:l,player:null,worker:null,level:0}}}catch(E){c=!0,s=E}finally{try{i||null==v.return||v.return()}finally{if(c)throw s}}}}catch(E){a=!0,r=E}finally{try{t||null==o.return||o.return()}finally{if(a)throw r}}return e}},{key:"getInitialStatus",value:function(){return{nextPlayer:this.PLAYER_A,moveType:this.MOVE_TYPE_PLACE_FIRST_WORKER,finished:!1,winner:null,availableMoves:this.allMovesAreAvailable(),canUndo:!1}}},{key:"allMovesAreAvailable",value:function(){var e=this;return this.ROWS.map(function(){return e.COLUMNS.map(function(){return!0})})}},{key:"noMovesAreAvailable",value:function(){var e=this;return this.ROWS.map(function(){return e.COLUMNS.map(function(){return!1})})}}]),e}();m.PLAYER_A="player-a",m.PLAYER_B="player-b",m.PLAYERS=[m.PLAYER_A,m.PLAYER_B],m.OTHER_PLAYER=(r={},Object(M.a)(r,m.PLAYER_A,m.PLAYER_B),Object(M.a)(r,m.PLAYER_B,m.PLAYER_A),r),m.WORKER_FIRST="first-worker",m.WORKER_SECOND="second-worker",m.MOVE_TYPE_PLACE_FIRST_WORKER="place-first-worker",m.MOVE_TYPE_PLACE_SECOND_WORKER="place-second-worker",m.MOVE_TYPE_SELECT_WORKER_TO_MOVE="select-worker-to-move",m.MOVE_TYPE_MOVE_FIRST_WORKER="move-first-worker",m.MOVE_TYPE_MOVE_SECOND_WORKER="move-second-worker",m.MOVE_TYPE_BUILD_AROUND_WORKER="build-around-worker",m.ROWS=Array.from({length:5},function(e,t){return t}),m.COLUMNS=Array.from({length:5},function(e,t){return t});var R,b,f=m,p=(a(141),a(3)),k=a.n(p),d=function(e){function t(){var e,a;Object(c.a)(this,t);for(var r=arguments.length,n=new Array(r),o=0;o<r;o++)n[o]=arguments[o];return(a=Object(u.a)(this,(e=Object(v.a)(t)).call.apply(e,[this].concat(n)))).makeMove=function(e){a.props.makeMove(a.props.game.makeMove({x:e.x,y:e.y}))},a}return Object(h.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this,t=this.props.game;return o.a.createElement("div",{className:"background"},t.rowsAndColumns.map(function(a){return o.a.createElement("div",{key:"row-".concat(a.y),className:"row"},a.cells.map(function(a){var r=t.availableMoves[a.y][a.x];return o.a.createElement("div",{key:"row-".concat(a.x,"-").concat(a.y),className:k()("cell","level-".concat(a.level),{available:r}),onClick:e.props.makeMove&&r?function(){return e.makeMove(a)}:null},o.a.createElement("div",{className:k()("level","level-1")},o.a.createElement("div",{className:k()("level","level-2")},o.a.createElement("div",{className:k()("level","level-3")},a.player?o.a.createElement("div",{className:k()("worker","player-".concat(a.player))}):4===a.level?o.a.createElement("div",{className:k()("level","level-4")}):null))))}))}))}}]),t}(n.Component),P=a(270),A=a(269),T=a(267),w=function(e){function t(){var e,a;Object(c.a)(this,t);for(var r=arguments.length,n=new Array(r),o=0;o<r;o++)n[o]=arguments[o];return(a=Object(u.a)(this,(e=Object(v.a)(t)).call.apply(e,[this].concat(n)))).takeMoveBack=function(){a.props.makeMove(a.props.game.previous)},a.undo=function(){a.props.makeMove(a.props.game.undo())},a.newGame=function(){a.props.makeMove(f.create())},a}return Object(h.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this.props,t=e.game,a=e.makeMove;return o.a.createElement(n.Fragment,null,o.a.createElement(O.a,null,o.a.createElement(P.a.Group,{widths:"three",size:"small"},t.finished?o.a.createElement(P.a,{color:"green",value:this.constructor.PLAYER_NAMES[t.winner],label:"Won!"}):o.a.createElement(P.a,{value:this.constructor.PLAYER_NAMES[t.nextPlayer],label:this.constructor.MOVE_TYPE_NAMES[t.moveType]}),o.a.createElement(P.a,{value:t.moveCount,label:"Move"}),t.finished?o.a.createElement(P.a,{value:o.a.createElement(A.a,{negative:!0,onClick:this.newGame,disabled:!t.previous},"New Game")}):o.a.createElement(P.a,{value:o.a.createElement(A.a,{negative:!0,onClick:this.undo,disabled:!t.canUndo},"Undo")}))),o.a.createElement(T.a,null),o.a.createElement(O.a,{style:{textAlign:"center"}},o.a.createElement(d,{game:t,makeMove:a})),o.a.createElement(O.a,null,o.a.createElement(P.a.Group,{widths:"two",size:"small"},o.a.createElement(P.a,{value:o.a.createElement(A.a,{negative:!0,onClick:this.takeMoveBack,disabled:!t.previous},"Take Back a Move")}),o.a.createElement(P.a,{value:o.a.createElement(A.a,{negative:!0,onClick:this.newGame,disabled:!t.previous},"New Game")}))))}}]),t}(n.Component);w.PLAYER_NAMES=(R={},Object(M.a)(R,f.PLAYER_A,"Player A"),Object(M.a)(R,f.PLAYER_B,"Player B"),R),w.MOVE_TYPE_NAMES=(b={},Object(M.a)(b,f.MOVE_TYPE_PLACE_FIRST_WORKER,"Place a worker"),Object(M.a)(b,f.MOVE_TYPE_PLACE_SECOND_WORKER,"Place a worker"),Object(M.a)(b,f.MOVE_TYPE_SELECT_WORKER_TO_MOVE,"Select a worker"),Object(M.a)(b,f.MOVE_TYPE_MOVE_FIRST_WORKER,"Move worker"),Object(M.a)(b,f.MOVE_TYPE_MOVE_SECOND_WORKER,"Move worker"),Object(M.a)(b,f.MOVE_TYPE_BUILD_AROUND_WORKER,"Build"),b);var C=w,S=function(e){function t(){var e,a;Object(c.a)(this,t);for(var r=arguments.length,n=new Array(r),o=0;o<r;o++)n[o]=arguments[o];return(a=Object(u.a)(this,(e=Object(v.a)(t)).call.apply(e,[this].concat(n)))).state={game:f.create()},a.makeMove=function(e){a.setState({game:e})},a}return Object(h.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this.state.game;return o.a.createElement(E.a,{text:!0},o.a.createElement(O.a,{textAlign:"center"},o.a.createElement(_.a,{as:"h1"},"Thyra Online")),o.a.createElement(C,{game:e,makeMove:this.makeMove}))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(o.a.createElement(S,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[133,1,2]]]);
//# sourceMappingURL=main.be31dfff.chunk.js.map
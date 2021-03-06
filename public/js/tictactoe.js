// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $board, $info, $start, $status, $team, CROSS, NOUGHT, redrawBoard, socket, team, turnTeam, updateText;
    socket = io.connect(appConfig.httpHost);
    team = 0;
    turnTeam = 0;
    CROSS = 1;
    NOUGHT = 2;
    $start = $('#start-game');
    $team = $('#team');
    $info = $('#info');
    $board = $('#board > table');
    $status = $('#status');
    $start.hide();
    updateText = function($block, message) {
      $block.hide();
      $block.html(message);
      return $block.fadeIn();
    };
    redrawBoard = function(board) {
      var html, i, j, k, l, ref, ref1, styleClass, symbol, eclass;
      html = '';
      for (i = k = 0, ref = board.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        html += '<tr>';
        for (j = l = 0, ref1 = board.length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
          styleClass = '';
          if ((i === 0 || i === 1) && j !== 2) {
            eclass = ' borderBR'
          } else if (i === 2 && j !== 2) {
            eclass = ' borderR'
          } else if (j === 2 && i !== 2) {
            eclass = ' borderB'
          } else {
            eclass = ''
          }
          symbol = '';
          if (board[i][j] === CROSS) {
            styleClass = 'cross';
            symbol = 'X';
          } else if (board[i][j] === NOUGHT) {
            styleClass = 'nought';
            symbol = 'O';
          }
          console.log('here', eclass);
          html += "<td --data-x=\"" + i + "\" --data-y=\"" + j + "\" class=\"" + styleClass + eclass + "\">\n  " + symbol + "\n</td>";
          console.log('html', html)
        }
        html += '</tr>';
      }
      return $board.html(html);
    };
    $status.text('Connecting to server...');
    socket.on('connect', function() {
      $start.show();
      updateText($status, 'Connection established');
      return ($('#board')).on('click', 'td', function() {
        var $this;
        $this = $(this);
        if (team !== turnTeam || (($this.attr('class')).indexOf('cross') > -1 || ($this.attr('class')).indexOf('nought') > -1)) {
          return;
        }
        return socket.emit('turn', {
          x: $this.attr('--data-x'),
          y: $this.attr('--data-y')
        });
      });
    });
    socket.on('waitingForOpponent', function() {
      return updateText($status, 'Waiting for opponent...');
    });
    socket.on('gameStarted', function(data) {
      team = data.team;

      updateText($team, "You are playing for " + (team === CROSS ? 'X' : 'O'));
      return updateText($status, 'Game started');
    });
    socket.on('gameStateChanged', function(data) {
      turnTeam = data.currentTeam;
      redrawBoard(data.board);
      return updateText($info, "Now is " + (team === turnTeam ? 'your turn' : 'your opponent\'s turn'));
    });
    socket.on('gameFinished', function(data) {
      var message;
      turnTeam = 0;
      if (data.reason === 'opponentLeaving' && data.team !== team) {
        $info.text('');
        $team.text('');
        return updateText($status, '<span class="bad">Sorry, but your opponent left the game. Try to start new game</span>');
      } else if (data.reason === 'complete') {
        if (data.winner === team) {
          jQuery.ajax({
            type: 'POST',
            url: 'http://10.11.22.10:3001/sendData',
            crossDomain: true,
            data: {
              "score": "1",
              "user": location.search.split('user=')[1],
              "event": "TICTAC"
            },
            dataType: 'json',
            success: function(responseData, textStatus, jqXHR) {
              console.log(responseData);
            },
            error: function(responseData, textStatus, errorThrown) {
              console.log(responseData);
            }
          });
          message = '<span class="good">You win! Added 1 credit to your account^^</span>';
        } else if (data.winner === -1) {
          message = 'Draw! -_- ';
        } else {
          jQuery.ajax({
            type: 'POST',
            url: 'http://10.11.22.10:3001/sendData',
            crossDomain: true,
            data: {
              "score": "-1",
              "user": location.search.split('user=')[1],
              "event": "TICTAC"
            },
            dataType: 'json',
            success: function(responseseData, textStatus, jqXHR) {
              console.log(responseData);
            },
            error: function(responseData, textStatus, errorThrown) {
              console.log(responseData);
            }
          });
          message = '<span class="bad">You lose!  Debited 1 credit from  your account ;_;</span>';
        }
        redrawBoard(data.board);
        return updateText($info, message);
      }
    });
    return $start.click(function() {
      $info.text('');
      $team.text('');
      socket.emit('startGame');
      updateText($status, 'Trying to create new game...');
      return false;
    });
  });

}).call(this);
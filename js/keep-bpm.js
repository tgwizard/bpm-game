(function() {
  var beatTimes = [];
  var countDown = 10;
  var buttonEl = $('#button');
  var countDownEl = $('#count-down');

  var sound = (function(){
    var sine1 = T("sin", {freq:440, mul:0.5});
    var sine2 = T("sin", {freq:660, mul:0.5});
    var sound = T("perc", {r:500}, sine1, sine2).on("ended", function() {
      this.stop();
    });
    return sound;
  })();

  function playPianoSound() {
    sound.bang().play();
  }

  function renderCountDown() {
    var text = 'Click ' + countDown + ' times more';
    if (countDown === 10) {
      text = 'Click ' + countDown + ' times';
    }
    countDownEl.text(text);
  }

  function renderBpm() {
    var bpm = calcBpm();
    countDownEl.html('Your BPM was ' + bpm.bpm + ' (&plusmn;' + bpm.diff + ')');
    buttonEl.text('Again');

    buttonEl.prop('disabled', true);
    buttonEl.addClass('disabled');
    setTimeout(function() {
      buttonEl.prop('disabled', false);
      buttonEl.removeClass('disabled');
    }, 1500);
  }

  function calcBpm() {
    diffs = [];

    _.reduce(_.rest(beatTimes, 1), function(prev, curr) {
      diffs.push(curr - prev);
      return curr;
    }, beatTimes[0]);

    var MS_PER_MIN = 60000;

    var bpms = _.map(diffs, function(diff) {
      return MS_PER_MIN / diff;
    });

    var sumBpm = _.reduce(bpms, function(memo, x) { return memo + x; }, 0);
    var avgBpm = Math.round(sumBpm / bpms.length);
    var diff = _.reduce(bpms, function(maxDiff, bpm) {
      var currDiff = Math.abs(bpm - avgBpm);
      if (currDiff > maxDiff) return currDiff;
      return maxDiff;
    }, 0);
    diff = Math.round(diff);

    return {
      bpm: avgBpm,
      diff: diff
    };
  }

  function reset() {
    beatTimes = [];
    countDown = 10;
    buttonEl.text('Play!');
    renderCountDown();
  }

  function onPlayClick() {
    if (countDown === 0) return reset();

    playPianoSound();
    beatTimes.push(new Date());
    countDown -= 1;

    if (countDown > 0) {
      renderCountDown();
    } else {
      renderBpm();
    }
  }

  buttonEl.on('click', onPlayClick);

  reset();
})();

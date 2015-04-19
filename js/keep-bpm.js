(function() {
  var beatTimes = [];
  var countDown = 10;

  var buttonEl = $('#button');
  var countDownEl = $('#count-down');
  var targetBpmEl = $('#target-bpm');

  var targetBpm = -1;

  var sound = (function(){
    var sine1 = T("sin", {freq:440, mul:0.5});
    var sine2 = T("sin", {freq:660, mul:0.5});
    var sound = T("perc", {r:500}, sine1, sine2).on("ended", function() {
      this.stop();
    });
    return sound;
  })();

  function playPianoSound() {
    // The sound lags terribly on mobile devices (Android Chrome at least )
    if (window.isMobile) return;
    sound.bang().play();
  }

  function generateTargetBpm() {
    var MIN = 30;
    var MAX = 200;
    return Math.round(MIN + Math.random() * (MAX - MIN));
  }

  function renderCountDown() {
    var text = 'Click ' + countDown + ' times more';
    if (countDown === 10) {
      text = 'Click ' + countDown + ' times';
    }
    countDownEl.text(text);
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

    var bpmDiffs = _.map(bpms, function(bpm) { return Math.round(bpm - avgBpm); });

    return {
      avg: avgBpm,
      diff: diff,
      bpmDiffs: bpmDiffs
    };
  }

  function renderBpm() {
    var bpm = calcBpm();

    var ex = 'Nope!';
    var text = 'Your BPM was ' + bpm.avg;

    var correct = Math.abs(targetBpm - bpm.avg) <= 3;

    if (correct) {
      ex = 'Well done!';
      if (targetBpm == bpm.avg) ex = 'Perfect!';
    }

    text = '<strong>' + ex + '</strong></br/>' + text;

    var bpmDiffs = _.map(bpm.bpmDiffs, function(bpmDiff) {
      if (bpmDiff < 0) return bpmDiff;
      return '+' + bpmDiff;
    });
    text += '<br/><small>' + bpmDiffs + '</small>';

    countDownEl.html(text);

    buttonEl.text('Again');

    buttonEl.prop('disabled', true);
    buttonEl.addClass('disabled');
    setTimeout(function() {
      buttonEl.prop('disabled', false);
      buttonEl.removeClass('disabled');
    }, 1500);
  }

  function reset() {
    beatTimes = [];
    countDown = 10;
    buttonEl.text('Play!');
    renderCountDown();

    targetBpm = generateTargetBpm();
    targetBpmEl.html('Target:<br/>' + targetBpm + ' BPM');
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

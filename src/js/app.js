var BP = {
  ui: {
    introElm: document.querySelector('.intro'),
    levelsElm: document.querySelector('.levels'),
    levelMsg: document.querySelector('.levels').firstElementChild,
    startBtn: document.querySelector('.start'),
    canvas: document.getElementById('canvas'),
    size: function () {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    ctx: document.getElementById('canvas').getContext('2d'),
    mouse: {
      x: undefined,
      y: undefined
    },
  },
  util: {
    fadeIn: function (elem, ms) {
      if (!elem)
        return;

      elem.style.opacity = 0;
      elem.style.filter = 'alpha(opacity=0)';
      elem.style.display = 'inline-block';
      elem.style.visibility = 'visible';

      if (ms) {
        var opacity = 0;
        var timer = setInterval(function () {
          opacity += 50 / ms;
          if (opacity >= 1) {
            clearInterval(timer);
            opacity = 1;
          }
          elem.style.opacity = opacity;
          elem.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
        }, 50);
      }
      else {
        elem.style.opacity = 1;
        elem.style.filter = 'alpha(opacity=1)';
      }
    },
    fadeOut: function (elem, ms) {
      if (!elem)
        return;

      if (ms) {
        var opacity = 1;
        var timer = setInterval(function () {
          opacity -= 50 / ms;
          if (opacity <= 0) {
            clearInterval(timer);
            opacity = 0;
            elem.style.display = 'none';
            elem.style.visibility = 'hidden';
          }
          elem.style.opacity = opacity;
          elem.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
        }, 50);
      }
      else {
        elem.style.opacity = 0;
        elem.style.filter = 'alpha(opacity=0)';
        elem.style.display = 'none';
        elem.style.visibility = 'hidden';
      }
    }
  },
  bubblesQueue: [],
  bubble: function (x, y, dx, dy, radius, colors) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.minRadius = radius;
    this.colors = colors;

    this.draw = function () {
      BP.ui.ctx.beginPath();
      // x, y, radius, Math.PI / 180 * startAngle, Math.PI / 180 * endAngle, anticlockwise
      BP.ui.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      BP.ui.ctx.fillStyle = colors;
      BP.ui.ctx.fill();
    };

    this.update = function () {

      // boundry detection
      if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
        this.dx = -this.dx;
      }
      if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
        this.dy = -this.dy;
      }
      this.x += this.dx;
      this.y += this.dy;

      /* 
      interactivity: 
      positive numbers check for circles that are left or above the mouse. 
      negative numbers check for circles that are right or below the mouse 
      */
      if (BP.ui.mouse.x - this.x < this.minRadius
        && BP.ui.mouse.x - this.x > -this.minRadius
        && BP.ui.mouse.y - this.y < this.minRadius
        && BP.ui.mouse.y - this.y > -this.minRadius
        && this.radius != 0) {

        this.radius += BP.gamePlay.bubbleExpansionRate; // enlarge bubble
        if (this.radius > BP.gamePlay.maxExpansion) {
          this.destroy();
        }
      } else if (this.radius > this.minRadius && this.radius != 0) {
        this.radius -= BP.gamePlay.bubbleExpansionRate; // shrink bubble
      }

      // redraw each time circle.update() is called
      this.draw();
    },
      this.destroy = function () {
        this.radius = 0;
        this.x = -10;
        this.y = -10;
        this.dx = 0;
        this.dy = 0;
        BP.gamePlay.bubblesPoppedPerLevel += 1;
        BP.gamePlay.bubblesPoppedTotal += 1;

        // check if the last bubble was popped 
        BP.gamePlay.checkProgress();
      };
  },
  bubbleMultiplier: function () {
    this.bubblesQueue = [];

    // on resize make a prorated amount of bubbles each level based on current progress
    var bubbleNums = this.gamePlay.bubbleQnty - BP.gamePlay.bubblesPoppedPerLevel;

    // random circles
    for (var i = 0; i < bubbleNums; i++) {

      // random circle size
      var radius = Math.floor(Math.random() * BP.gamePlay.maxRadius) + 25;

      var x = Math.random() * (innerWidth - radius * 2) + radius;
      var y = Math.random() * (innerHeight - radius * 2) + radius;
      var dx = (Math.random() - 0.5) * BP.gamePlay.speed;
      var dy = (Math.random() - 0.5) * BP.gamePlay.speed;

      // random RGB values
      var r = Math.floor(Math.random() * 255) + 1;
      var g = Math.floor(Math.random() * 255) + 1;
      var b = Math.floor(Math.random() * 255) + 1;
      var a = Math.random() * (1 - 0.1) + 0.1;
      var colors = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';

      // instantiate new circles and store in array
      this.bubblesQueue.push(new BP.bubble(x, y, dx, dy, radius, colors));
    }
  },
  animate: function () {
    // animate circle
    requestAnimationFrame(BP.animate); // recursive callback

    // clear last position
    BP.ui.ctx.clearRect(0, 0, innerWidth, innerHeight);

    // call circle functions 
    for (var i = 0; i < BP.bubblesQueue.length; i++) {
      BP.bubblesQueue[i].update();
    }
  },
  gamePlay: {
    level: 1,
    bubbleQnty: 50, // 50 to start as example
    bubblesPoppedPerLevel: 0,
    bubblesPoppedTotal: 0,
    bubbleExpansionRate: 5,
    speed: 8,
    maxRadius: 45,
    maxExpansion: 150,
    start: function () {

      // track mouse
      BP.ui.canvas.addEventListener('mousemove', function (event) {
        // get mouse position
        BP.ui.mouse.x = event.x;
        BP.ui.mouse.y = event.y;
      });
      BP.gamePlay.speed = 3; // start off for level 1
      BP.gamePlay.bubbleQnty = 8; // start off for level 1
      BP.ui.canvas.setAttribute('class', 'active'); // increase opacity of canvas
      BP.util.fadeOut(BP.ui.introElm, 200); // fade out intro
      BP.bubbleMultiplier(); // make bubbles
    },
    checkProgress: function () {
      if (this.bubblesPoppedPerLevel === this.bubbleQnty) {
        this.bubblesPoppedPerLevel = 0; // reset counter
        BP.gamePlay.level += 1; // increment level
        BP.ui.canvas.removeAttribute('class', 'active'); // reduce canvas opacity
        this.showHideLevelMsg();
      }
    },
    showHideLevelMsg: function () {
      // random RGB values
      var r = Math.floor(Math.random() * 255) + 1;
      var g = Math.floor(Math.random() * 255) + 1;
      var b = Math.floor(Math.random() * 255) + 1;
      var color = 'color:rgba(' + r + ',' + g + ',' + b + ',1)';
      BP.ui.levelMsg.setAttribute('style', color);
      BP.ui.levelMsg.innerHTML = 'Level ' + BP.gamePlay.level;

      var delayShowLevel = setTimeout(() => {
        clearTimeout(delayShowLevel);

        BP.util.fadeIn(BP.ui.levelsElm, 800); // fade in level message

        var delayHideLevel = setTimeout(() => {
          clearTimeout(delayHideLevel);

          // fade out level message and start next level 
          BP.util.fadeOut(BP.ui.levelsElm, 600);
          this.nextLevel();

        }, 4000);
      }, 200);
    },
    nextLevel: function () {
      BP.gamePlay.speed += 0.5; // increase speed each level
      //BP.gamePlay.bubbleExpansionRate += 0.5;
      BP.gamePlay.bubbleQnty += 5; // increment bubbles by num for each level
      if (BP.gamePlay.maxRadius + 15 < BP.gamePlay.maxExpansion) {
        BP.gamePlay.maxExpansion -= 5; // reduce expansion size as game speeds up
      }

      var delayShowNext = setTimeout(() => {
        clearTimeout(delayShowNext);

        BP.bubbleMultiplier(); // make bubbles
        BP.ui.canvas.setAttribute('class', 'active'); // increase canvas opacity

      }, 800);
    },
  },
  load: function () {

    // start game
    this.ui.startBtn.addEventListener('click', this.gamePlay.start);

    // make new bubbles on resize
    window.addEventListener('resize', function () {
      BP.ui.canvas.width = window.innerWidth;
      BP.ui.canvas.height = window.innerHeight;
      if (BP.gamePlay.bubblesPoppedPerLevel != 0) {
        BP.bubbleMultiplier();
      }
    });
  },
  init: function () {
    this.ui.size(); // set initial size 
    this.bubbleMultiplier(); // make bubbles
    this.animate(); // animate bubbles
    this.load(); // bind event handlers
  }
};

BP.init();
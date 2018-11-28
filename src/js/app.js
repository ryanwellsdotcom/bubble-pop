const BP = {
  ui: {
    progressElm: document.querySelector('.progress'),
    introElm: document.querySelector('.intro'),
    levelsElm: document.querySelector('.levels'),
    levelMsg: document.querySelector('.levels').firstElementChild,
    startBtn: document.querySelector('.start'),
    canvas: document.getElementById('canvas'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    size: function () {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    loadSounds: function () {
      //sound type
      const sounds = {
        high: new Audio('//ryanwells.com/bubble-pop/dist/audio/bubble-pop-high.mp3'),
        med: new Audio('//ryanwells.com/bubble-pop/dist/audio/bubble-pop-med.mp3'),
        low: new Audio('//ryanwells.com/bubble-pop/dist/audio/bubble-pop-low.mp3')
      };
      // set volume for each sound
      Object.values(sounds).forEach((sound) => {
        sound.volume = 0.25;
      });
      return sounds;
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
        let opacity = 0;
        const timer = setInterval(function () {
          opacity += 50 / ms;
          if (opacity >= 1) {
            clearInterval(timer);
            opacity = 1;
          }
          elem.style.opacity = opacity;
          elem.style.filter = `alpha(opacity=${opacity * 100})`;
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
        let opacity = 1;
        const timer = setInterval(function () {
          opacity -= 50 / ms;
          if (opacity <= 0) {
            clearInterval(timer);
            opacity = 0;
            elem.style.display = 'none';
            elem.style.visibility = 'hidden';
          }
          elem.style.opacity = opacity;
          elem.style.filter = `alpha(opacity=${opacity * 100})`;
        }, 50);
      }
      else {
        elem.style.opacity = 0;
        elem.style.filter = 'alpha(opacity=0)';
        elem.style.display = 'none';
        elem.style.visibility = 'hidden';
      }
    },
    randomColorGen: function () {
      let r = Math.floor(Math.random() * 255) + 1;
      let g = Math.floor(Math.random() * 255) + 1;
      let b = Math.floor(Math.random() * 255) + 1;
      let color = `${r}, ${g}, ${b}`;
      return color;
    },
  },
  bubblesQueue: [],
  bubble: function (x, y, dx, dy, radius, colors, sound) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.origRadius = radius;
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
        this.dx = -this.dx; // move left
      }
      if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
        this.dy = -this.dy; // move up
      }
      this.x += this.dx; // move right
      this.y += this.dy; // move down

      /* 
      interactivity: 
      positive numbers check for bubbles that are left or above the mouse. 
      negative numbers check for bubbles that are right or below the mouse 
      */
      if (BP.ui.mouse.x - this.x < this.radius
        && BP.ui.mouse.x - this.x > -this.radius
        && BP.ui.mouse.y - this.y < this.radius
        && BP.ui.mouse.y - this.y > -this.radius
        && this.radius != 0) {

        this.radius += BP.gamePlay.bubbleExpansionRate; // enlarge bubble
        if (this.radius > BP.gamePlay.maxExpansion) {
          this.destroy(this.origRadius);
        }
      } else if (this.radius > this.minRadius && this.radius != 0) {
        this.radius -= BP.gamePlay.bubbleExpansionRate; // shrink bubble
        BP.ui.mouse.x = 0;
        BP.ui.mouse.y = 0;
      }

      // redraw each time bubble.update() is called
      this.draw();
    },
      this.destroy = function (origRadius) {
        BP.gamePlay.playSound(origRadius);
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
    let bubbleNums = this.gamePlay.bubbleQnty - BP.gamePlay.bubblesPoppedPerLevel;

    // random bubbles
    for (let i = 0; i < bubbleNums; i++) {

      // random bubble size
      let radius = Math.floor(Math.random() * BP.gamePlay.maxRadius) + 25;
      let x = Math.random() * (innerWidth - radius * 2) + radius;
      let y = Math.random() * (innerHeight - radius * 2) + radius;
      let dx = (Math.random() - 0.5) * BP.gamePlay.speed;
      let dy = (Math.random() - 0.5) * BP.gamePlay.speed;

      // random opacity for each bubble
      let a = Math.random() * (1 - 0.15) + 0.15;
      let colors = `rgba(${BP.util.randomColorGen()} , ${a})`;

      const args = [x, y, dx, dy, radius, colors];

      // instantiate new bubbles and store in array
      this.bubblesQueue.push(new BP.bubble(...args));
    }
  },
  animate: function () {
    // animate bubble
    requestAnimationFrame(BP.animate); // recursive callback

    // clear last position
    BP.ui.ctx.clearRect(0, 0, innerWidth, innerHeight);

    // call bubble functions 
    BP.bubblesQueue.forEach(function (item, i) {
      BP.bubblesQueue[i].update();
    });
  },
  gamePlay: {
    level: 0,
    bubbleQnty: 50, // 50 to start as example
    bubblesPoppedPerLevel: 0,
    bubblesPoppedTotal: 0,
    bubbleExpansionRate: 5,
    speed: 8,
    maxRadius: 45,
    maxExpansion: 150,
    setMouseCoords: function (event) {
      BP.ui.mouse.x = event.x;
      BP.ui.mouse.y = event.y;
    },
    start: function () {
      BP.gamePlay.level = 1;
      // track mouse
      BP.ui.canvasWrapper.addEventListener('mousemove', function (event) {
        // get mouse position
        event.preventDefault();
        event.stopPropagation();
        BP.gamePlay.setMouseCoords(event);
      }, false);

      BP.ui.canvasWrapper.addEventListener('click', function (event) {
        // get mouse position
        event.preventDefault();
        event.stopPropagation();
        BP.gamePlay.setMouseCoords(event);
      }, false);

      BP.gamePlay.speed = 3; // start off for level 1
      BP.gamePlay.bubbleQnty = 8; // start off for level 1
      BP.ui.canvas.classList.add('active'); // increase opacity of canvas
      BP.util.fadeOut(BP.ui.introElm, 200); // fade out intro
      BP.bubbleMultiplier(); // make bubbles
      BP.gamePlay.stopwatch.startTimer();

    },
    stopwatch: {
      startTime: null,
      endTime: null,
      duration: 0,
      startTimer: function () {
        this.startTime = new Date();
      },
      stopTimer: function () {
        this.endTime = new Date();
      },
      resetTimer: function () {
        this.startTime = null;
        this.endTime = null;
        this.duration = 0;
      },
      showDuration: function () {
        let time = (this.endTime.getTime() - this.startTime.getTime()) / 1000;
        const secs = parseInt(time, 10);
        let minutes = Math.floor(secs / 60);
        let seconds = secs - minutes * 60;
        let formatTime;
        if (minutes > 0) {
          let onesPlace = seconds < 10 ? '0' : '';
          formatTime = `${minutes}:${onesPlace}${seconds}!`;
        } else {
          formatTime = `${seconds} seconds!`;
        }
        return formatTime;
      }
    },
    checkProgress: function () {
      if (this.bubblesPoppedPerLevel === this.bubbleQnty) {
        BP.gamePlay.stopwatch.stopTimer();
        BP.gamePlay.level += 1; // increment level
        BP.ui.canvas.classList.remove('active'); // reduce canvas opacity
        this.showHideLevelMsg();
      }
    },
    showHideLevelMsg: function () {
      BP.ui.progressElm.innerHTML = `${this.bubblesPoppedPerLevel} bubbles popped in ${BP.gamePlay.stopwatch.showDuration()}`;
      this.bubblesPoppedPerLevel = 0; // reset counter
      BP.gamePlay.stopwatch.resetTimer();

      // random RGB values
      let color = `color:rgba(${BP.util.randomColorGen()} , 1)`;
      BP.ui.levelMsg.setAttribute('style', color);
      BP.ui.levelMsg.innerHTML = `Level ${BP.gamePlay.level}`;

      // popped bubble count and elapsed time message
      const delayShowProgress = setTimeout(() => {
        clearTimeout(delayShowProgress);

        // fade in progress message 
        BP.util.fadeIn(BP.ui.progressElm, 800);

        const delayHideProgress = setTimeout(() => {
          clearTimeout(delayHideProgress);

          // fade out progress message while fading in level message
          BP.util.fadeOut(BP.ui.progressElm, 600);
        }, 4800);
      }, 200);

      // level number indicator 
      const delayShowLevel = setTimeout(() => {
        clearTimeout(delayShowLevel);

        // fade in level message
        BP.util.fadeIn(BP.ui.levelsElm, 800);

        const delayHideLevel = setTimeout(() => {
          clearTimeout(delayHideLevel);

          // fade out level message and start next level 
          BP.util.fadeOut(BP.ui.levelsElm, 600);
          this.nextLevel();

        }, 3000);
      }, 2000);
    },
    nextLevel: function () {
      BP.gamePlay.speed += 0.5; // increase speed each level
      //BP.gamePlay.bubbleExpansionRate += 0.5;
      BP.gamePlay.bubbleQnty += 5; // increment bubbles by num for each level
      if (BP.gamePlay.maxRadius + 15 < BP.gamePlay.maxExpansion) {
        BP.gamePlay.maxExpansion -= 5; // reduce expansion size as game speeds up
      }

      const delayShowNext = setTimeout(() => {
        clearTimeout(delayShowNext);

        BP.bubbleMultiplier(); // make bubbles
        BP.ui.canvas.classList.add('active'); // increase canvas opacity
        BP.gamePlay.stopwatch.startTimer();
      }, 800);
    },
    playSound: function (origRadius) {
      this.sound = null;
      if (origRadius <= 34) {
        this.sound = BP.ui.loadSounds().high;
      } else if (origRadius > 34 && origRadius <= 42) {
        this.sound = BP.ui.loadSounds().med;
      } else {
        this.sound = BP.ui.loadSounds().low;
      }
      this.sound.play();
    }
  },
  bind: function () {

    // start game
    this.ui.startBtn.addEventListener('click', this.gamePlay.start);

    // make new bubbles on resize
    window.addEventListener('resize', function () {
      BP.ui.canvas.width = window.innerWidth;
      BP.ui.canvas.height = window.innerHeight;
      if (BP.gamePlay.bubblesPoppedPerLevel != 0 || BP.gamePlay.level === 0) {
        BP.bubbleMultiplier();
      }
    });
  },
  init: function () {
    this.ui.size(); // set initial size 
    this.ui.loadSounds();
    this.bubbleMultiplier(); // make initial bubbles on load
    this.animate(); // move bubbles around screen
    this.bind(); // bind event handlers
  }
};
BP.init(); 
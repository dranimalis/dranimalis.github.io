(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------- nav scroll state --------------------------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------ mobile menu ------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------ scroll reveal ----------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ----------------------------- terminal typer ----------------------------- */
  // Types a sequence of lines into a container, prompt lines get a "$ " prefix
  // and are typed character-by-character; output lines fade in as a block.
  function typeSequence(container, lines, opts) {
    opts = opts || {};
    if (!container) return;

    if (reduceMotion) {
      container.innerHTML = lines.map(renderStaticLine).join('');
      return;
    }

    var i = 0;
    container.innerHTML = '';

    function renderStaticLine(l) {
      if (l.type === 'prompt') {
        return '<div class="terminal-line"><span class="prompt">$</span> ' + l.text + '</div>';
      }
      return '<div class="terminal-line out">' + l.text + '</div>';
    }

    function next() {
      if (i >= lines.length) {
        if (opts.loop) {
          setTimeout(function () { i = 0; container.innerHTML = ''; next(); }, 1800);
        } else {
          var cursorLine = document.createElement('div');
          cursorLine.className = 'terminal-line';
          cursorLine.innerHTML = '<span class="prompt">$</span> <span class="cursor"></span>';
          container.appendChild(cursorLine);
        }
        return;
      }

      var line = lines[i];
      var lineEl = document.createElement('div');
      lineEl.className = 'terminal-line';
      container.appendChild(lineEl);

      if (line.type === 'prompt') {
        var promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = '$ ';
        lineEl.appendChild(promptSpan);
        var textSpan = document.createElement('span');
        lineEl.appendChild(textSpan);

        var chars = line.text.split('');
        var c = 0;
        var typeSpeed = 34;
        var typer = setInterval(function () {
          textSpan.textContent += chars[c];
          c++;
          if (c >= chars.length) {
            clearInterval(typer);
            i++;
            setTimeout(next, 260);
          }
        }, typeSpeed);
      } else {
        lineEl.classList.add('out');
        lineEl.style.opacity = '0';
        lineEl.textContent = line.text;
        requestAnimationFrame(function () {
          lineEl.style.transition = 'opacity 0.35s ease';
          lineEl.style.opacity = '1';
        });
        i++;
        setTimeout(next, line.pause || 420);
      }
    }

    next();
  }

  var heroTerminal = document.getElementById('heroTerminal');
  if (heroTerminal) {
    typeSequence(heroTerminal, [
      { type: 'prompt', text: 'whoami' },
      { type: 'output', text: 'dr_animalis' },
      { type: 'prompt', text: 'status' },
      { type: 'output', text: 'building cool stuff...' },
      { type: 'prompt', text: 'current_focus' },
      { type: 'output', text: 'web development' }
    ], { loop: true });
  }

  var errorTerminal = document.getElementById('errorTerminal');
  if (errorTerminal) {
    var path = (window.location.pathname && window.location.pathname !== '/')
      ? window.location.pathname
      : '/this-page-does-not-exist';

    typeSequence(errorTerminal, [
      { type: 'prompt', text: 'find ' + path },
      { type: 'output', text: 'Searching...', pause: 550 },
      { type: 'output', text: 'No results found.' },
      { type: 'prompt', text: 'help' },
      { type: 'output', text: 'Try going back to the homepage.' }
    ], { loop: false });
  }
})();

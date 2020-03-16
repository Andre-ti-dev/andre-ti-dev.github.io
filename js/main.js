setTimeout(
  () => (document.querySelector('.loader').style.display = 'block'),
  1000
);

let processes = document.querySelector('#processes');
let browsers = [];

async function sort() {
  let browsersSorted = [...browsers].sort((a, b) => (a.ms > b.ms ? 1 : -1));
  let browserIndex = 0;
  while (browsers.length > browserIndex) {
    await animationChangePosition(
      getProcess(
        browsersSorted[browserIndex].id,
        getProcess(browsers[browserIndex].id)
      )
    );
    browserIndex++;
  }
  browsers = browsersSorted;
  return [...browsers];
}

function animationChangePosition(element, beforeElement) {
  element.style.opacity = 0;
  return new Promise(resolve => {
    setTimeout(function() {
      processes.insertBefore(element, beforeElement);
      setTimeout(function() {
        element.style.opacity = 1;
        resolve();
      }, 500);
    }, 500);
  });
}

/* Algoritmos */

async function fifo() {
  disabledMethodButtons();
  if (browsers.length > 0) {
    startAnimations();
    while (browsers.length > 0) {
      await runProcessNotPreemptive(browsers[0]);
      let browser = browsers.shift();
      removeProcess(browser.id);
      await contextChange();
    }
    stopAnimations();
  }
  enableMethodButtons();
}

async function sjfNotPreemptive() {
  disabledMethodButtons();

  if (browsers.length > 0) {
    startAnimations();
    while (browsers.length > 0) {
      let browser = browsers.reduce((min, next) =>
        next.ms < min.ms ? next : min
      );

      await runProcessNotPreemptive(browser);

      browsers = browsers.filter(b => b.id != browser.id);
      removeProcess(browser.id);
      await contextChange();
    }

    stopAnimations();
  }
  enableMethodButtons();
}

async function sjfNotPreemptive() {
  disabledMethodButtons();

  if (browsers.length > 0) {
    startAnimations();
    while (browsers.length > 0) {
      let browser = browsers.reduce((min, next) =>
        next.ms < min.ms ? next : min
      );

      await runProcessNotPreemptive(browser);

      browsers = browsers.filter(b => b.id != browser.id);
      removeProcess(browser.id);
      await contextChange();
    }

    stopAnimations();
  }
  enableMethodButtons();
}

async function sjfPreemptive() {
  disabledMethodButtons();

  if (browsers.length > 0) {
    startAnimations();
    let lastBrowser;

    while (browsers.length > 0) {
      let browser = browsers.reduce((min, next) =>
        next.ms < min.ms ? next : min
      );

      if (!lastBrowser) switchProcessIcon(browser.icon);
      if (lastBrowser && lastBrowser.id != browser.id) {
        await contextChange();
        switchProcessIcon(browser.icon);
      }

      await runProcessPreemptive(browser);

      if (browser.ms == 0) {
        browsers = browsers.filter(b => b.id != browser.id);
        removeProcess(browser.id);
      }

      lastBrowser = Object.assign({}, browser);
    }

    stopAnimations();
  }
  enableMethodButtons();
}

async function priority() {
  disabledMethodButtons();

  if (browsers.length > 0) {
    startAnimations();
    let lastBrowser;

    while (browsers.length > 0) {
      let browser = browsers.reduce((min, next) =>
        next.priority > min.priority ? next : min
      );

      if (!lastBrowser) switchProcessIcon(browser.icon);
      if (lastBrowser && lastBrowser.id != browser.id) {
        await contextChange();
        switchProcessIcon(browser.icon);
      }

      await runProcessPreemptive(browser);

      if (browser.ms == 0) {
        browsers = browsers.filter(b => b.id != browser.id);
        removeProcess(browser.id);
      }

      lastBrowser = Object.assign({}, browser);
    }

    stopAnimations();
  }
  enableMethodButtons();
}

function runProcessNotPreemptive(browser) {
  switchProcessIcon(browser.icon);
  return new Promise(resolve => {
    let interval = setInterval(() => {
      browser.ms--;
      getProcess(browser.id).querySelector('.process-time').textContent =
        browser.ms + 'ms';
      if (browser.ms == 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function runProcessPreemptive(browser) {
  return new Promise(resolve => {
    setTimeout(() => {
      browser.ms--;
      getProcess(browser.id).querySelector('.process-time').textContent =
        browser.ms + 'ms';
      resolve();
    }, 1000);
  });
}

async function roundRobin() {
  disabledMethodButtons();
  let quantumInput = document.querySelector('#quantum');
  if (browsers.length > 0) {
    startAnimations();
    switchProcessIcon(browsers[0].icon);
    while (browsers.length > 0) {
      let quantum = quantumInput.value;
      let lastBrowser = {};
      while (quantum > 0) {
        if (browsers[0].ms == 0) {
          removeProcess(browsers[0].id);
          browsers.shift();
          if (browsers.length == 0) break;
        }
        if (lastBrowser.id != browsers[0].id) {
          switchProcessIcon(browsers[0].icon);
          lastBrowser = Object.assign({}, browsers[0]);
        }
        await runProcessPreemptive(browsers[0]);
        quantum--;
      }
      await contextChange();
    }
    stopAnimations();
  }
  enableMethodButtons();
}

function contextChange() {
  let iconElement = document.createElement('i');
  iconElement.classList.add('fas', 'fa-cog');

  removeProcessIcon().appendChild(iconElement);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

//

function getProcess(id) {
  return document.querySelector("[data-id='" + id + "']");
}

function addProcess(event) {
  let icon = event.dataset.icon;
  let ms = event.dataset.ms;
  let priority = event.dataset.priority;
  let id = browsers.length > 0 ? browsers[browsers.length - 1].id : 0;
  id++;

  let processElement = document.createElement('div');
  processElement.classList.add('process');
  processElement.setAttribute('data-id', id);

  let iconElement = document.createElement('i');
  iconElement.classList.add('fab', icon);

  let msElement = document.createElement('span');
  msElement.classList.add('process-time');
  let text = document.createTextNode(ms + 'ms');
  msElement.appendChild(text);

  let priorityElement = document.createElement('span');
  priorityElement.classList.add('priority-icon');

  let count = 0;
  while (priority > count) {
    let starElement = document.createElement('i');
    starElement.classList.add('fas', 'fa-star');
    priorityElement.appendChild(starElement);
    count++;
  }

  processElement.appendChild(iconElement);
  processElement.appendChild(msElement);
  processElement.appendChild(priorityElement);
  processes.appendChild(processElement);

  browsers.push({ id, ms, icon, priority });
}

function switchProcessIcon(icon) {
  let iconElement = document.createElement('i');
  iconElement.classList.add('fab', icon);
  removeProcessIcon().appendChild(iconElement);

  return icon;
}

function startAnimations() {
  // Init animations
  let loader = document.querySelector('.loader');
  loader.style.animation = 'animate 0.5s linear infinite';
  loader.style.opacity = 1;

  document.querySelector('#cpu-wrapper').style.animation =
    'cpu 4s linear infinite';
}

function stopAnimations() {
  // Init animations
  let loader = document.querySelector('.loader');
  loader.style.animation = '';
  loader.style.opacity = 0;
  document.querySelector('#cpu-wrapper').style.animation = '';
  removeProcessIcon();
}
function removeProcessIcon() {
  let iconProcess = document.querySelector('#icon-process');
  if (iconProcess.firstChild) iconProcess.removeChild(iconProcess.firstChild);
  return iconProcess;
}
function removeProcess(id) {
  let process = getProcess(id);
  processes.removeChild(process);
}

function disabledMethodButtons() {
  document.querySelectorAll('.btn-method').forEach(btn => {
    btn.setAttribute('disabled', true);
    btn.style.cursor = 'not-allowed';
  });
  let rr = document.querySelector('#round-robin');
  rr.classList.add('disabled');
  rr.style.cursor = 'not-allowed';

  let rrInput = rr.querySelector('input');
  rrInput.setAttribute('disabled', true);
  rrInput.style.cursor = 'not-allowed';

  rrButton = rr.querySelector('button');
  rrButton.setAttribute('disabled', true);
  rrButton.style.cursor = 'not-allowed';
}

function enableMethodButtons() {
  document.querySelectorAll('.btn-method').forEach(btn => {
    btn.removeAttribute('disabled');
    btn.style.cursor = 'pointer';
  });

  let rr = document.querySelector('#round-robin');
  rr.classList.remove('disabled');
  rr.style.cursor = 'default';

  let rrInput = rr.querySelector('input');
  rrInput.removeAttribute('disabled');
  rrInput.style.cursor = 'default';

  rrButton = rr.querySelector('button');
  rrButton.removeAttribute('disabled');
  rrButton.style.cursor = 'pointer';
}

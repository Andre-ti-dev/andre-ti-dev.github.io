setTimeout(
  () => (document.querySelector('.loader').style.display = 'block'),
  1000
);

let processes = document.querySelector('#processes');
let browsers = [];

function sort() {
  let browsersSorted = [...browsers].sort((a, b) => (a.ms > b.ms ? 1 : -1));
  let browserIndex = 0;
  let changePositions = setInterval(() => {
    if (browsers.length > browserIndex) {
      animationChangePosition(
        getProcess(browsersSorted[browserIndex].id, browsers[browserIndex].id)
      );
      browserIndex++;
    } else {
      clearInterval(changePositions);
    }
  }, 1000);
}

function animationChangePosition(element, beforeElement) {
  element.style.opacity = 0;
  setTimeout(function() {
    processes.insertBefore(element, beforeElement);
    setTimeout(function() {
      element.style.opacity = 1;
    }, 1000);
  }, 2000);
}

function getProcess(id) {
  return document.querySelector("[data-id='" + id + "']");
}

function addProcess(event) {
  let icon = event.dataset.icon;
  let ms = event.dataset.ms;
  let id = browsers.length > 0 ? browsers[browsers.length - 1].id : 0;

  let processElement = document.createElement('div');
  processElement.classList.add('process');
  processElement.setAttribute('data-id', id);

  let iconElement = document.createElement('i');
  iconElement.classList.add('fab', icon);

  let msElement = document.createElement('span');
  msElement.classList.add('process-time');
  let text = document.createTextNode(ms + 'ms');
  msElement.appendChild(text);

  processElement.appendChild(iconElement);
  processElement.appendChild(msElement);
  processes.appendChild(processElement);

  browsers.push({ id, ms, icon });
}

async function fifo() {
  disabledMethodButtons();
  if (browsers.length > 0) {
    startAnimations();
    while (browsers.length > 0) {
      await runProcess(browsers[0]);
      let browser = browsers.shift();
      removeProcess(browser.id);
      await contextChange();
    }
    stopAnimations();
  }
  enableMethodButtons();
}

function runProcess(browser) {
  switchProcessIcon(browser.icon);
  return new Promise(resolve => {
    let interval = setInterval(() => {
      browser.ms--;
      if (browser.ms == 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function contextChange() {
  let iconProcess = document.querySelector('#icon-process');
  let iconElement = document.createElement('i');
  iconElement.classList.add('fas', 'fa-cog');

  iconProcess.removeChild(iconProcess.firstChild);
  iconProcess.appendChild(iconElement);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

function switchProcessIcon(icon) {
  let iconProcess = document.querySelector('#icon-process');

  let iconElement = document.createElement('i');
  iconElement.classList.add('fab', icon);
  if (iconProcess.firstChild) iconProcess.removeChild(iconProcess.firstChild);
  iconProcess.appendChild(iconElement);

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
  let iconProcess = document.querySelector('#icon-process');
  if (iconProcess.firstChild) iconProcess.removeChild(iconProcess.firstChild);
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
}

function enableMethodButtons() {
  document.querySelectorAll('.btn-method').forEach(btn => {
    btn.removeAttribute('disabled');
    btn.style.cursor = 'pointer';
  });
}

export function parseQueryParams() {
  let params = {};

  try {
    params = window.location.search.split('?')[1].split('&').map(param => {
      const entry = param.split('=');
      return {
        key: entry[0],
        value: entry[1],
      };
    });
  } catch (err) {
    console.error('failed to parse query params', err.message);
  }

  return params;
}

export function isListableSite(hostname, params) {
  const hostReg = new RegExp(/google\.com/, 'i');
  return hostReg.test(hostname) && params.find(param => {
    return (
      (param.key === 'rlst' && param.value === 'f') ||
      (param.key === 'biw' || param.key === 'bih')
    );
  });
}

export function parseElement(element, strategy) {
  const filterReg = new RegExp(
    /(Looking\sfor\ssomething\sdifferent\?)|(Can't\sfind\swhat\syou\sare\slooking\sfor\?)/,
    'i'
  );

  switch (strategy) {
    default:
      const raw = element.innerText;
      if (filterReg.test(raw)) {
        const lines = (
          raw
            .split('\n')
            .map(line => line.trim())
            .filter(filterLine)
        );

        return {
          raw,
          lines,
          text: lines.join(' '),
        };
      } else {
        return null;
      }
  }
}

export function getListableRootElement(hostname) {
  switch (hostname) {
    default:
      return document.querySelector('.rl_full-list .rlfl__tls.rl_tls');
  }
}

function filterLine(line) {
  const stopWords = [
    'website',
    'directions',
    'takeout',
    'delivery',
    'dine-in',
    '.',
    '',
    '·',
  ];

  return stopWords.indexOf(line.toLowerCase()) === -1;
}

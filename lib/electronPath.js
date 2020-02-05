const fs = require('fs');
const _path = require('path');

const normalizeElectronPath = function(s) {
  const alp = s.replace(/app\.asar(?!\.unpacked)/g, 'app.asar.unpacked');

  let inAsarUnpacked = false;

  if (fs.existsSync(alp)) {
      inAsarUnpacked = true;
  } else {
      try {
          require.resolve(alp);
          inAsarUnpacked = true;
      } catch(e) {}
  }

  return inAsarUnpacked ? alp : s;
}

const join = function() {
  return normalizeElectronPath(_path.join.apply(this, arguments));
}

const resolve = function() {
  return normalizeElectronPath(_path.resolve.apply(this, arguments));
}

const normalize = function() {
  return normalizeElectronPath(_path.normalize.apply(this, arguments));
}

module.exports = {
  join,
  resolve,
  normalize,
  normalizeElectronPath,
};

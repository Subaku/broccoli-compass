var fs = require('fs');
var path = require('path');
var splice = Array.prototype.splice;

module.exports = walkCachedSync;
function walkCachedSync(baseDir, options) {
  baseDir = baseDir || '.';
  options = options || {};
  var file, sub, oldStats;
  var cache = options.cache && options.cache.paths || {};
  var paths = fs.readdirSync(baseDir).sort();
  var len = paths.length;
  var ignore = options.ignore;
  dirStats = {paths: {}};
  dirStats.baseDir = path.resolve(process.cwd() + '/' + baseDir);
  dirStats.changed = [];
  for(var i = 0; i < len; i += 1) {
    file = paths[i];
    if (ignore && ignore.test(file)) {
      continue;
    }
    oldStats = cache[file] && cache[file].stats;
    dirStats.paths[file] = {};
    try {
      stats = fs.statSync(baseDir + '/' + file);
    } catch (err) {
      console.warn('Warning: failed to stat ' + file, err.message);
      continue;
    }
    if (!oldStats ||
      stats.mode !== oldStats.mode ||
      stats.size !== oldStats.size ||
      stats.mtime.getTime() !== oldStats.mtime.getTime()) {
      dirStats.changed.push(file);
    }
    if (stats.isDirectory()) {
    	dirStats.paths[file].isDirectory = true;
			sub = fs.readdirSync(baseDir + '/' + file).sort().map(function (sub) {
				return file + '/' + sub;
			})
			len += sub.length;
      splice.apply(paths, [i + 1, 0].concat(sub));
    }
    dirStats.paths[file].stats = stats;
  }
  return dirStats;
}
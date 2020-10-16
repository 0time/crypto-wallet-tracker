const fs = require('fs');

// TODO: Fix recursion
// TODO: Move this to some lib
// TODO: Work with just a file
// TODO: Wtf do I do with symlinks? I'm not even looking for them currently...
const rmrf = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    if (fs.statSync(file).isDirectory()) {
      rmrf(file);
    } else {
      fs.unlinkSync(file);
    }
  });

  fs.rmdirSync(dir);
};

module.exports = rmrf;

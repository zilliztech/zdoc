'use strict'

function readPackage(pkg) {
  if (pkg.name === '@docusaurus/bundler' && pkg.version === '3.10.2') {
    pkg.dependencies = {
      ...pkg.dependencies,
      'copy-webpack-plugin': '^14.0.0',
      'css-minimizer-webpack-plugin': '^8.0.0',
    }
  }

  if (pkg.name === 'sockjs' && pkg.version === '0.3.24' && pkg.dependencies) {
    delete pkg.dependencies.uuid
  }

  return pkg
}

module.exports = { hooks: { readPackage } }

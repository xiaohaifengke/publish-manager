const path = require('path');
const fs = require('fs-extra')
const { getOriginalPackageJsonPath, generateFilenameByPath, getConfig } = require('../utils')
const chalk = require('chalk')

module.exports = function () {
  const originalPkgPath = getOriginalPackageJsonPath()
  if (!fs.pathExistsSync(originalPkgPath)) return
  const cachedPackageJsonName = generateFilenameByPath(originalPkgPath)
  const cachedPkgPath = path.resolve(__dirname, `../.cache/${cachedPackageJsonName}`)
  const publishManagerConfig = getConfig()
  
  const cachedPkgData = require(cachedPkgPath)
  fs.outputJsonSync(originalPkgPath, cachedPkgData, { spaces: publishManagerConfig.indent })
  console.log(chalk.blueBright(`publish-manager@${require('../package.json').version} has already restored the package.json file.`))
}

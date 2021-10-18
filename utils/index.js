const path = require('path')
const fs = require('fs-extra')

const configFile = ['.publish-manager.js', '.publish-manager.json', '.publish-manager']

function getOriginalPackageJsonPath() {
  const cwd = process.cwd()
  return path.resolve(cwd, './package.json')
}
/**
 * 根据文件所在的路径生成缓存的文件名
 * @param filepath
 * @returns {string}
 */
function generateFilenameByPath(filepath) {
  return filepath.split(path.sep).map(p => p.replace(':', '~~')).join('___')
}

/**
 * 获取项目中关于 publish-manager 的配置
 * @returns {*}
 */
function getConfig() {
  const defaultConfig = {
    indent: 2,
    addFields: {},
    removeFields: {}
  }
  const cwd = process.cwd()
  for(let configFileName of configFile) {
    const configFilePath = path.resolve(cwd, configFileName)
    if (fs.pathExistsSync(configFilePath)) {
      let config
      if (configFileName === '.publish-manager.js') {
        config = require(configFilePath)
      } else {
        config = fs.readJsonSync(configFilePath)
      }
      return Object.assign(defaultConfig, config)
    }
  }
  const originalPkgPath = path.resolve(cwd, './package.json')
  return Object.assign(defaultConfig, fs.pathExistsSync(originalPkgPath) && require(originalPkgPath)['publish-manager'])
}

module.exports = {
  getOriginalPackageJsonPath,
  generateFilenameByPath,
  getConfig
}

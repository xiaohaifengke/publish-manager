const path = require('path');
const fs = require('fs-extra')
const { getOriginalPackageJsonPath, generateFilenameByPath, getConfig } = require('../utils')
const chalk = require('chalk')

module.exports = function () {
  const originalPkgPath = getOriginalPackageJsonPath()
  if (!fs.pathExistsSync(originalPkgPath)) return
  
  const cachedPackageJsonName = generateFilenameByPath(originalPkgPath)
  const cachedPkgPath = path.resolve(__dirname, `../.cache/${cachedPackageJsonName}`)
  const originalPkgData = require(originalPkgPath)
  fs.outputJsonSync(cachedPkgPath, originalPkgData, { spaces: 2 })
  
  const publishManagerConfig = getConfig()
  remove(originalPkgData, publishManagerConfig.removeFields)
  merge(originalPkgData, publishManagerConfig.addFields)
  fs.outputJsonSync(originalPkgPath, originalPkgData, {
    spaces: 2
  })
  console.log(chalk.blueBright(`publish-manager@${require('../package.json').version} cleansed the package.json file.`))
}

/**
 * 合并config到data
 * @param data
 * @param config
 */
function merge(data, config = {}) {
  Object.entries(config).forEach(([key, value]) => {
    if (typeof data[key] === 'object' && typeof value === 'object') {
      merge(data[key], value)
    } else {
      data[key] = value
    }
  })
}

//removeNotMentionedField: 是否删除未指定的字段。default: false
function remove(data, config = {}, removeNotMentionedField = false) {
  if (Array.isArray(config)) {
    config.forEach(k => {
      Reflect.deleteProperty(data, k)
    })
  } else if (typeof config === 'object') {
    if (removeNotMentionedField) {
      Object.entries(data).forEach(([key, value])=> {
        if (config[key] !== false) {
          if (typeof config[key] === 'object' && typeof value === 'object') {
            remove(value, config[key], true)
          } else {
            Reflect.deleteProperty(data, key)
          }
        }
        // 当某个字段是空对象时，则删除该字段
        removeEmptyField(data, key)
      })
    } else {
      Object.entries(config).forEach(([key, value])=>{
        if (value === true) {
          Reflect.deleteProperty(data, key)
        } else if (typeof value === 'object') {
          if (typeof data[key] === 'object') {
            remove(data[key], value, true)
          } else {
            Reflect.deleteProperty(data, key)
          }
        }
        // 当某个字段是空对象时，则删除该字段
        removeEmptyField(data, key)
      })
    }
  }
}

// 当对象的某个字段为空对象时，则删除该字段
function removeEmptyField(obj, key) {
  if (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) {
    Reflect.deleteProperty(obj, key)
  }
}

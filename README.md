# publish-manager

`publish-manager`目前仅用于在发包之前修改`package.json`文件，比如删除、添加甚至合并一些字段。

## Install

```sh
npm install publish-manager -D
```

或者全局安装

```sh
npm install publish-manager -g
```

## Usage

`publish-manager`主要有两个命令，`cleanse`和`restore`。

### cleanse

```command line
publish-manager cleanse
```

用于整理`package.json`的内容。按[配置](#Config)删除、添加和合并一些字段。

### restore

```command line
publish-manager restore
```

用于还原`package.json`的内容。

### 更方便的使用方式

通过添加`npm script`的方式会更方便，不过可能有个小细节需要注意下：

当不需要删除`package.json`中的`scripts`字段时，可以配置为：

```json
{
  "scripts": {
    "prepublish": "publish-manager cleanse",
    "postpublish": "publish-manager restore"
  }
}
```

当需要删除`package.json`中的`scripts`字段时，如果还配置为`prepublish`和`postpublish`的话， 由于在`prepublish`阶段删除掉了`scripts`字段，即删除了所有的
scripts，会导致`postpublish`阶段定义的命令无法再被执行， 从而会使`package.json`不能自动还原（不能自动还原时可以手动执行`npx publish-manager restore`来还原）。
所以更建议配置为：

```json
{
  "scripts": {
    "custom:publish": "publish-manager cleanse && npm publish && publish-manager restore"
  }
}
```

## Config

`publish-manager`在项目根目录下查找配置文件的顺序为`.publish-manager.js`、 `.publish-manager.json`、 `.publish-manager`。 如果均未找到，
最后会从`package.json`文件中查找`publish-manager`字段作为配置。

### `Javascript`格式的配置方式

在`.publish-manager.js`中的配置参考如下：

```javascript
module.exports = {
  indent: 2,
  // removeFields 既支持数组也支持对象格式,但是细节上有一些区别
  // removeFields: [ "scripts", "lint-staged", "config", "devDependencies" ],
  removeFields: {
    scripts: true,
    "lint-staged": true,
    config: true,
    devDependencies: true,
    dependencies: ["vue"]
  },
  addFields: {
    author: "author's info",
    peerDependencies: {
      vue: "^3.2.0"
    }
  }
}
```

### Json格式的配置方式

在`.publish-manager.json`或者`.publish-manager`文件中使用`json`格式的配置：

```json
{
  "indent": 2,
  "removeFields": {
    "scripts": true,
    "lint-staged": true,
    "config": true,
    "devDependencies": true,
    "dependencies": [
      "vue"
    ]
  },
  "addFields": {
    "author": "author's info",
    "peerDependencies": {
      "vue": "^3.2.0"
    }
  }
}
```

### Options

- **indent**

  *Type*: `String` | `Number`  
  *Default*: `2`  
  定义用于格式化整理后的`package.json`的缩进。
  有关[更多信息](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Parameters) ，
  请参见`JSON.stringify`的`space`参数。

- **addFields**

  *Type*: `Object`  
  *Default*: `{}`
  指定需要新增或合并的字段。

- **removeFields**

  *Type*: `Array` | `Object`  
  *Default*: `{}`
  指定需要删除的字段。虽然`Array`和`Object`格式都可以配置删除的字段，但是两者之间有些细微的区别。

  > 对于如下的`package.json`时：
  > ```json
  > {
  >   "scripts": {
  >     "serve": "...serve",
  >     "build": "...build",
  >     "test": "...test",
  >     "prepare": "...prepare"
  >   }
  > }
  > ```
  > 当要删除的字段为`package.json`的一级字段时，该项配置在`Array`或者`Object`中没有区别；
  > 例如要删除`"scripts"`字段,可以配置成`removeFields: ["scripts"]`或`removeFields: {"scripts": true}`。
  > 当要删除的字段为二级及以上字段时，此时配置在`Array`中的字段会被删除；
  > 如`removeFields: {"scripts": ["serve", "build"]}`会删除`"serve"`和`"build"`保留`"test"`和`"prepare"`；
  > 配置在`Object`中的字段，当为false时会被保留，其余的全会被删除，包括未指定的字段；
  > 如：
  > ```json
  >   {
  >     "removeFields": {
  >       "scripts": {
  >         "prepare": false,
  >         "test": true
  >       }
  >     }
  >   }
  > ```
  > 上面的配置仅会保留`"prepare"`字段。  
  > 采用这种表现是为了方便的只保留某些字段或者只删除某些字段。

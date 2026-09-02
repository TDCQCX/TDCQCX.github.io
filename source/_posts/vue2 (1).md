---
title: Vue2 备忘录
date: 2025-01-08 10:35:26
categories:
    - 前端技术
tags:
    - Vue2
    - 前端技术
keywords: Vue2, 速记, 语法, 速查, 备忘录，速查表，速记手册
cover: /images/covers/vue2.svg
banner:
      type: img
      bgurl: /images/covers/vue2.svg
      banner_text: Vue2 备忘录
      toc: true # 无需显示目录
      comments: true
---
Vue 2 备忘清单
===

渐进式 JavaScript 框架 [Vue 2](https://v2.cn.vuejs.org/) 备忘清单的快速参考列表，包含常用 API 和示例。

入门
---

### 介绍

Vue 是一套用于构建用户界面的渐进式框架

- [Vue 2.x 官方文档](https://v2.cn.vuejs.org/) _(v2.cn.vuejs.org)_
- [Vue Router 3.x 官方文档](https://v3.router.vuejs.org/) _(v3.router.vuejs.org)_
- [Vue 3 备忘清单](./vue.md)
<!--rehype:className=style-round-->

注意：Vue 2.x 版本对应 Vue Router 3.x 路由版本

#### 快速创建 **Vue** 项目

```bash
npx @vue/cli create hello-world
```

参考: [Vue CLI](https://cli.vuejs.org/zh/guide/creating-a-project.html) 创建一个项目

### 声明式渲染

```html
<div id="app">
  {{ message }}
</div>
```

---

```js
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

### 基础例子
<!--rehype:wrap-class=row-span-2-->

```html
<div id="example">
  <p>原始信息: "{{ message }}"</p>
  <p>
    计算的反向信息: "{{ reversedMessage }}"
  </p>
</div>
```

---

```js
var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('')
          .reverse().join('')
    }
  }
})
```

结果

```
原始信息:  "Hello"
计算的反向信息:  "olleH"
```

### 绑定元素属性

```html
<div id="app-2">
  <span v-bind:title="message">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
```

---

```js
var app2 = new Vue({
  el: '#app-2',
  data: {
    message: '页面加载于 ' + new Date()
        .toLocaleString()
  }
})
```

### 条件

```html
<div id="app-3">
  <p v-if="seen">现在你看到我了</p>
</div>
```

---

```js
var app3 = new Vue({
  el: '#app-3',
  data: {
    seen: true
  }
})
```

控制切换一个元素是否显示

### 循环

```html
<div id="app-4">
  <ol>
    <li v-for="todo in todos">
      {{ todo.text }}
    </li>
  </ol>
</div>
```

---

```js
var app4 = new Vue({
  el: '#app-4',
  data: {
    todos: [
      { text: '学习 JavaScript' },
      { text: '学习 Vue' },
      { text: '整个牛项目' }
    ]
  }
})
```

### 点击事件处理

```html
<div id="app-5">
  <p>{{ message }}</p>
  <button v-on:click="reverseMessage">
    反转消息
  </button>
</div>
```

---

```js
var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('')
            .reverse().join('')
    }
  }
})
```

### 输入事件处理

```html
<div id="app-6">
  <p>{{ message }}</p>
  <input v-model="message">
</div>
```

`v-model` 指令，它能轻松实现表单输入和应用状态之间的双向绑定

```js
var app6 = new Vue({
  el: '#app-6',
  data: {
    message: 'Hello Vue!'
  }
})
```

模板语法
---

### 文本

```html
<span>Message: {{ msg }}</span>
<span v-once>
  这个将不会改变: {{ msg }}
</span>
```

使用 `v-once` 指令，执行一次性地插值，当数据改变时，插值处的内容不会更新

### 原始 HTML

```html
<p>解释为普通文本: {{ rawHtml }}</p>
<p>
  使用 v-html 指令: 
  <span v-html="rawHtml"></span>
</p>
```

使用 `v-html` 指令，输出真正的 `HTML`

### 属性

```html
<div v-bind:id="dynamicId"></div>
<button v-bind:disabled="isDisabled">
  Button
</button>
```

如果 `isDisabled` 的值是 null/undefined/false 则 `disabled` 不会被渲染出来

### JavaScript 表达式

```html
<div id="app">
  <span>消息: {{ msg }}</span>
  <span>{{ msg + '这是字符串' }}</span>
  <span>{{ isWorking ? '是':'否' }}</span>
  <span>{{ msg.getDetials() }}</span>
  <div v-bind:id="'list-' + id"></div>
<div>
```

### 指令

```html
<p v-if="seen">
  现在你看到我了
</p>
```

`v-if` 指令将根据表达式 `seen` 的值的真假来插入/移除 \<p> 元素

### 指令参数

```html
<a v-bind:href="url">...</a>
```

`v-bind` 指令将该元素 `href` 属性与表达式 `url` 的值绑定

```html
<a v-on:click="doSomething">...</a>
```

`v-on` 指令，用于监听 DOM 事件，oSomething 是事件名

### 指令动态参数 **v2.6**

```html
<a v-on:[eventName]="doSomething">...</a>
```

当 `eventName` 的值为 `focus` 时，`v-on:[eventName]` 将等价于 `v-on:focus`

### 指令修饰符

```html
<form v-on:submit.prevent="onSubmit">
  ...
</form>
```

`.prevent` 修饰符告诉 `v-on` 指令对于触发的事件调用 `event.preventDefault()`

### 指令缩写

```html
<!-- 完整语法 -->
<a v-bind:href="url">...</a>
<!-- 缩写 -->
<a :href="url">...</a>
<!-- 动态参数的缩写 (2.6.0+) -->
<a :[key]="url"> ... </a>
```

Class 与 Style 绑定
---

### 对象语法

```html
<div v-bind:class="{ active: isActive }">

</div>
```

传给 `v-bind:class` 一个对象，以动态地切换 `class`

### 与普通的 class 属性共存
<!--rehype:wrap-class=row-span-3-->

```html {2}
<div
  class="static"
  v-bind:class="{
    active: isActive,
    'text-danger': hasError
  }"
></div>
```

如下 data

```js
data: {
  isActive: true,
  hasError: false
}
```

结果渲染为

```html
<div class="static active"></div>
```

### 绑定的数据对象不必内联定义在模板里
<!--rehype:wrap-class=row-span-3-->

```html
<div v-bind:class="classObject"></div>
```

如下 data

```js
data: {
  classObject: {
    active: true,
    'text-danger': false
  }
}
```

结果渲染为

```html
<div class="static active"></div>
```

### 三元表达式

```html
<div v-bind:class="[
  isActive ? activeClass : ''
]">
</div>
```

### 数组

```html
<div v-bind:class="[
  { active: isActive }, errorClass
]"></div>
```

### 数组语法

```html
<div v-bind:class="[
  activeClass, errorClass
]">
</div>
```

如下 data

```js
data: {
  activeClass: 'active',
  errorClass: 'text-danger'
}
```

结果渲染为

```html
<div class="active text-danger"></div>
```

### 内联样式

```html
<div v-bind:style="{
    color: activeColor,
    fontSize: fontSize + 'px'
}"></div>
```

如下 data

```js
data: {
  activeColor: 'red',
  fontSize: 30
}
```

结果渲染为

```html
<div style="color: red; font-size: 30px;"></div>
```

### 内联样式对象通常更好

```html
<div v-bind:style="styleObject"></div>
```

如下 data

```js
data: {
  styleObject: {
    color: 'red',
    fontSize: '13px'
  }
}
```

同样的，对象语法常常结合返回对象的计算属性使用

### 内联样式数组语法

```html
<div v-bind:style="[
  baseStyles, overridingStyles
]"></div>
```

### 内联样式多重值

```html
<div :style="{
  display: ['-webkit-box', 'flex']
}"></div>
```

条件渲染
---

### v-if

```html
<h1 v-if="awesome">Vue is awesome!</h1>
<h1 v-else>Oh no 😢</h1>
```

### v-else-if
<!--rehype:wrap-class=row-span-2-->

```html
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else-if="type === 'C'">C</div>
<div v-else>
  Not A/B/C
</div>
```

`@2.1.0` 新增，必须紧跟在带 `v-if` 或者 `v-else-if` 的元素之后

### v-else
<!--rehype:wrap-class=row-span-2-->

```html
<div v-if="Math.random() > 0.5">
  现在你看到我了
</div>
<div v-else>
  现在你看不见我了
</div>
```

`v-else` 元素必须紧跟在带 `v-if` 或者 `v-else-if` 的元素的后面

### \<template> 上使用 v-if 条件渲染分组

```html
<template v-if="ok">
  <p>Paragraph 1</p>
</template>
```

### 用 key 管理可复用的元素
<!--rehype:wrap-class=col-span-2-->

```html
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="输入用户名" key="username-input">
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="输入邮箱" key="email-input">
</template>
```

### v-show

```html
<h1 v-show="ok">
  Hello!
</h1>
```

带有 `v-show` 的元素始终会被渲染并保留在 DOM 中，只是简单地切换元素的 `CSS` 属性 `display`

列表渲染
---

### v-for

```html {3}
<ul id="example-1">
  <li
    v-for="item in items"
    :key="item.message">
    {{ item.message }}
  </li>
</ul>
```

```js
var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```

### v-for 可选的第二个参数(索引)

```html {2}
<li v-for="(item, index) in items">
  {{ index }}
  {{ item.message }}
</li>
```

如下 `data`

```js
data: {
  items: [
    { message: 'Foo' },
    { message: 'Bar' }
  ]
}
```

也可以用 `of` 替代 `in` 作为分隔符

```html
<div v-for="item of items"></div>
```

### v-for 使用对象
<!--rehype:wrap-class=row-span-2-->

```html
<li v-for="value in object">
  {{ value }}
</li>
```

如下 data

```js
data: {
  object: {
    title: 'How to do lists in Vue',
    author: 'Jane Doe',
    publishedAt: '2016-04-10'
  }
}
```

渲染结果

```
How to do lists in Vue
Jane Doe
2016-04-10
```

提供第二个的参数为 property 名称 (也就是键名)

```html
<div v-for="(value, name) in object">
  {{ name }}: {{ value }}
</div>
```

还可以用第三个参数作为索引

```html
<div v-for="(value,name,index) in object">
  {{ index }}. {{ name }}: {{ value }}
</div>
```

### v-for/v-if

```html {2,3}
<li
  v-for="todo in todos"
  v-if="!todo.isComplete"
>
  {{ todo }}
</li>
```

只渲染未完成的 todo，下面加上 `v-else` 示例

```html
<ul v-if="todos.length">
  <li v-for="todo in todos">
    {{ todo }}
  </li>
</ul>
<p v-else>No todos left!</p>
```

注意: `v-for` 和 `v-if` 不推荐一起使用[参考官方文档](https://v2.cn.vuejs.org/v2/guide/conditional.html#v-if-与-v-for-一起使用)

### 组件上使用 v-for

```html
<my-component
  v-for="(item, index) in items"
  v-bind:item="item"
  v-bind:index="index"
  v-bind:key="item.id"
></my-component>
```

`2.2.0+` 的版本里，当在组件上使用 `v-for` 时，`key` 现在是必须的

事件处理
---

### 监听事件

```html {2}
<div id="example-1">
  <button v-on:click="counter += 1">
    +1
  </button>
  <p>按钮已被点击 {{ counter }} 次。</p>
</div>
```

```js
var example1 = new Vue({
  el: '#example-1',
  data: {
    counter: 0
  }
})
```

### 事件处理方法
<!--rehype:wrap-class=row-span-2-->

```html {3}
<div id="example-2">
  <!-- `greet` 是在下面定义的方法名 -->
  <button v-on:click="greet">
    你好
  </button>
</div>
```

```js
var example2 = new Vue({
  el: '#example-2',
  data: {
    name: 'Vue.js'
  },
  // 在 `methods` 对象中定义方法
  methods: {
    greet: function (event) {
      // `this` 在方法里指向当前 Vue 实例
      alert('Hello ' + this.name + '!')
      // `event` 是原生 DOM 事件
      if (event) {
        alert(event.target.tagName)
      }
    }
  }
})
```

也可以用 JavaScript 直接调用方法

```js
example2.greet() // => 'Hello Vue.js!'
```

### 内联处理器中的方法
<!--rehype:wrap-class=row-span-2-->

```html {2,5}
<div id="example-3">
  <button v-on:click="say('hi')">
    弹出 hi
  </button>
  <button v-on:click="say('what')">
    弹出 what
  </button>
</div>
```

```js {4}
new Vue({
  el: '#example-3',
  methods: {
    say: function (message) {
      alert(message)
    }
  }
})
```

访问原始的 DOM 事件，用特殊变量 $event

```html
<button v-on:click="say('what', $event)">
  提交
</button>
```

```js
methods: {
  say: function (message, event) {
    // 现在我们可以访问原生事件对象
    if (event) {
      event.preventDefault()
    }
    alert(message)
  }
}
```

### 事件修饰符

```html
<!-- 阻止单击事件继续传播 -->
<a v-on:click.stop="doThis"></a>
<!-- 提交事件不再重载页面 -->
<form v-on:submit.prevent="submit"></form>
<!-- 修饰符可以串联 -->
<a v-on:click.stop.prevent="doThat"></a>
<!-- 只有修饰符 -->
<form v-on:submit.prevent></form>
<!-- 添加事件监听器时使用事件捕获模式 -->
<!-- 即内部元素触发的事件先在此处理 -->
<!-- 然后交由内部元素进行处理 -->
<div v-on:click.capture="doThis">...</div>
<!-- 当 event.target 是当前元素自身时触发 -->
<!-- 即事件不是从内部元素触发的 -->
<div v-on:click.self="doThat">...</div>
<!-- 点击事件将只会触发一次 -->
<a v-on:click.once="doThis"></a>
```

### 事件修饰符 passive

```html
<!-- 滚动事件的默认行为(即滚动行为)会立即触发 -->
<!-- 而不会等待 `onScroll` 完成  -->
<!-- 包含 event.preventDefault() 的情况 -->
<p v-on:scroll.passive="onScroll">
  ...
</p>
```

这个 `.passive` [修饰符](#v-on-事件修饰符)尤其能够提升移动端的性能。

### 按键修饰符

```html
<!-- 在 key 是 Enter 时调用 vm.submit() -->
<input v-on:keyup.enter="submit">
<!-- 在 key 是 PageDown 时被调用 -->
<input v-on:keyup.page-down="onPageDown">
<!-- Alt + C -->
<input v-on:keyup.alt.67="clear">
<!-- Ctrl + Click -->
<div v-on:click.ctrl="doSomething">
```

### .exact 修饰符

```html
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button v-on:click.ctrl="onClick">
<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button v-on:click.ctrl.exact="ctrlClick">
<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button v-on:click.exact="onClick">
```

计算属性和侦听器
---

### 基础例子

```html
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>
    计算的反向消息： "{{ reversedMessage }}"
  </p>
</div>
```

```js
var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('')
                  .reverse().join('')
    }
  }
})
```

### 计算属性缓存 vs 方法

```html
<p>
  计算的反向消息："{{ reversedMessage() }}"
</p>
```

在组件中，我们可以将同一函数定义为一个方法而不是一个计算属性

```js
methods: {
  reversedMessage: function () {
    return this.message.split('')
                .reverse().join('')
  }
}
```

两种方式的最终结果确实是完全相同的。然而，不同的是**计算属性是基于它们的响应式依赖进行缓存的**。

### 计算属性 vs 侦听属性
<!--rehype:wrap-class=row-span-2-->

```html
<div id="demo">{{ fullName }}</div>
```

```js
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
    fullName: 'Foo Bar'
  },
  watch: {
    firstName: function (val) {
      this.fullName = 
          val + ' ' + this.lastName
    },
    lastName: function (val) {
      this.fullName =
          this.firstName + ' ' + val
    }
  }
})
```

上面代码是命令式且重复的。将它与计算属性的版本进行比较：

```js
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName 
        + ' ' + this.lastName
    }
  }
})
```

### 计算属性的 setter
<!--rehype:wrap-class=col-span-2-->

```js
computed: {
  fullName: {
    get: function () {         // getter
      return this.firstName + ' ' + this.lastName
    },
    set: function (newValue) { // setter
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
```

表单输入绑定
---

### 文本

```html
<input v-model="msg" placeholder="编辑我">
<p>msg is: {{ msg }}</p>
```

### 多行文本

```html {3}
<span>Multiline message is:</span>
<textarea
  v-model="message"
  placeholder="添加多行"></textarea>
<p>{{ message }}</p>
```

### 复选框

```html {4}
<input
  type="checkbox"
  id="checkbox"
  v-model="checked"
>
<label for="checkbox">{{ checked}}</label>
```

### 多个复选框
<!--rehype:wrap-class=col-span-2-->

```html
<input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
<label for="jack">Jack</label>
<input type="checkbox" id="john" value="John" v-model="checkedNames">
<label for="john">John</label>
<input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
<label for="mike">Mike</label>
<br>
<span>Checked names: {{ checkedNames }}</span>
```

如下 data

```js
new Vue({
  el: '...',
  data: {
    checkedNames: []
  }
})
```

### 单选按钮

```html
<div id="example-4">
  <input type="radio" id="one" value="One"
    v-model="picked">
  <label for="one">One</label>
  <br>
  <input type="radio" id="two" value="Two"
    v-model="picked">
  <label for="two">Two</label>
  <div>Picked: {{ picked }}</div>
</div>
```

---

```js
new Vue({
  el: '#example-4',
  data: {
    picked: ''
  }
})
```

### 选择框

```html
<select v-model="selected">
  <option disabled value="">请选择</option>
  <option>A</option>
  <option>B</option>
  <option>C</option>
</select>
<span>Selected: {{ selected }}</span>
```

---

```js
new Vue({
  el: '...',
  data: {
    selected: ''
  }
})
```

### 选择框(数组)

```html
<select v-model="selected" multiple>
  <option>A</option>
  <option>B</option>
  <option>C</option>
</select>
<div>Selected: {{ selected }}</div>
```

---

```js
new Vue({
  el: '...',
  data: {
    selected: []
  }
})
```

### v-for 渲染的动态选项
<!--rehype:wrap-class=row-span-2-->

```html {3-4}
<select v-model="selected">
  <option
    v-for="option in options"
    v-bind:value="option.value"
  >
    {{ option.text }}
  </option>
</select>
<span>Selected: {{ selected }}</span>
```

---

```js {6-8}
new Vue({
  el: '...',
  data: {
    selected: 'A',
    options: [
      { text: 'One', value: 'A' },
      { text: 'Two', value: 'B' },
      { text: 'Three', value: 'C' }
    ]
  }
})
```

### 值绑定

```html
<!-- 当选中时，pc 为字符串 "a" -->
<input type="radio" v-model="pc" value="a">

<!-- toggle 为 true 或 false -->
<input type="checkbox" v-model="toggle">
<!-- 选中第一个选项时selected为字符串 abc -->
<select v-model="selected">
  <option value="abc">ABC</option>
</select>
```

### 单选按钮

```html
<input
  type="radio"
  v-model="pick"
  v-bind:value="a">
```

当选中时

```js
vm.pick === vm.a
```

### 复选框

```html {3}
<input
  type="checkbox"
  v-model="toggle"
  true-value="yes"
  false-value="no"
>
```

---

```js
// 当选中时
vm.toggle === 'yes'
// 当没有选中时
vm.toggle === 'no'
```

### 选择框的选项

```html
<select v-model="selected">
  <!-- 内联对象字面量 -->
  <option v-bind:value="{ number: 123 }">
    123
  </option>
</select>
```

当选中时

```js
typeof vm.selected // => 'object'
vm.selected.number // => 123
```

### 修饰符

```html
<!-- lazy:在“change”时而非“input”时更新 -->
<input v-model.lazy="msg">

<!-- number:自动将用户的输入值转为数值类型 -->
<input v-model.number="age" type="number">

<!-- trim:自动过滤用户输入的首尾空白字符 -->
<input v-model.trim="msg">
```

组件基础
---

### 单文件组件
<!--rehype:wrap-class=row-span-3-->

- 将 `HTML`/`CSS`/`JS` 三部分存放到一个 `Hello.vue` 文件中

  ```html
  <template>
    <p>{{ title }} World!</p>
  </template>
  <script>
    export default {
      name: 'Hello',
      props: {
        title: {
          type: String,
          default: 'Hello'
        }
      },
      data: function() {
        return {
          greeting: "Hello"
        };
      }
    };
  </script>
  <style scoped>
    p {
      font-size: 2em;
      text-align: center;
    }
  </style>
  ```

- 使用 `Hello.vue` 组件

  ```html
  <script>
    import Vue from "vue";
    import Hello from "./Hello";

    export default {
      components: { Hello }
    }
  </script>
  <template>
    <div>
      <Hello :title="'aaaa'"></Hello>
    </div>
  </template>
  ```
<!--rehype:className=style-timeline-->

### 基本示例
<!--rehype:wrap-class=row-span-2-->

```js
Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },
  template: `
    <button v-on:click="count++">
      你点击了我 {{ count }} 次
    </button>
  `
})
```

组件是可复用的 `Vue` 实例

```html
<div id="components-demo">
  <button-counter></button-counter>
</div>
```

---

```js
new Vue({
  el: '#components-demo'
})
```

组件的复用

```html
<div id="components-demo">
  <button-counter></button-counter>
  <button-counter></button-counter>
  <button-counter></button-counter>
</div>
```

### 单个根元素

```js {4}
Vue.component('blog-post', {
  props: ['post'],
  template: `
    <div class="blog-post">
      <h3>{{ post.title }}</h3>
      <div v-html="post.content"></div>
    </div>
  `
})
```

---

```html
<blog-post
  v-for="post in posts"
  v-bind:key="post.id"
  v-bind:post="post"
>
</blog-post>
```

### 向子组件传递数据

```js
Vue.component('blog-post', {
  props: ['title'],
  template: '<h3>{{ title }}</h3>'
})
```

当值传递给一个 `prop` `attribute` 的时候，变成了组件实例的一个 `property`

```html
<blog-post title="写博客"></blog-post>
<blog-post title="如此有趣"></blog-post>
```

### `data` 必须是一个函数

```js
data: function () {
  return {
    count: 0
  }
}
```

组件的 `data` 选项必须是一个函数

### 监听子组件事件
<!--rehype:wrap-class=row-span-2-->

```js {7}
Vue.component('blog-post', {
  props: ['post'],
  template: `
    <div class="blog-post">
      <h3>{{ post.title }}</h3>
      <button
        v-on:click="$emit('enlarge-txt')"
      >放大文字
      </button>
      <div v-html="post.content"></div>
    </div>
  `
})
```

---

```html {3}
<blog-post
  ...
  v-on:enlarge-text="postFontSize += 0.1"
></blog-post>
```

可以使用 `$emit` 的第二个参数来提供这个值

```html {2}
<button
  v-on:click="$emit('enlarge-text', 0.1)"
>
  Enlarge text
</button>
```

通过 `$event` 访问到被抛出的这个值

```html {3}
<blog-post
  ...
  v-on:enlarge-text="postFontSize += $event"
></blog-post>
```

如果这个事件处理函数是一个方法

```html {3}
<blog-post
  ...
  v-on:enlarge-text="onEnlargeText"
></blog-post>
```

那么这个值将会作为第一个参数传入这个方法

```js
methods: {
  onEnlargeText: function(enlargeAmount) {
    this.postFontSize += enlargeAmount
  }
}
```

### 在组件上使用 v-model
<!--rehype:wrap-class=col-span-2-->

自定义事件也可以用于创建支持 `v-model` 的自定义输入组件。

```html
<input v-model="searchText">
```

等价于

```html
<input
  v-bind:value="searchText"
  v-on:input="searchText = $event.target.value"
>
```

当用在组件上时，v-model 则会这样：

```html
<custom-input
  v-bind:value="searchText"
  v-on:input="searchText = $event"
></custom-input>
```

为了让它正常工作，这个组件内的 \<input> 必须：

- 将其 `value` attribute 绑定到一个名叫 `value` 的 `prop` 上
- 在其 `input` 事件被触发时，将新的值通过自定义的 `input` 事件抛出

---

```js
Vue.component('custom-input', {
  props: ['value'],
  template: `
    <input
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
  `
})
```

现在 `v-model` 就应该可以在这个组件上完美地工作起来了

```html {2}
<custom-input
  v-model="searchText"
>
</custom-input>
```

### 通过插槽分发内容

```html
<alert-box>
  发生了不好的事情。
</alert-box>
```

---

```js {5}
Vue.component('alert-box', {
  template: `
    <div class="demo-alert-box">
      <strong>Error!</strong>
      <slot></slot>
    </div>
  `
})
```

### 动态组件示例
<!--rehype:wrap-class=col-span-2 row-span-2-->

```html
<div id="dynamic-component-demo" class="demo">
  <button
    v-for="tab in tabs"
    v-bind:key="tab"
    v-bind:class="['tab-button', { active: currentTab === tab }]"
    v-on:click="currentTab = tab"
  >
    {{ tab }}
  </button>
  <component v-bind:is="currentTabComponent" class="tab"></component>
</div>

<script>
  Vue.component("tab-home", {
    template: "<div>Home component</div>"
  });
  Vue.component("tab-posts", {
    template: "<div>Posts component</div>"
  });
  Vue.component("tab-archive", {
    template: "<div>Archive component</div>"
  });
  new Vue({
    el: "#dynamic-component-demo",
    data: {
      currentTab: "Home",
      tabs: ["Home", "Posts", "Archive"]
    },
    computed: {
      currentTabComponent: function() {
        return "tab-" + this.currentTab.toLowerCase();
      }
    }
  });
</script>
```

### 解析 DOM 模板时的注意事项

有些 HTML 元素，诸如 `<ul>`、`<ol>`、`<table>` 和 `<select>`，对于哪些元素可以出现在其内部是有严格限制的。有些元素，诸如 `<li>`、`<tr>` 和 `<option>`，只能出现在其它某些特定的元素内部

```html
<table>
  <blog-post-row></blog-post-row>
</table>
```

`<blog-post-row>` 会被作为无效的内容提升到外部

---

如果我们从以下来源使用模板的话，这条限制是不存在的

- 字符串 (例如：`template: '...'`)
- 单文件组件 (`.vue`)
- `<script type="text/x-template">`
<!--rehype:className=style-round-->

过渡 & 动画
---

### 单元素/组件的过渡
<!--rehype:wrap-class=row-span-2-->

```html
<template>
  <button v-on:click="show = !show">
    切换
  </button>
  <transition name="fade">
    <p v-if="show">切换内容</p>
  </transition>
</template>

<script>
  export default {
    data: function() {
      return {
        show: true
      };
    }
  };
</script>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  /* .fade-leave-active 低于 2.1.8 版本 */
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
```

### CSS 过渡
<!--rehype:wrap-class=row-span-2-->

```html
<template>
  <button @click="show = !show">
    切换渲染
  </button>
  <transition name="slide-fade">
    <p v-if="show">切换内容</p>
  </transition>
</template>
<script>
  export default {
    data: function() {
      return {
        show: true
      };
    }
  };
</script>
<style scoped>
  /* 可以设置不同的进入和离开动画 */
  /* 设置持续时间和动画函数 */
  .slide-fade-enter-active {
    transition: all .3s ease;
  }
  .slide-fade-leave-active {
    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  /* .slide-fade-leave-active 用于 2.1.8 以下版本 */ 
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateX(10px);
    opacity: 0;
  }
</style>
```

### CSS 动画
<!--rehype:wrap-class=row-span-2-->

```html
<template>
  <button @click="show = !show">切换展示</button>
  <transition name="bounce">
    <p v-if="show">切换内容</p>
  </transition>
</template>
<script>
  export default {
    data: function() {
      return {
        show: true
      };
    }
  };
</script>
<style scoped>
.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
```

### 过渡的类名
<!--rehype:wrap-class=row-span-2-->

:- | :-
:- | :-
`v-enter` | 定义进入过渡的开始状态 [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#过渡的类名)
`v-enter-active` | 定义进入过渡生效时的状态 [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#过渡的类名)
`v-enter-to` _(2.1.8)_ | 定义进入过渡的结束状态 [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#过渡的类名)
`v-leave` | 定义离开过渡的开始状态 [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#过渡的类名)
`v-leave-active` | 定义离开过渡生效时的状态 [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#过渡的类名)
`v-leave-to` _(2.1.8)_| 定义离开过渡的结束状态 [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#过渡的类名)

如果你使用了 `<transition name="my-tran">`，那么 `v-enter` 会替换为 `my-tran-enter`。

#### 自定义过渡的类名

:- | :-
:- | :-
`enter-class` | [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#自定义过渡的类名)
`enter-active-class` | [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#自定义过渡的类名)
`enter-to-class` _(2.1.8+)_ | [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#自定义过渡的类名)
`leave-class` | [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#自定义过渡的类名)
`leave-active-class` | [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#自定义过渡的类名)
`leave-to-class` _(2.1.8+)_ | [#](https://v2.cn.vuejs.org/v2/guide/transitions.html#自定义过渡的类名)

---

```html
<transition
  name="custom-classes-transition"
  enter-active-class="animated tada"
  leave-active-class="animated bounceOutRight"
>
  <p v-if="show">hello</p>
</transition>
```

### 显性的过渡持续时间

`<transition>` 组件上的 `duration` prop 定制一个显性的过渡持续时间 (以毫秒计)：

```html
<transition :duration="1000">
  ...
</transition>
```

你也可以定制进入和移出的持续时间：

```html
<transition :duration="{
  enter: 500,
  leave: 800
}">
  ...
</transition>
```

### 初始渲染的过渡
<!--rehype:wrap-class=row-span-2-->

可以通过 `appear` attribute 设置节点在初始渲染的过渡

```html
<transition appear>
  <!-- ... -->
</transition>
```

这里默认和进入/离开过渡一样，同样也可以自定义 CSS 类名

```html
<transition
  appear
  appear-class="custom-appear-class"
  appear-to-class="custom-appear-to-class"
  appear-active-class="custom-appear-active-class"
>
  <!-- ... -->
</transition>
```

自定义 JavaScript 钩子：

```html
<transition
  appear
  v-on:before-appear="customBeforeAppearHook"
  v-on:appear="customAppearHook"
  v-on:after-appear="customAfterAppearHook"
  v-on:appear-cancelled="customAppearCancelledHook"
>
  <!-- ... -->
</transition>
```

无论是 `appear` attribute 还是 `v-on:appear` 钩子都会生成初始渲染过渡

### JavaScript 钩子

```html
<transition
  v-on:before-enter="beforeEnter"
  v-on:enter="enter"
  v-on:after-enter="afterEnter"
  v-on:enter-cancelled="enterCancelled"

  v-on:before-leave="beforeLeave"
  v-on:leave="leave"
  v-on:after-leave="afterLeave"
  v-on:leave-cancelled="leaveCancelled"
>
  <!-- ... -->
</transition>
```

钩子函数可以结合 CSS `transitions`/`animations` 使用，也可以单独使用

### 列表的进入/离开过渡
<!--rehype:wrap-class=col-span-2-->

```html
<template>
  <button v-on:click="add">添加</button>
  <button v-on:click="remove">删除</button>
  <transition-group name="list" tag="p">
    <span v-for="item in items" v-bind:key="item" class="list-item">
      {{ item }}
    </span>
  </transition-group>
</template>
<script>
  export default {
    data: function() {
      return {
        items: [1,2,3,4,5,6,7,8,9],
        nextNum: 10
      };
    },
    methods: {
      randomIndex: function () {
        return Math.floor(Math.random() * this.items.length)
      },
      add: function () {
        this.items.splice(this.randomIndex(), 0, this.nextNum++)
      },
      remove: function () {
        this.items.splice(this.randomIndex(), 1)
      },
    }
  };
</script>
<style scoped>
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  /* .list-leave-active 适用于 2.1.8 以下版本 */
  .list-enter, .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
</style>
```

Vue 2 API 参考
---

### 全局配置
<!--rehype:wrap-class=row-span-2-->

:- | :-
:- | :-
`silent` | 取消所有的日志与警告 [#](https://v2.cn.vuejs.org/v2/api/#silent)
`optionMergeStrategies` | 自定义合并策略的选项 [#](https://v2.cn.vuejs.org/v2/api/#optionMergeStrategies)
`devtools` | 是否允许 [devtools](https://github.com/vuejs/vue-devtools) 检查 [#](https://v2.cn.vuejs.org/v2/api/#devtools)
`errorHandler` | 未捕获错误的处理函数 _(开发模式生效)_ [#](https://v2.cn.vuejs.org/v2/api/#errorHandler)
`warnHandler` _(2.4.0)_ | 运行时警告处理函数 [#](https://v2.cn.vuejs.org/v2/api/#warnHandler)
`ignoredElements` | 忽略 Vue 之外的 _(自定义元素)_ [#](https://v2.cn.vuejs.org/v2/api/#ignoredElements)
`keyCodes` | `v-on` 自定义键位别名 [#](https://v2.cn.vuejs.org/v2/api/#keyCodes)
`performance` _(2.2.0)_ | 性能追踪 [#](https://v2.cn.vuejs.org/v2/api/#performance)
`productionTip` _(2.2.0)_ | 是否生成生产提示 [#](https://v2.cn.vuejs.org/v2/api/#productionTip)

### 全局 API
<!--rehype:wrap-class=row-span-2-->

:- | :-
:- | :-
`Vue.extend` | Vue 构造器，创建一个“子类” [#](https://v2.cn.vuejs.org/v2/api/#Vue-extend)
`Vue.nextTick` | 执行延迟回调 [#](https://v2.cn.vuejs.org/v2/api/#Vue-nextTick)
`Vue.set` | 向响应式对象中添加一个属性 [#](https://v2.cn.vuejs.org/v2/api/#Vue-set)
`Vue.delete` | 删除对象的 property [#](https://v2.cn.vuejs.org/v2/api/#Vue-delete)
`Vue.directive` | 注册或获取全局指令 [#](https://v2.cn.vuejs.org/v2/api/#Vue-directive)
`Vue.filter` | 注册或获取全局过滤器 [#](https://v2.cn.vuejs.org/v2/api/#Vue-filter)
`Vue.component` | 注册或获取全局组件 [#](https://v2.cn.vuejs.org/v2/api/#Vue-component)
`Vue.use` | 安装 Vue.js 插件 [#](https://v2.cn.vuejs.org/v2/api/#Vue-use)
`Vue.mixin` | 全局注册一个混入 [#](https://v2.cn.vuejs.org/v2/api/#Vue-mixin)
`Vue.compile` | 将模板字符串编译成 render 函数 [#](https://v2.cn.vuejs.org/v2/api/#Vue-compile)
`Vue.observable` _(2.6.0)_ | 让一个对象可响应 [#](https://v2.cn.vuejs.org/v2/api/#Vue-observable)
`Vue.version` | Vue 安装版本号 [#](https://v2.cn.vuejs.org/v2/api/#Vue-version)

### 数据

:- | :-
:- | :-
`data` | 实例的数据对象 [#](https://v2.cn.vuejs.org/v2/api/#data)
`props` | 接收来自父组件的数据 [#](https://v2.cn.vuejs.org/v2/api/#props)
`propsData` | 创建实例时传递 props [#](https://v2.cn.vuejs.org/v2/api/#propsData)
`computed` | 计算属性将被混入到 Vue 实例中 [#](https://v2.cn.vuejs.org/v2/api/#computed)
`methods` | 将被混入到 Vue 实例中 [#](https://v2.cn.vuejs.org/v2/api/#methods)
`watch` | 对象键是观察的表达式，值是回调函数 [#](https://v2.cn.vuejs.org/v2/api/#watch)

### DOM

:- | :-
:- | :-
`el` | 实例的挂载目标 [#](https://v2.cn.vuejs.org/v2/api/#el)
`template` | 字符串模板作为 Vue 实例的标识使用 [#](https://v2.cn.vuejs.org/v2/api/#template)
`render` | 字符串模板的代替方案 [#](https://v2.cn.vuejs.org/v2/api/#render)
`renderError` _(2.2.0)_ | `render`错误时提供另一种渲染 [#](https://v2.cn.vuejs.org/v2/api/#renderError)

### 生命周期钩子
<!--rehype:wrap-class=row-span-2-->

:- | :-
:- | :-
`beforeCreate` | 实例初始化之后 [#](https://v2.cn.vuejs.org/v2/api/#beforeCreate)
`created` | 实例创建完成后被立即同步调用 [#](https://v2.cn.vuejs.org/v2/api/#created)
`beforeMount` | 在挂载开始之前被调用 [#](https://v2.cn.vuejs.org/v2/api/#beforeMount)
`mounted` | 实例被挂载后调用 [#](https://v2.cn.vuejs.org/v2/api/#mounted)
`beforeUpdate` | 数据改变后 DOM 更新之前调用 [#](https://v2.cn.vuejs.org/v2/api/#beforeUpdate)
`updated` | 数据更改更新完毕之后被调用 [#](https://v2.cn.vuejs.org/v2/api/#updated)
`activated` | keep-alive 缓存组件激活时调用 [#](https://v2.cn.vuejs.org/v2/api/#activated)
`deactivated` | keep-alive 缓存的组件失活时调用 [#](https://v2.cn.vuejs.org/v2/api/#deactivated)
`beforeDestroy` | 实例销毁之前调用 [#](https://v2.cn.vuejs.org/v2/api/#beforeDestroy)
`destroyed` | 实例销毁后调用 [#](https://v2.cn.vuejs.org/v2/api/#destroyed)
`errorCaptured` _(2.5.0)_ | 来自后代组件的错误时被调用 [#](https://v2.cn.vuejs.org/v2/api/#errorCaptured)

### 资源

:- | :-
:- | :-
`directives` | 包含 Vue 实例可用指令的哈希表 [#](https://v2.cn.vuejs.org/v2/api/#directives)
`filters` | 包含 Vue 实例可用过滤器的哈希表 [#](https://v2.cn.vuejs.org/v2/api/#filters)
`components` | 包含 Vue 实例可用组件的哈希表 [#](https://v2.cn.vuejs.org/v2/api/#components)

### 组合

:- | :-
:- | :-
`parent` | 指定已创建的实例之父实例 [#](https://v2.cn.vuejs.org/v2/api/#parent)
`mixins` | 接收一个混入对象的数组 [#](https://v2.cn.vuejs.org/v2/api/#mixins)
`extends` | 声明扩展另一个组件 [#](https://v2.cn.vuejs.org/v2/api/#extends)
`provide/inject` _(2.2.0)_ | 祖组件向所有子孙后代注入依赖 [#](https://v2.cn.vuejs.org/v2/api/#provide-inject)

### 其它

:- | :-
:- | :-
`name` | 允许组件模板递归地调用自身 [#](https://v2.cn.vuejs.org/v2/api/#name)
`delimiters` | 改变纯文本插入分隔符 [#](https://v2.cn.vuejs.org/v2/api/#delimiters)
`functional` | 使组件无状态和无实例 [#](https://v2.cn.vuejs.org/v2/api/#functional)
`model` _(2.2.0)_ | 使用 v-model 时定制 prop 和 event [#](https://v2.cn.vuejs.org/v2/api/#model)
`inheritAttrs` _(2.4.0)_ | [#](https://v2.cn.vuejs.org/v2/api/#inheritAttrs)
`comments` _(2.4.0)_ | 是否保留模板中的`HTML`注释 [#](https://v2.cn.vuejs.org/v2/api/#comments)

### 实例方法 / 数据

:- | :-
:- | :-
`vm.$watch` | 观察 Vue 实例上的一个表达式<br/>或者一个函数计算结果的变化 [#](https://v2.cn.vuejs.org/v2/api/#vm-watch)
`vm.$set` | 全局 `Vue.set` 的别名 [#](https://v2.cn.vuejs.org/v2/api/#vm-set)
`vm.$delete` | 全局 `Vue.delete` 的别名 [#](https://v2.cn.vuejs.org/v2/api/#vm-delete)

### 实例 property
<!--rehype:wrap-class=row-span-3-->

:- | :-
:- | :-
`vm.$data` | 观察的数据对象 [#](https://v2.cn.vuejs.org/v2/api/#vm-data)
`vm.$props` _(2.2.0)_ | 组件接收的 props 对象 [#](https://v2.cn.vuejs.org/v2/api/#vm-props)
`vm.$el` | 实例使用的根 DOM 元素 [#](https://v2.cn.vuejs.org/v2/api/#vm-el)
`vm.$options` | 实例的初始化选项 [#](https://v2.cn.vuejs.org/v2/api/#vm-options)
`vm.$parent` | 父实例 [#](https://v2.cn.vuejs.org/v2/api/#vm-parent)
`vm.$root` | 当前组件树的根实例 [#](https://v2.cn.vuejs.org/v2/api/#vm-root)
`vm.$children` | 当前实例的直接子组件 [#](https://v2.cn.vuejs.org/v2/api/#vm-children)
`vm.$slots` | 访问被插槽分发的内容 [#](https://v2.cn.vuejs.org/v2/api/#vm-slots)
`vm.$scopedSlots` _(2.1.0)_ | 访问作用域插槽 [#](https://v2.cn.vuejs.org/v2/api/#vm-scopedSlots)
`vm.$refs` | DOM 元素和组件实例 [#](https://v2.cn.vuejs.org/v2/api/#vm-refs)
`vm.$isServer` | 是否运行于服务器 [#](https://v2.cn.vuejs.org/v2/api/#vm-isServer)
`vm.$attrs` _(2.4.0)_ | 包含父作用域中不作为 prop 被识别的属性绑定 ( [#](https://v2.cn.vuejs.org/v2/api/#vm-attrs)
`vm.$listeners` _(2.4.0)_ | 包含了父作用域中的 (不含 .native 修饰器的) `v-on` 事件监听器 [#](https://v2.cn.vuejs.org/v2/api/#vm-listeners)

### 实例方法 / 事件

:- | :-
:- | :-
`vm.$on` | 监听当前实例上的自定义事件 [#](https://v2.cn.vuejs.org/v2/api/#vm-on)
`vm.$once` | 监听一个自定义事件，只触发一次 [#](https://v2.cn.vuejs.org/v2/api/#vm-once)
`vm.$off` | 移除自定义事件监听器 [#](https://v2.cn.vuejs.org/v2/api/#vm-off)
`vm.$emit` | 触发当前实例上的事 [#](https://v2.cn.vuejs.org/v2/api/#vm-emit)

### 实例方法 / 生命周期

:- | :-
:- | :-
`vm.$mount` | 手动地挂载一个未挂载的实例 [#](https://v2.cn.vuejs.org/v2/api/#vm-mount)
`vm.$forceUpdate` | 迫使 Vue 实例重新渲染 [#](https://v2.cn.vuejs.org/v2/api/#vm-forceUpdate)
`vm.$nextTick` | 回调延迟执行 [#](https://v2.cn.vuejs.org/v2/api/#vm-nextTick)
`vm.$destroy` | 完全销毁一个实例 [#](https://v2.cn.vuejs.org/v2/api/#vm-destroy)

### 指令
<!--rehype:wrap-class=row-span-2-->

:- | :-
:- | :-
`v-text` | 更新元素的 `textContent` [#](https://v2.cn.vuejs.org/v2/api/#v-text)
`v-html` | 更新元素的 `innerHTML` [#](https://v2.cn.vuejs.org/v2/api/#v-html)
`v-show` | 切换元素的 `display` css 属性 [#](https://v2.cn.vuejs.org/v2/api/#v-show)
`v-if` | 有条件地渲染元素 [#](https://v2.cn.vuejs.org/v2/api/#v-if)
`v-else` | [#](https://v2.cn.vuejs.org/v2/api/#v-else)
`v-else-if` _(2.1.0)_ | [#](https://v2.cn.vuejs.org/v2/api/#v-else-if)
`v-for` | 多次渲染元素或模板块 [#](https://v2.cn.vuejs.org/v2/api/#v-for)
`v-on` | 绑定事件监听器 [#](https://v2.cn.vuejs.org/v2/api/#v-on)
`v-bind` | 动态地绑定一个或多个属性  [#](https://v2.cn.vuejs.org/v2/api/#v-bind)
`v-model` | 创建双向绑定 [#](https://v2.cn.vuejs.org/v2/api/#v-model)
`v-slot` | 提供插槽或接收 prop 的插槽 [#](https://v2.cn.vuejs.org/v2/api/#v-slot)
`v-pre` | 跳过元素和它的子元素编译过程 [#](https://v2.cn.vuejs.org/v2/api/#v-pre)
`v-cloak` | 保持在元素上直到实例结束编译 [#](https://v2.cn.vuejs.org/v2/api/#v-cloak)
`v-once` | 只渲染元素和组件一次 [#](https://v2.cn.vuejs.org/v2/api/#v-once)

### 特殊 attribute

:- | :-
:- | :-
`key` | 用在 Vue 的虚拟 DOM 算法 [#](https://v2.cn.vuejs.org/v2/api/#key)
`ref` | 元素或子组件注册引用信息 [#](https://v2.cn.vuejs.org/v2/api/#ref)
`is` | 限制是否更新 [#](https://v2.cn.vuejs.org/v2/api/#is)
~~`slot`~~ | 推荐 2.6.0 新增的 `v-slot` [#](https://v2.cn.vuejs.org/v2/api/#slot-废弃)
~~`slot-scope`~~ | 推荐 2.6.0 新增的 `v-slot` [#](https://v2.cn.vuejs.org/v2/api/#slot-scope-废弃)
~~`scope`~~ | `2.5.0` 新增的 `slot-scope` 取代 [#](https://v2.cn.vuejs.org/v2/api/#scope-移除)

### 内置的组件

:- | :-
:- | :-
`<component>` | 渲染一个`元组件`为动态组件 [#](https://v2.cn.vuejs.org/v2/api/#component)
`<transition>` | 单个元素/组件的过渡效果 [#](https://v2.cn.vuejs.org/v2/api/#transition)
`<transition-group>` | 多个元素/组件的过渡效果 [#](https://v2.cn.vuejs.org/v2/api/#transition-group)
`<keep-alive>` | 不活动的实例缓存不销毁 [#](https://v2.cn.vuejs.org/v2/api/#keep-alive)
`<slot>` | 组件模板中的内容分发插槽 [#](https://v2.cn.vuejs.org/v2/api/#slot)

### v-on (事件)修饰符
<!--rehype:wrap-class=row-span-2-->

:- | :-
:- | :-
`v-on:click.stop` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 调用 event.stopPropagation()。
`v-on:click.prevent` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 调用 event.preventDefault()。
`v-on:click.capture` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 添加事件侦听器时使用 capture 模式。
`v-on:click.self` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 只当事件是从侦听器绑定的元素本身触发时才触发回调。
`v-on:click.{keyCode\|keyAlias}` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 只当事件是从特定键触发时才触发回调。
`v-on:click.native` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 监听组件根元素的原生事件。
`v-on:click.once` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 只触发一次回调。
`v-on:click.passive` _(2.3.0)_ [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 以 { passive: true } 模式添加侦听器
<!--rehype:className=style-list-->

### v-on (鼠标)修饰符

:- | :-
:- | :-
`v-on:click.left` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 只当点击鼠标左键时触发
`v-on:click.right` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 只当点击鼠标右键时触发
`v-on:click.middle` [#](https://v2.cn.vuejs.org/v2/api/#v-on) | 只当点击鼠标中键时触发

在 _(2.2.0)_ 中新增

### 系统修饰键

:- | :-
:- | :-
`v-on:keyup.ctrl` _(2.1.0)_ | [#](https://v2.cn.vuejs.org/v2/guide/events.html#系统修饰键)
`v-on:keyup.alt` _(2.1.0)_ | [#](https://v2.cn.vuejs.org/v2/guide/events.html#系统修饰键)
`v-on:keyup.shift` _(2.1.0)_ | [#](https://v2.cn.vuejs.org/v2/guide/events.html#系统修饰键)
`v-on:keyup.meta` _(2.1.0)_ | [#](https://v2.cn.vuejs.org/v2/guide/events.html#系统修饰键)

### Keyboard 按键修饰符

:- | :-
:- | :-
`v-on:keyup.enter` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.tab` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.delete` | 捕获“删除”和“退格”键 [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.esc` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.space` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.up` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.down` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.left` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)
`v-on:keyup.right` | [#](https://v2.cn.vuejs.org/v2/guide/events.html#按键修饰符)

### v-bind 修饰符

:- | :-
:- | :-
`v-bind.prop` [#](https://v2.cn.vuejs.org/v2/api/#v-bind) | 作为一个 DOM property 绑定而不是作为 attribute 绑定。([差别在哪里？](https://stackoverflow.com/questions/6003819/properties-and-attributes-in-html#answer-6004028))
`v-bind.camel` _(2.1.0+)_ [#](https://v2.cn.vuejs.org/v2/api/#v-bind) | 将 kebab-case attribute 名转换为 camelCase。
`v-bind.sync` _(2.3.0+)_ [#](https://v2.cn.vuejs.org/v2/api/#v-bind) | 语法糖，会扩展成一个更新父组件绑定值的 v-on 侦听器。
<!--rehype:className=style-list-->

另见
---

- [Vue Essentials Cheat-Sheet.pdf](https://www.vuemastery.com/pdf/Vue-Essentials-Cheat-Sheet.pdf) _(vuemastery.com)_
- [Vue 2 官方文档](https://v2.cn.vuejs.org/) _(vuejs.org)_
- [Vue 2 实例方法事件](https://marozed.com/vue-cheatsheet#Instance-Methods-Events) _(marozed.com)_

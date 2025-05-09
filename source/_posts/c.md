---
title: C 备忘录
date: 2025-01-08 10:40:26
categories:
    - 后端编程
tags:
    - C
    - 后端编程
keywords: C, 速记, 语法, 速查, 备忘录，速查表，速记手册
cover: https://img.picui.cn/free/2025/05/06/681959e4eda44.jpg
banner:
      type: img
      bgurl: https://img.picui.cn/free/2025/05/06/681959e4eda44.jpg
      banner_text: C 备忘录
      toc: true 
      comments: true
---
C 备忘清单
===

提供基本语法和方法的 C 快速参考备忘单。

入门
----

### hello.c

```c
#include <stdio.h>

int main() {
  printf("Hello World!");
  return 0;
}
```

使用 `gcc` 编译 `hello.c` 源文件

```bash
$ gcc -o hello hello.c
```

运行编译后的二进制文件可执行文件(`hello`)

```bash
$ ./hello
# 输出 => Hello World
```

### 变量
<!--rehype:wrap-class=row-span-2-->

```c
int myNum = 15; // 定义并初始化变量 myNum
int myNum2;     // 声明变量 myNum2
myNum2 = 15;    // 初始化变量 myNum2

int myNum3 = 15; // 定义并初始化变量 myNum3
myNum3 = 10;     // 重新赋值 myNum3
```

定义不同类型的变量

```c
// 定义并初始化浮点数变量
float myFloatNum = 5.99;
// 定义并初始化字符变量
char myLetter = 'D';
```

变量相加

```c
int x = 5, y = 6;
int sum = x + y; // 变量相加
```

声明并初始化多个变量

```c
int x = 5, y = 6, z = 50;
int a, b, c = 10;
```

仅声明变量不初始化

```c
int result;
// 未初始化的变量 result 会导致不可预测的结果

result = result + 10; // 错误：未初始化的变量
// 部分编译器会警告未初始化的变量可能导致未定义行为
```

### 常量 Constants
<!--rehype:wrap-class=row-span-2-->

常量是不能被改变的值，使用常量可以使代码更清晰和安全。

```c
const int minutesPerHour = 60;
const float PI = 3.14;
```

最佳实践

```c
const int BIRTHYEAR = 1980;
```

#### **命名规范**
<!--rehype:style=text-align: left;-->

常量通常使用全大写字母，单词间用下划线分隔（如 BIRTHYEAR、MAX_LENGTH）。

#### **数组大小**
<!--rehype:style=text-align: left;-->

使用 `const` 定义数组大小，编译器将其作为编译时常量处理。

#### **`#define` 与 `const`**
<!--rehype:style=text-align: left;-->

- `#define`：宏常量在预处理阶段替换，不进行类型检查
- `const`：类型安全的常量，编译器可检查类型，推荐使用

#### **注意事项**

- `const` 常量在定义时必须初始化，否则会导致编译错误。
- `const` 常量的值不能被修改，任何尝试修改 `const` 常量的操作都会导致编译错误。
- 使用 `const` 常量可以提高代码的可读性和可维护性，避免魔法数字的使用。

### 注释

```c
// 这是一个单行注释
printf("Hello World!"); // 行内注释

/* 
   多行注释：
   用于注释跨多行的内容
   注意：多行注释不能嵌套，否则会导致编译错误
*/
```

**注意**:

- 单行注释 `//` 可以嵌套，如 `/////`。
- 行内注释应避免过长，以免影响代码可读性。
- 多行注释不能嵌套，否则会导致编译错误。

```c
/* 这是一个多行注释的开始
       /* 嵌套的多行注释，C语言不支持 */
*/
```
<!--rehype:style=background:#ff000030;-->

### 打印文本

```c
printf("I am learning C.");
int testInteger = 5;
printf("Number = %d", testInteger);

float f = 5.99; // 浮点数
printf("Value = %f", f);

short a = 0b1010110;  // 2 进制数字
int b = 02713;        // 8 进制数字
long c = 0X1DAB83;    // 16 进制数字
```

变量a和c分别为 `short` 和 `long` 型，所以输出必须加上对应的修饰符 `h` 和 `l`

#### 以 8 进制形式输出

```c
printf("a=%ho, b=%o, c=%lo\n", a, b, c);
// 输出 => a=126, b=2713, c=7325603
```

#### 以 10 进制形式输出

```c
printf("a=%hd, b=%d, c=%ld\n", a, b, c);
// 输出 => a=86, b=1483, c=1944451
```

#### 以 16 进制形式输出（字母小写）

```c
printf("a=%hx, b=%x, c=%lx\n", a, b, c);
// 输出 => a=56, b=5cb, c=1dab83
```

#### 以 16 进制形式输出（字母大写）

```c
printf("a=%hX, b=%X, c=%lX\n", a, b, c);
// 输出 => a=56, b=5CB, c=1DAB83
```

### 控制空格数

```c
int a1=20, a2=345, a3=700;
int b1=56720, b2=9999, b3=20098;
int c1=233, c2=205, c3=1;
int d1=34, d2=0, d3=23;

// %-9d: 十进制输出，最少宽度为9，左对齐
printf("%-9d %-9d %-9d\n", a1, a2, a3);
printf("%-9d %-9d %-9d\n", b1, b2, b3);
printf("%-9d %-9d %-9d\n", c1, c2, c3);
printf("%-9d %-9d %-9d\n", d1, d2, d3);
```

输出结果

```bash
20        345       700  
56720     9999      20098
233       205       1    
34        0         23   
```

解释：`%-9d`：`d` 表示十进制输出，`9` 表示最少占 9 个字符宽度，`-` 表示左对齐，不使用 `-` 则默认右对齐。

对于整型数据：

```c
int a = 12345;
printf("%md", a);
```

- 若 `m <=` 实际数据宽度，则按实际情况输出。
- 若 `m >` 实际数据宽度，则在左边用空格补齐。
- `printf("%0md", a);` 则在左边用 `0` 补齐。

对于浮点型数据：

```c
float a = 1.2345; 
printf("%m.nf", a);
// m -- 整个数据宽度，n -- 小数位数
```

- 实际小数位数 `> n`，截去多余小数，注意四舍五入。
- 实际小数位数 `< n`，在小数最后补 `0`。
- 若 `m` 省略则写作 `%.n`，整数部分按实际输出，小数部分按以上规则。
- 若 `m < n+1`，自动突破宽度限制，按实际数据输出。
- 若 `m > n+1`，左边补空格。

### 字符串 (Strings)

在 C 语言中，字符串是以 `\0` 结尾的字符数组，而不是一种单独的数据类型。可以通过字符数组来表示字符串。

#### 定义并打印字符串

```c
char greetings[] = "Hello World!";
printf("%s", greetings);
```

#### 访问字符串中的字符

```c
char greetings[] = "Hello World!";
printf("%c", greetings[0]);
```

访问字符串 `greetings` 的第一个字符 `H`

#### 修改字符串中的字符

```c
char greetings[] = "Hello World!";
greetings[0] = 'J'; // 修改第一个字符为 'J'

printf("%s", greetings);
// 输出 "Jello World!"
```

#### 另一种创建字符串的方法

```c
char greetings[] = {'H','e','l','l','\0'};

printf("%s", greetings);
// 输出 "Hell"
```

**注意**：C 语言中没有 `String` 类型，字符串是由字符数组 `char[]` 表示的，且必须以 `\0` 结尾以标识字符串的结束。

### 条件判断

```c
int time = 20;
if (time < 18) {
  printf("再会！");
} else {
  printf("晚上好！");
}
// 输出 -> "晚上好！"

int time = 22;
if (time < 10) {
  printf("早上好！");
} else if (time < 20) {
  printf("再会！");
} else {
  printf("晚上好！");
}
// 输出 -> "晚上好！"

int time = 10;
if (time > 8) {
  //再嵌套一个if
  if (time < 12) {
    printf("中午好！")
  }
}
// 输出 -> "中午好！"
```

#### 说明

- `if` 语句用于根据条件执行代码块。
- `else` 语句在 `if` 条件不满足时执行。
- `else if` 语句用于检查多个条件。
- 可以嵌套 `if` 语句以检查多个条件。

### 三元运算符

三元运算符（`? :`）是一种简洁的条件判断方式，用于根据条件选择表达式的值。由三个部分组成：

- 条件表达式
- 条件为真时的结果
- 条件为假时的结果

基本语法：`(条件) ? 表达式1 : 表达式2;`  
如果 `条件` 为真，则返回 `表达式1`，否则返回 `表达式2`。

#### 示例

```c
int time = 20;
(time < 18) ? printf("再会！") 
            : printf("晚上好！");
// 输出 -> "晚上好！"
```

嵌套使用示例（不建议过多嵌套）：

```c
int time = 22;
printf((time < 10) ? "早上好！" 
          : (time < 20) ? "再会！" 
                        : "晚上好！");
// 输出 -> "晚上好！"
```

### Switch

```c
int day = 4;

switch (day) {
  case 3: printf("周三"); break;
  case 4: printf("周四"); break;
  default: printf("期待周末");
}
// 输出 -> "周四"
```

#### 说明

- `switch` 语句根据表达式的值跳转到匹配的 `case` 标签。
- 匹配到 `case` 后执行相应代码，并通过 `break` 跳出 `switch`。
- 如果没有匹配到任何 `case`，则执行 `default` 语句（如果存在）。

#### 注意事项

- `switch` 表达式可以是整型、字符型和枚举型。
- `case` 后的常量表达式值不能相同。
- `case` 后可以有多个语句，不需要 `{ }` 括起来。
- `case` 和 `default` 语句的顺序不影响程序执行结果。
- `break` 语句用于结束 `switch`，如果没有 `break`，程序会继续执行下一个 `case`。

#### 示例

```c
int day = 3;

switch (day) {
  case 3: printf("周三"); 
  case 4: printf("周四"); break;
  default: printf("期待周末");
}
// 输出 -> "周三周四"
```

### While 循环

```c
int i = 0;

while (i < 5) {
  printf("%d\n", i);
  i++;
}
// 输出 -> 0 1 2 3 4
```

#### 解释

- `while` 循环首先检查条件 `i < 5` 是否为真。
- 如果为真，程序进入循环体，执行打印操作并增加 `i` 的值。
- 循环会继续进行，直到 `i` 达到 5，此时条件 `i < 5` 不再为真，循环结束。

#### 打印 1 到 10 的数字

```c
int i = 1;

while (i <= 10) {
  printf("%d\n", i);
  i++;
}
// 输出 -> 1 2 3 4 5 6 7 8 9 10
```

#### 打印偶数

```c
int i = 0;

while (i <= 10) {
  if (i % 2 == 0) {
    printf("%d\n", i);
  }
  i++;
}
// 输出 -> 0 2 4 6 8 10
```

#### 无限循环（需手动终止）

```c
int i = 0;

while (1) {
  printf("无限循环\n");
  i++;
  if (i == 5) break; // 添加条件以退出循环
}
// 输出 -> 无限循环 (打印 5 次)
```

### Do/While 循环

```c
int i = 0;

do {
  printf("%d\n", i);
  i++;
} while (i < 5);
// 输出 -> 0 1 2 3 4
```

#### 解释

- `do/while` 循环至少执行一次循环体，因为条件检查在循环体执行之后进行。
- 首先执行 `do` 中的代码，然后检查条件 `i < 5` 是否为真。
- 如果为真，继续执行循环；如果为假，则退出循环。

#### 打印从 5 开始的数字，直到条件不满足

```c
int i = 5;

do {
  printf("%d\n", i);  // 输出 5
  i++;
} while (i < 5);
// 输出 -> 5
```

#### 计算 1 到 10 的和

```c
int i = 1;
int sum = 0;

do {
  sum += i;
  i++;
} while (i <= 10);

printf("Sum: %d\n", sum);
// 输出 -> Sum: 55
```

### For 循环

```c
for (表达式1; 表达式2; 表达式3) {
  循环体语句;
}
```

- 表达式1：设置初始条件，只执行一次。
- 表达式2：循环条件表达式，每次循环前检查。
- 表达式3：循环体执行后的调整操作。

示例：

```c
int i;

for (i = 0; i < 5; i++) {
  printf("%d\n", i);
}
// 输出 -> 0 1 2 3 4
```

#### 注意事项

- `for` 语句的三个表达式不是必须的。
- 当条件表达式（表达式2）为假时，`for` 循环结束。
- 可以在循环体内使用 `break`、`continue`、`goto` 语句。
- 如果表达式2为空，则表示无限循环，如 `for(;;)` 相当于 `while(1)`。

#### 变体

- `for (i = m; i < n; i++)` 从 `i = m` 开始到 `i = n-1`，循环 `n - m` 次。
- `for (i = m; i <= n; i++)` 从 `i = m` 到 `i = n`，循环 `n - m + 1` 次。

### 跳出循环 (Break/Continue/Goto)
<!--rehype:wrap-class=row-span-3-->

#### `break` 语句

跳出当前循环或 `switch` 语句，执行后续代码。

```c
int i;

for (i = 0; i < 10; i++) {
  if (i == 4) {
    break;
  }
  printf("%d\n", i);
}
// 输出 -> 0 1 2 3
```

#### `continue` 语句

跳过当前循环的剩余语句，直接进入下一次循环。

```c
int i;

for (i = 0; i < 10; i++) {
  if (i == 4) {
    continue;
  }
  printf("%d\n", i);
}
// 输出 -> 0 1 2 3 5 6 7 8 9
```

#### `goto` 语句

无条件跳转到指定标签位置。

```c
int i = 0;

while (i < 10) {
  if (i == 4) {
    goto skip;  // 跳转到 skip 标签
  }
  printf("%d\n", i);
  i++;
}

skip:
printf("Exited the loop at i = %d\n", i);
// 输出 -> 0 1 2 3 Exited the loop at i = 4
```

#### 注意事项

- 标签必须在当前函数内定义，命名规则与变量相同。
- `goto` 语句应慎用，避免代码逻辑混乱，通常使用循环或条件语句代替。

#### 设置数组大小

```c
// 声明一个由四个整数组成的数组
int myNumbers[4];

// 添加元素
myNumbers[0] = 25;
myNumbers[1] = 50;
myNumbers[2] = 75;
myNumbers[3] = 100;
```

### 枚举 Enum
<!--rehype:wrap-class=col-span-2-->

```c
enum week { Mon = 1, Tues, Wed, Thurs, Fri, Sat, Sun };
```

定义枚举变量

```c
enum week a, b, c;

enum week { Mon = 1, Tues, Wed, Thurs, Fri, Sat, Sun } a, b, c;
```

有了枚举变量，就可以把列表中的值赋给它

```c
enum week { Mon = 1, Tues, Wed, Thurs, Fri, Sat, Sun };
enum week a = Mon, b = Wed, c = Sat;
// 或者
enum week{ Mon = 1, Tues, Wed, Thurs, Fri, Sat, Sun } a = Mon, b = Wed, c = Sat;
```

### 枚举示例应用

```c
enum week {Mon = 1, Tues, Wed, Thurs} day;

scanf("%d", &day);

switch(day){
  case Mon:   puts("Monday"); break;
  case Tues:  puts("Tuesday"); break;
  case Wed:   puts("Wednesday"); break;
  case Thurs: puts("Thursday"); break;
  default:    puts("Error!");
}
```

### 数组 Arrays

#### 定义和访问数组元素

```c
int myNumbers[] = {25, 50, 75, 100};
printf("%d", myNumbers[0]); // 输出 25
```

#### 更改数组元素

```c
int myNumbers[] = {25, 50, 75, 100};
myNumbers[0] = 33;
printf("%d", myNumbers[0]); // 输出 33
```

#### 循环遍历数组

```c
int myNumbers[] = {25, 50, 75, 100};
int i;

for (i = 0; i < 4; i++) {
  printf("%d\n", myNumbers[i]);
}
// 输出 -> 25 50 75 100
```

### 用户输入

```c
// 创建一个整数变量来存储我们从用户那里得到的数字
int myNum;

// 要求用户输入一个数字
printf("请输入一个数字: \n");

// 获取并保存用户输入的号码
scanf("%d", &myNum);

// 输出用户输入的数字
printf("您输入的数字: %d", myNum);
```

### 用户输入字符串

```c
// 创建一个字符串
char firstName[30];
// 要求用户输入一些文本
printf("输入您的名字: \n");
// 获取并保存文本
scanf("%s", firstName);
// 输出文本
printf("Hello %s.", firstName);
```

### 内存地址

创建变量时，会为该变量分配一个内存地址。

```c
int myAge = 43;
printf("%p", &myAge);
// 输出 myAge 的内存地址，例如：0x7ffe5367e044
```

要访问变量的内存地址，请使用引用运算符 (`&`)。

### 创建指针
<!--rehype:wrap-class=col-span-2-->

```c
int myAge = 43;      // 一个 int 变量
int *ptr = &myAge;   // 创建指向 myAge 的指针

printf("%d\n", myAge);  // 输出 myAge 的值 -> 43
printf("%p\n", &myAge); // 输出 myAge 的内存地址，例如：0x7ffe5367e044
printf("%p\n", ptr);    // 输出指针 ptr 的值（即 myAge 的内存地址）
printf("%d\n", *ptr);   // 通过指针访问 myAge 的值 -> 43
```

### 取消引用

```c
int myAge = 43;     // 变量声明
int* ptr = &myAge;  // 指针声明

// 参考：用指针输出 myAge 的
// 内存地址（0x7ffe5367e044）
printf("%p\n", ptr);
// 取消引用：用指针输出 myAge 的值 (43)
printf("%d\n", *ptr);
```

### 指针变量
<!--rehype:wrap-class=col-span-2-->

```c
int myAge = 43;            // 一个 int 变量
int* ptr = &myAge;         // 名为 ptr 的指针变量，用于存储 myAge 的地址

printf("%d\n", myAge);     // 输出 myAge (43) 的值
printf("%p\n", &myAge);    // 输出 myAge 的内存地址（0x7ffe5367e044）
printf("%p\n", ptr);       // 用指针（0x7ffe5367e044）输出myAge的内存地址
```

运算符
---

### 算术运算符

```c
int myNum = 100 + 50;
int sum1 = 100 + 50;    // 150 (100 + 50)
int sum2 = sum1 + 250;  // 400 (150 + 250)
int sum3 = sum2 + sum2; // 800 (400 + 400)
```

----

| Operator | Name | Description | Example |
| -------- | -------- | -------- | -------- |
| `+`        | 加      | 将两个值相加            | `x + y`   |
| `-`        | 减      | 从另一个值中减去一个值    | `x - y`   |
| `*`        | 乘      | 将两个值相乘            | `x * y`  |
| `/`        | 除      | 将一个值除以另一个       | `x / y`   |
| `%`        | 取模    | 返回除法余数            | `x % y`   |
| `++`       | 增量    | 将变量的值增加 1         | `++`   |
| `--`       | 乘量    | 将变量的值减 1           | `--x`     |

### 赋值运算符

| 符号 | 示例 | 如同    |
| -------- | ------- | ---------- |
| `=`        | x `=` 5   | x `=` 5      |
| `+=`       | x `+=` 3  | x `=` x `+` 3  |
| `-=`       | x `-=` 3  | x `=` x `-` 3  |
| `*=`       | x `*=` 3  | x `=` x `*` 3 |
| `/=`       | x `/=` 3  | x `=` x `/` 3  |
| `%=`       | x `%=` 3  | x `=` x `%` 3  |
| `&=`       | x `&=` 3  | x `=` x `&` 3  |
| `\|=`      | x `\|=` 3 | x `=` x `\|` 3 |
| `^=`       | x `^=` 3  | x `=` x `^` 3  |
| `>>=`      | x `>>=` 3 | x `=` x `>>` 3 |
| `<<=`      | x `<<=` 3 | x `=` x `<<` 3 |

### 比较运算符

```c
int x = 5;
int y = 3;

printf("%d", x > y);
// 返回 1（真），因为 5 大于 3
```

----

| 符号 | 名称 | 示例 |
| -------- | ------- | ------- |
| `==`       | 等于       | x `==` y  |
| `!=`       | 不等于     | x `!=` y  |
| `>`        | 大于       | x `>` y   |
| `<`        | 小于       | x `<` y   |
| `>=`       | 大于或等于  | x `>=` y  |
| `<=`       | 小于或等于  | x `<=` y  |

比较运算符用于比较两个值

### 逻辑运算符
<!--rehype:wrap-class=col-span-2-->

| 符号 | 名称 | 说明 | 示例 |
| -------- | -------- | -------- | -------- |
| `&&`    | `与`逻辑 | 如果两个语句都为真，则返回真   | `x < 5 &&  x < 10`   |
| `\|\|`  | `或`逻辑 | 如果其中一个语句为真，则返回真 | `x < 5 \|\| x < 4`   |
| `!`     | `非`逻辑 | 反转结果，如果结果为真则返回假 | `!(x < 5 && x < 10)` |

### 运算符示例
<!--rehype:wrap-class=row-span-2-->

```c
unsigned int a = 60; /* 60 = 0011 1100 */  
unsigned int b = 13; /* 13 = 0000 1101 */
int c = 0;           

c = a & b;      /* 12 = 0000 1100 */ 
printf("Line 1 - c 的值是 %d\n", c );

c = a | b;      /* 61 = 0011 1101 */
printf("Line 2 - c 的值是 %d\n", c );
c = a ^ b;      /* 49 = 0011 0001 */
printf("Line 3 - c 的值是 %d\n", c );
c = ~a;         /*-61 = 1100 0011 */
printf("Line 4 - c 的值是 %d\n", c );
c = a << 2;     /* 240 = 1111 0000 */
printf("Line 5 - c 的值是 %d\n", c );
c = a >> 2;     /* 15 = 0000 1111 */
printf("Line 6 - c 的值是 %d\n", c );
```

### 位运算符
<!--rehype:wrap-class=col-span-2-->

运算符 | 描述 | 实例
:- |:- |:-
`&` | 按位与操作，按二进制位进行"与"运算 | `(A & B)` 将得到 `12` 即为 0000 1100
`\|` | 按位或运算符，按二进制位进行"或"运算 | `(A \| B)` 将得到 `61` 即为 0011 1101
`^` | 异或运算符，按二进制位进行"异或"运算 | `(A ^ B)` 将得到 `49` 即为 0011 0001
`~` | 取反运算符，按二进制位进行"取反"运算 | `(~A)` 将得到 `-61` 即为 1100 0011
`<<` |  二进制左移运算符 | `A << 2` 将得到 `240` 即为 1111 0000
`>>` |  二进制右移运算符 | `A >> 2` 将得到 `15` 即为 0000 1111

数据类型 Data Types
---

### 基本数据类型
<!--rehype:wrap-class=col-span-2-->

| 数据类型 | 大小 Size | 范围 Range | 描述 Description |
| ----- | ----- | ----- | ----- |
| `char`   | 1 字节 | `−128` ~ `127` | 单个字符/字母/数字/ASCII |
| `signed char` | 1 字节 | `−128` ~ `127` | - |
| `unsigned char` | 1 字节 | `0` ~ `255` | - |
| `int`    | `2` 到 `4` 字节  |  `−32,768` ~ `32,767` | 存储整数 |
| `signed int` | 2 字节 | `−32,768` ~ `32,767` | |
| `unsigned int` | 2 字节 | `0` ~ `65,535` | |
| `short int` | 2 字节 | `−32,768` ~ `32,767` |  |
| `signed short int` | 2 字节 | `−32,768` ~ `32,767` |  |
| `unsigned short int` | 2 字节 | `0` ~ `65,535` |  |
| `long int` | 4 字节 | `-2,147,483,648` ~ `2,147,483,647` | |
| `signed long int` | 4 字节 | `-2,147,483,648` ~ `2,147,483,647` | |
| `unsigned long int` | 4 字节 | `0` ~ `4,294,967,295` | |
| `float`  | 4 字节      |  | |
| `double` | 8 字节      |  | |
| `long double` | 10 字节 |  | |

### 数据类型

```c
// 创建变量
int myNum = 5;             // 整数
float myFloatNum = 5.99;   // 浮点数
char myLetter = 'D';       // 字符串
// 高精度浮点数据或数字
double myDouble = 3.2325467;
// 打印输出变量
printf("%d\n", myNum);
printf("%f\n", myFloatNum);
printf("%c\n", myLetter);
printf("%lf\n", myDouble);
```

----

数据类型 | 说  明
:- | :-
`char` | 字符型
`short` | 短整型
`int` | 整型
`long` | 长整型
`float` | 单精度浮点型
`double` | 双精度浮点型
`void` | 无类型

### 基本格式说明符

| 格式说明符 | 数据类型 |
| ----- | ----- |
| `%d` 或 `%i` | `int` 整数 |
| `%f`         | `float` 单精度的十进制类型 |
| `%lf`        | `double` 高精度浮点数据或数字 |
| `%c`         | `char` 字符 |
| `%s`         | 用于 `strings` 字符串 |

### 基本格式说明符

|  | short | int | long |
| ---- | ---- | ---- | ---- |
| 8 进制 | `%ho` | `%o` | `%lo` |
| 10 进制 | `%hd` | `%d` | `%ld` |
| 16 进制 | `%hx` / `%hX` | `%x` / `%X` | `%lx` / `%lX` |

### 数据格式示例

```c
int myNum = 5;
float myFloatNum = 5.99; // 浮点数
char myLetter = 'D';     // 字符串
// 打印输出变量
printf("%d\n", myNum);
printf("%f\n", myFloatNum);
printf("%c\n", myLetter);
```

预处理器
---

### 预处理器指令
<!--rehype:wrap-class=row-span-2-->

指令 | 描述
---- | ----
`#define` | 定义宏
`#include` | 包含一个源代码文件
`#undef` | 取消已定义的宏
`#ifdef` | 如果宏已经定义，则返回真
`#ifndef` | 如果宏没有定义，则返回真
`#if` | 如果给定条件为真，则编译下面代码
`#else` | `#if` 的替代方案
`#elif` | 如果 `#if` 条件为假，当前条件为`真`
`#endif` | 结束一个 `#if……#else` 条件编译块
`#error` | 当遇到标准错误时，输出错误消息
`#pragma` | 使用标准化方法，向编译器发布特殊的命令到编译器中

```c
// 所有的 MAX_ARRAY_LENGTH 替换为 20
#define MAX_ARRAY_LENGTH 20
// 系统库中获取 stdio.h
#include <stdio.h>
// 本地目录中获取 myheader.h
#include "myheader.h"
#undef  FILE_SIZE
#define FILE_SIZE 42 // 取消已定义并定义为 42
```

### 预定义宏
<!--rehype:wrap-class=row-span-2-->

宏 | 描述
---- | ----
`__DATE__` | 当前日期，一个以 "MMM DD YYYY" 格式表示的字符常量
`__TIME__` | 当前时间，一个以 "HH:MM:SS" 格式表示的字符常量
`__FILE__` | 这会包含当前文件名，一个字符串常量
`__LINE__` | 这会包含当前行号，一个十进制常量
`__STDC__` | 当编译器以 `ANSI` 标准编译时，则定义为 `1`
<!--rehype:className=style-list-->

`ANSI C` 定义了许多宏，您可以使用这些宏，但是不能直接修改这些预定义的宏

#### 预定义宏示例

```c
#include <stdio.h>

int main() {
  printf("File :%s\n", __FILE__);
  printf("Date :%s\n", __DATE__);
  printf("Time :%s\n", __TIME__);
  printf("Line :%d\n", __LINE__);
  printf("ANSI :%d\n", __STDC__);
}
```

### 宏延续运算符（\）

一个宏通常写在一个单行上。

```c
#define  message_for(a, b)  \
    printf(#a " 和 " #b ": 我们爱你！\n")
```

如果宏太长，一个单行容纳不下，则使用宏延续运算符 `\`

### 字符串常量化运算符（#）

```c
#include <stdio.h>

#define  message_for(a, b)  \
  printf(#a " 和 " #b ": 我们爱你！\n")

int main(void) {
  message_for(Carole, Debra);
  return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Carole 和 Debra: 我们爱你！
```

需要把一个宏的参数转换为字符串常量时，使用字符串常量化运算符 `#`

### 标记粘贴运算符（##）

```c
#include <stdio.h>

#define tokenpaster(n) \
    printf ("token" #n " = %d", token##n)

int main(void){
  int token34 = 40;
  tokenpaster(34);
  return 0;
}
```

### defined() 运算符

```c
#include <stdio.h>

#if !defined (MESSAGE)
   #define MESSAGE "You wish!"
#endif

int main(void) {
    printf("信息如下: %s\n", \
        MESSAGE);  
    return 0;
}
```

### 参数化的宏

```c
int square(int x) {
   return x * x;
}
```

宏重写上面的代码，如下：

```c
#define square(x) ((x) * (x))
```

宏名称和左圆括号之间不允许有空格

```c
#include <stdio.h>
#define MAX(x,y) ((x) > (y) ? (x) : (y))

int main(void) {
    printf("20 到 10 之间的最大值是 %d\n", \
        MAX(10, 20));  
    return 0;
}
```

### Warning 和 Error
<!--rehype:wrap-class=row-span-2-->

在 C 语言中，警告（Warning）和错误（Error）是编译器用于标识代码潜在问题或阻止代码编译的机制。

#### 警告

警告提示代码中可能存在的问题，但不会阻止代码编译。处理警告可以提升代码质量和可移植性。

#### **常见警告示例**

未使用的变量  

```c
int x; printf("%d", x);
```

类型隐式转换（可能导致数据丢失）  

```c
int x = 3.14; // 浮点数被隐式转换
int a = 2147483647 + 1; // 可能溢出
```

函数声明与定义不匹配

#### 错误

错误会阻止代码编译，必须修复才能继续编译。

**常见错误示例**：

语法错误（如缺少分号）

```c
int x = 1
```

函数定义冲突

```c
void func(int);
void func(double);
```

函数或变量未定义

```c
y = 10; printf("%d", y);
```

头文件缺失或冲突

```c
#include <unknown.h>
```

### 使用编译器指令控制警告和错误
<!--rehype:wrap-class=col-span-2-->

#### 抑制警告

可以使用编译器选项来关闭特定的警告，例如在 GCC 中：

```sh
gcc -w file.c      # 禁用所有警告
gcc -Wall file.c   # 启用所有常见警告
gcc -Werror file.c # 将警告视为错误
```

#### 使用 `#pragma` 控制警告

在某些编译器中，可以使用 `#pragma` 指令启用或禁用警告：

```c
#include <stdio.h>
#pragma warning(disable : 4996) // 禁用警告（适用于 MSVC 编译器）

int main() {
    printf("Hello, world!");
    return 0;
}
```

#### 总结

| 区别点           | Warning（警告）                          | Error（错误）                          |
|------------------|----------------------------------------|----------------------------------------|
| 严重程度         | 程序可继续编译，但可能存在隐患            | 编译无法完成，必须修复                 |
| 编译结果         | 生成可执行文件                           | 无法生成可执行文件                     |
| 触发原因         | 潜在问题，例如隐式转换或未使用的变量       | 语法或语义错误，例如语法错误或未定义变量 |
| 修复必要性       | 可选择修复，但建议修复以避免潜在问题      | 必须修复才能继续编译                   |
| 编译器选项调整   | 可以忽略或转换为错误（如 `-Werror`）      | 无法调整，必须修复                     |

函数
----

### 函数声明和定义
<!--rehype:wrap-class=row-span-2-->

```c
int main() {
  printf("Hello World!");
  return 0;
}
```

函数由两部分组成

```c
void myFunction() { // 声明 declaration
  // 函数体（要执行的代码）(definition)
}
```

----

- `Declaration` 声明函数名称、返回类型和参数 _(如果有)_
- `Definition` 函数体 _(要执行的代码)_

----

```c
// 函数声明
void myFunction();
// 主要方法
int main() {
  myFunction(); // --> 调用函数
  return 0;
}
void myFunction() {// 函数定义
  printf("晚上好！");
}
```

### 调用函数

```c
// 创建函数
void myFunction() {
  printf("晚上好！");
}
int main() {
  myFunction();  // 调用函数
  myFunction();  // 可以被多次调用
  return 0;
}
// 输出 -> "晚上好！"
// 输出 -> "晚上好！"
```

### 函数参数

```c
void myFunction(char name[]) {
  printf("Hello %s\n", name);
}
int main() {
  myFunction("Liam");
  myFunction("Jenny");
  return 0;
}
// Hello Liam
// Hello Jenny
```

### 多个参数

```c
void myFunction(char name[], int age) {
  printf("你好 %s 你 %d 岁了。\n",name,age);
}
int main() {
  myFunction("Liam", 3);
  myFunction("Jenny", 14);
  return 0;
}
// 你好 Liam 你 3 岁了。
// 你好 Jenny 你 14 岁了。
```

### 返回值
<!--rehype:wrap-class=row-span-2-->

```c
int myFunction(int x) {
  return 5 + x;
}

int main() {
  printf("结果: %d", myFunction(3));
  return 0;
}
// 输出 8 (5 + 3)
```

两个参数

```c
int myFunction(int x, int y) {
  return x + y;
}

int main() {
  printf("结果: %d", myFunction(5, 3));
  // 将结果存储在变量中
  int result = myFunction(5, 3);
  printf("结果 = %d", result);
  return 0;
}
// 结果: 8 (5 + 3)
// 结果 = 8 (5 + 3)
```

### 递归示例

```c
int sum(int k);
int main() {
  int result = sum(10);
  printf("%d", result);
  return 0;
}

int sum(int k) {
  if (k > 0) {
    return k + sum(k - 1);
  } else {
    return 0;
  }
}
```

### 数学函数

```c
#include <math.h>
printf("%f", sqrt(16));   // 平方根
printf("%f", ceil(1.4));  // 四舍五入 (入)
printf("%f", floor(1.4)); // 四舍五入 (舍)
printf("%f", pow(4, 3));  // x(4)的y(3)次方
```

----

- `abs(x)` 绝对值
- `acos(x)` 反余弦值
- `asin(x)` 反正弦值
- `atan(x)` 反正切
- `cbrt(x)` 立方根
- `cos(x)` 余弦
- `exp(x)` Ex 的值
- `sin(x)` x 的正弦值
- `tan(x)` 角度的正切
<!--rehype:className=cols-2-->

Structures 结构
---

### 创建结构

```c
struct MyStructure {  // 结构声明
  int myNum;     // 成员（int 变量）
  char myLetter; // 成员（char 变量）
}; // 用分号结束结构
```

创建一个名为 `s1` 的结构变量

```c {7}
struct myStructure {
  int myNum;
  char myLetter;
};

int main() {
  struct myStructure s1;
  return 0;
}
```

### 结构中的字符串

```c {9}
struct myStructure {
  int myNum;
  char myLetter;
  char myString[30]; // String
};

int main() {
  struct myStructure s1;
  strcpy(s1.myString, "Some text");
  // 打印值
  printf("我字符串: %s", s1.myString);
  return 0;
}
```

使用 `strcpy` 函数为字符串赋值

### 访问结构成员
<!--rehype:wrap-class=row-span-2-->

```c {11,12,16}
// 创建一个名为 myStructure 的结构
struct myStructure {
  int myNum;
  char myLetter;
};

int main() {
  // 创建一个名为 s1 的 myStructure 结构变量
  struct myStructure s1;
  // 为 s1 的成员赋值
  s1.myNum = 13;
  s1.myLetter = 'B';

  // 创建一个名为 s2 的 myStructure 结构变量
  // 并为其赋值
  struct myStructure s2 = {13, 'B'};
  // 打印值
  printf("My number: %d\n", s1.myNum);
  printf("My letter: %c\n", s1.myLetter);
  return 0;
}
```

创建不同的结构变量

```c
struct myStructure s1;
struct myStructure s2;
// 为不同的结构变量赋值
s1.myNum = 13;
s1.myLetter = 'B';

s2.myNum = 20;
s2.myLetter = 'C';
```

### 复制结构

```c {6}
struct myStructure s1 = {
  13, 'B', "Some text"
};

struct myStructure s2;
s2 = s1;
```

示例中，将 `s1` 的值复制到 `s2`

### 修改值

```c {6,7}
// 创建一个结构变量并为其赋值
struct myStructure s1 = {
  13, 'B'
};
// 修改值
s1.myNum = 30;
s1.myLetter = 'C';
// 打印值
printf("%d %c %s",
    s1.myNum,
    s1.myLetter);
```

文件处理
---

### 文件处理函数

函数 | 描述 Description
---- | ----
`fopen()` | `打开`新文件或现有文件
`fprintf()` | 将数据`写入`文件
`fscanf()` | 从文件中`读取`数据
`fputc()` | 将一个字符`写入`文件
`fgetc()` | 从文件中`读取`一个字符
`fclose()` | `关闭`文件
`fseek()` | 将文件指针设置到`给定位置`
`fputw()` | 将整数`写入`文件
`fgetw()` | 从文件中`读取`一个整数
`ftell()` | 返回当前`位置`
`rewind()` | 将文件指针设置为文件的开头

C 库中有许多函数可以`打开`/`读取`/`写入`/`搜索`和`关闭`文件

### 打开模式参数

模式 Mode  | 描述 Description
---- | ----
`r`  | 以`读取`模式打开一个文本文件，允许读取文件
`w`  | 以`写`模式打开一个文本文件，允许写入文件
`a`  | 以`追加`模式打开一个文本文件<br />如果文件不存在，则会创建一个新文件
`r+`  | 以`读写`模式打开一个文本文件，允许读写文件
`w+`  | 以`读写`模式打开一个文本文件，允许读写文件
`a+`  | 以`读写`模式打开一个文本文件，允许读写文件
`rb`  | 以`读取`模式打开二进制文件
`wb`  | 以`写入`模式打开二进制文件
`ab`  | 以`追加`模式打开二进制文件
`rb+`  | 以`读写`模式打开二进制文件
`wb+`  | 以`读写`模式打开二进制文件
`ab+`  | 以`读写`模式打开二进制文件

### 打开文件：fopen()

```c {6}
#include<stdio.h>

void main( ) {
  FILE *fp;
  char ch;
  fp = fopen("file_handle.c", "r");

  while (1) {
    ch = fgetc(fp);
    if (ch == EOF)
    break;
    printf("%c", ch);
  }
  fclose(fp);
}
```

对文件执行所有操作后，必须关闭 `fclose()` 该文件

### 写入文件：fprintf()

```c {7}
#include <stdio.h>

main() {
  FILE *fp;
  fp = fopen("file.txt", "w"); // 打开文件
  // 将数据写入文件
  fprintf(fp, "fprintf 的 Hello 文件..\n");
  fclose(fp); // 关闭文件  
}  
```

### 读取文件：fscanf()

```c {6}
#include <stdio.h>  
main(){
  FILE *fp;
  char buff[255]; // 创建char数组存储文件数据
  fp = fopen("file.txt", "r");
  while(fscanf(fp, "%s", buff)!=EOF) {
    printf("%s ", buff);
  }
  fclose(fp);
}
```

### 写入文件：fputc()

```c {6}
#include <stdio.h>

main(){
  FILE *fp;
  fp = fopen("file1.txt", "w"); // 打开文件
  fputc('a',fp); // 将单个字符写入文件
  fclose(fp);    // 关闭文件
}
```

### 读取文件：fgetc()

```c {8}
#include<stdio.h>
#include<conio.h>
void main() {
  FILE *fp;
  char c;
  clrscr();
  fp=fopen("myfile.txt", "r");
  while((c=fgetc(fp))!=EOF){
    printf("%c", c);
  }
  fclose(fp);
  getch();
}
```

### 写入文件：fputs()

```c {8}
#include<stdio.h>
#include<conio.h>

void main(){
  FILE *fp;
  clrscr();
  fp = fopen("myfile2.txt","w");
  fputs("hello c programming",fp);
  fclose(fp);
  getch();
}
```

### 读取文件：fgets()

```c {10}
#include<stdio.h>
#include<conio.h>

void main() {
  FILE *fp;
  char text[300];
  clrscr();

  fp=fopen("myfile2.txt", "r");
  printf("%s", fgets(text, 200, fp));
  fclose(fp);
  getch();
}
```

### fseek()

```c {8}
#include <stdio.h>
void main(){
  FILE *fp;
  fp = fopen("myfile.txt","w+");
  fputs("This is Book", fp);

  // 将文件指针设置到给定位置
  fseek(fp, 7, SEEK_SET);
  fputs("Kenny Wong", fp);
  fclose(fp);
}
```

将文件指针设置到给定位置

### rewind()

```c {11}
#include<stdio.h>
#include<conio.h>
void main(){
  FILE *fp;
  char c;
  clrscr();
  fp=fopen("file.txt", "r");
  while((c=fgetc(fp)) != EOF){
    printf("%c", c);
  }
  rewind(fp); // 将文件指针移动到文件的开头
  while((c=fgetc(fp)) != EOF){
    printf("%c", c);
  }
  fclose(fp);
  getch();
}
// 输出
// Hello World!Hello World!
```

### ftell()

```c {11}
#include <stdio.h>
#include <conio.h>

void main (){
   FILE *fp;
   int length;
   clrscr();
   fp = fopen("file.txt", "r");
   fseek(fp, 0, SEEK_END);

   length = ftell(fp); // 返回当前位置

   fclose(fp);
   printf("文件大小: %d bytes", length);
   getch();
}
// 输出
// 文件大小: 18 bytes
```

## C 网络编程

### 网络编程介绍

C使用sockets进行网络通信。包含头文件：

- `#include <sys/socket.h>`: 套接字操作，如创建、绑定和监听套接字
- `#include <arpa/inet.h>`: IP 地址转换
- `#include <unistd.h>`: 关闭套接字等
- `#include <netinet/in.h>`: 网络地址结构定义和相关敞亮

### 创建套接字

网络通信的第一步是创建套接字。套接字是网络通信的基础，通过它可以与远程主机进行数据交换。

#### 服务端

```cpp
int server_fd, new_socket; // 定义服务器文件描述符和新连接的套接字
int port = 8080; // 服务器使用的端口号

// 创建套接字文件描述符
// AF_INET 表示使用 IPv4 协议，SOCK_STREAM 表示使用 TCP 协议，协议参数通常为 0（默认 TCP）
if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
    perror("socket failed");
    exit(EXIT_FAILURE);
}
```

#### 客户端

```cpp
int sock = 0;  // 客户端的套接字描述符
struct sockaddr_in serv_addr;  // 定义服务器地址结构体

// 创建套接字
if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
    perror("Socket creation failed");
    exit(EXIT_FAILURE);
}
```

### 绑定套接字

服务端创建套接字后，需要将其绑定到特定的 IP 地址和端口，以便客户端能够连接。

#### 服务端

```cpp
struct sockaddr_in address;  // 定义存储地址信息的结构体
address.sin_family = AF_INET;  // 设置地址族为 IPv4
address.sin_addr.s_addr = INADDR_ANY;  // 将服务器绑定到所有可用的网络接口（即本机的所有 IP 地址）
address.sin_port = htons(port);  // 将端口号转换为网络字节序，大端模式

// 将套接字绑定到指定的地址和端口上
// bind() 将服务器的文件描述符与 IP 地址和端口号进行绑定，以便客户端能够通过该地址和端口访问服务器
if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
    perror("bind failed");
    exit(EXIT_FAILURE);
}
```

### 监听和接收连接

服务端在绑定套接字之后，需要进入监听状态，以等待客户端的连接请求。

#### 服务端

```cpp
// 开始监听客户端连接
// 监听连接请求
// listen() 函数将套接字设置为被动模式，准备接收来自客户端的连接请求
if (listen(server_fd, 3) < 0) {  // 第二个参数 3 表示连接请求的队列大小
    perror("listen failed");
    exit(EXIT_FAILURE);
}

int addrlen = sizeof(address);  // 获取地址结构体的大小
// accept() 函数会阻塞等待客户端的连接请求，一旦连接请求到来，创建一个新的套接字 new_socket 用于数据传输
if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
    perror("accept failed");
    exit(EXIT_FAILURE);
}
```

### 连接到服务端

客户端使用 `connect()` 函数连接到服务器的 IP 地址和端口。

#### 客户端

```cpp
// 设置服务器地址
serv_addr.sin_family = AF_INET;  // 设置地址族为 IPv4
serv_addr.sin_port = htons(port);  // 将端口号转换为网络字节序

// 将 IP 地址转换为二进制并存储在 serv_addr 结构体中
if (inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr) <= 0) {
    perror("Invalid address/ Address not supported");
    exit(EXIT_FAILURE);
}

// 连接服务器
// connect() 函数将客户端的套接字与服务器的地址绑定，从而建立连接
if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
    perror("Connection Failed");
    exit(EXIT_FAILURE);
}
```

### 发送和接收数据

一旦连接建立，服务端和客户端可以通过套接字发送和接收数据。

#### 服务端

```cpp
// 服务端从客户端接收数据
char buffer[1024] = {0};  // 缓冲区，用于存储接收的数据
int valread = read(new_socket, buffer, 1024);  // 从客户端读取数据
printf("Client: %s\n", buffer);  // 打印接收到的客户端数据

// 服务端发送响应数据给客户端
const char *response = "Hello from server";  // 响应消息
send(new_socket, response, strlen(response), 0);  // 发送数据到客户端
printf("Server message sent\n");
```

#### 客户端

```cpp
// 客户端发送数据给服务端
const char *message = "Hello from client";  // 要发送的消息
send(sock, message, strlen(message), 0);  // 发送数据到服务端
printf("Client message sent\n");

// 客户端从服务端接收响应数据
char buffer[1024] = {0};  // 缓冲区，用于存储接收到的数据
int valread = read(sock, buffer, 1024);  // 读取服务端的响应数据
printf("Server: %s\n", buffer);  // 打印接收到的服务端数据
```

### 关闭套接字

完成通信后，双方都应关闭各自的套接字以释放资源。

#### 服务端

```cpp
// 关闭服务端套接字
close(new_socket);  // 关闭用于数据传输的客户端套接字
close(server_fd);   // 关闭服务器的监听套接字

```

#### 客户端

```cpp
// 关闭客户端套接字
close(sock);  // 关闭客户端的套接字
```

## I/O多路复用

### 多路复用介绍

在网络编程中，服务端可以使用 I/O 多路复用 技术，如 `select`、`poll` 或 `epoll`。这些技术允许服务端同时监听多个文件描述符（如套接字），并在其中一个发生事件时进行处理，提升系统效率。包含头文件：

- `#include <sys/select.h>`: 提供 `select`
- `#include <poll.h>`: 提供 `poll`
- `#include <sys/epoll.h>`: 提供`epoll`

### 使用select

```c
fd_set read_fds;  // 定义文件描述符集合
FD_ZERO(&read_fds);  // 清空集合
FD_SET(server_socket, &read_fds);  // 将服务端套接字加入集合

int max_fd = server_socket;
int activity = select(max_fd + 1, &read_fds, NULL, NULL, NULL);  // 等待事件发生

if (activity < 0 && errno != EINTR) {
    perror("select error");
}
```

### 使用poll

```c
struct pollfd fds[2];  // 定义文件描述符数组
fds[0].fd = server_socket;
fds[0].events = POLLIN;  // 监听读事件

int poll_count = poll(fds, 2, -1);  // 等待事件

if (poll_count < 0) {
    perror("poll error");
}
```

### 使用epoll

```c
int epoll_fd = epoll_create1(0);  // 创建 epoll 文件描述符
struct epoll_event event;
event.events = EPOLLIN;
event.data.fd = server_socket;

if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, server_socket, &event) == -1) {
    perror("epoll_ctl failed");
}

struct epoll_event events[10];  // 事件数组
int event_count = epoll_wait(epoll_fd, events, 10, -1);  // 等待事件发生

for (int i = 0; i < event_count; i++) {
    if (events[i].data.fd == server_socket) {
        // 处理服务端套接字上的事件
    }
}
```

杂项
---

### Docker 运行环境
<!--rehype:wrap-class=col-span-2-->

- 安装 [`Docker`](./docker.md)
- 创建 [`Dockerfile`](./dockerfile.md) 文件

    ```dockerfile
    FROM alpine:3.14
    RUN apk add --no-cache gcc musl-dev
    RUN apk add --no-cache g++
    ```

- 生成本地 myalpine 镜像

    ```bash
    docker build -t myalpine .
    ```

- 运行映像，把当前路径 `($PWD)` 映射至容器的 `/test` 目录，用 `gcc` 编译程序，`exit`返回

    ```bash
    docker run -it -v $PWD:/test myalpine
    root@b1a38bd7107a:/# cd test
    root@b1a38bd7107a:/test# gcc -o hello hello.c
    Hello World
    root@b1a38bd7107a:/test# exit
    exit
    ```
<!--rehype:className=style-timeline-->

另见
---

- [C 教程](https://jaywcjlove.github.io/c-tutorial) _(jaywcjlove.github.io)_

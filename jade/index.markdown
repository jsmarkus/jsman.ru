---
title: Jade - движок шаблонов
layout: default
original_url: https://github.com/visionmedia/jade
original_title: Jade template engine
---

* sdf
{:toc}

#  Jade - движок шаблонов

Jade - это высокопроизводительный шаблонизатор, источником вдохновенья для создания которого послужил [Haml](http://haml-lang.com).

Jade реализован на JavaScript для [node](http://nodejs.org).

## Возможности

  - работает на клиентской стороне
  - отличная читабельность
  - гибкая система отступов
  - раскрытие блоков
  - примеси
  - статические инклюды
  - интерполяция в аттрибутах
  - из соображений безопасности по умолчанию все экранируется
  - контекстные сообщения об ошибках как во время компиляции так и во время выполнения
  - утилита для компиляции jade в html из командной строки
  - режим HTML5 (используйте doctype _!!! 5_)
  - кеширование в памяти (опционально)
  - комбинирование динамических и статических CSS-классов
  - манипуляции с деревом парсинга через _filters_
  - поддержка [Express JS](http://express-js.ru) "из коробки"
  - прозрачный механизм итерации по объектам, массивам, и даже неисчислимым типам через `each`
  - блочные комментарии
  - фильтры AST
  - фильтры
    - :sass - нужно установить [sass.js](http://github.com/visionmedia/sass.js)
    - :less - нужно установить [less.js](http://github.com/cloudhead/less.js)
    - :markdown - нужно установить [markdown-js](http://github.com/evilstreak/markdown-js) или [node-discount](http://github.com/visionmedia/node-discount)
    - :cdata
    - :coffeescript - нужно установить [coffee-script](http://jashkenas.github.com/coffee-script/)
  - [подсветка синтаксиса для Vim](https://github.com/digitaltoad/vim-jade)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [скринкасты](http://tjholowaychuk.com/post/1004255394/jade-screencast-template-engine-for-nodejs)
  - [html2jade конвертер](https://github.com/donpark/html2jade)

## Реализации

  - [php](http://github.com/everzet/jade.php)
  - [scala](http://scalate.fusesource.org/versions/snapshot/documentation/scaml-reference.html)
  - [ruby](http://github.com/stonean/slim)

## Установка

Через npm:

    npm install jade

## Поддержка браузерами

Чтобы скомпилировать jade в один файл для использования на стороне клиента, просто выполните:

    $ make jade.js

Также, если uglifyjs установлен через npm (`npm install uglify-js`), можно выполнить следующее (что создаст оба файла). Однако в каждом релизе это уже сделано за вас.

	$ make jade.min.js

По умолчанию Jade встраивает служебные функции - например, `escape()` или `attr()` - внутрь сгенерированных функций шаблона. Также Jade снабжает шаблоны отладочными метками типа `__.lineno = 3`. При работе в браузере полезно минимизировать этот каркас - для этого передайте опцию `{ compileDebug: false }`, and `{ inline: false }`. Следующий шаблон:

    p Hello #{name}

Может принять вид вот такой маленькой функции:


	function anonymous(locals) {
		var attrs = jade.attrs,
			escape = jade.escape;
		var buf = [];
		with(locals || {}) {
			var interp;
			buf.push('<p>');
			buf.push('Hello ' + escape((interp = name) == null ? '' : interp) + '');
			buf.push('</p>');
		}
		return buf.join("");
	}


С помощью Jade-овского `runtime.js` можно использовать заранее скомпилированные
шаблоны на клиентской стороне вообще _без_ Jade.
Все, что нужно - это соответствующие служебные функции (в runtime.js),
которые в таком случае доступны как `jade.attrs`, `jade.escape` итд.

### Утилиты сборки, поддерживающие Jade

_От переводчика - спустя год после публикации данного перевода:_

>Это была теория, теперь немного практики. В своей [статье об утилите сборки browserify](/2012/08/24/browserify.html)
>я привожу пример компиляции Jade-шаблонов как CommonJS-модулей, которые можно
>подключать через `require()`.
>Считаю такой способ предпочтительным,
>особенно в случае если browserify уже используется в вашем проекте
>и такой стиль программирования близок вам идеологически.

## Публичный API

	var jade = require('jade');

	// Отрендерить строку
	jade.render('string of jade', {
		options: 'here'
	});

	// Отрендерить файл
	jade.renderFile('path/to/some.jade', {
		options: 'here'
	}, function (err, html) {
		// опции опциональны,
		// коллбеком может быть второй аргумент
	});

	//Компилировать функцию
	var fn = jade.compile('string of jade', options);
	fn.call(scope, locals);

### Опции

 - `scope` Что считать за `this`
 - `self` Использовать пространство имен `self` для локальных переменных . _по умолчанию false_
 - `locals` Объект локальных переменных
 - `filename`  Используется для обработки исключений, а также для инклюдов
 - `debug` Выводит токены и тело сгенерированной функции
 - `compiler` Компилятор, который будет использоваться вместо Jade
 - `compileDebug`  Если `false`, компилировать без отладочной информации
 - `inline` Если `false`, то хелперы не вставляются inline (идеально последующего использования на стороне клиента)

## Синтаксис

### Окончания строк

**CRLF** и **CR** преобразуются в **LF** перед парсингом.

### Теги

Тег обозначается просто начальным словом:

    html

это, например, преобразуется в `<html></html>`.

Теги могут иметь id-ы:

    div#container

отрендерится в `<div id="container"></div>`

Классы:

    div.user-details

рендерится в `<div class="user-details"></div>`

несколько класов? _а также_ id? запросто:

    div#foo.bar.baz

рендерится в `<div id="foo" class="bar baz"></div>`

Конечно `div div div` это фигня, поэтому можно просто написать так:

    #foo
    .bar

Это "синтаксический сахар" для сокращенной записи тега div. На выходе имеем:

    <div id="foo"></div><div class="bar"></div>

### Текст тега

Просто поместите некоторый контент после тега:

    p wahoo!

рендерится в `<p>wahoo!</p>`.

Большие куски текста записываются так:

    p
      | foo bar baz
      | rawr rawr
      | super cool
      | go jade go

рендерится в `<p>foo bar baz rawr.....</p>`.

Интерполяция: любой тип текста имеет возможность интерполяции.

Если передать `{ locals: { name: 'tj', email: 'tj@vision-media.ca' }}` в `render()`

можно сделать следующее:

    #user #{name} &lt;#{email}&gt;


на выходе будет: `<div id="user">tj &lt;tj@vision-media.ca&gt;</div>`

Если надо отобразить именно последовательность символов `#{}`, то можно заэкранировать ее обратной косой чертой:

    p \#{something}

превратится в: `<p>#{something}</p>`

Можно также использовать незаэкранированный вариант `!{html}`, так что следующее

превратится в литеральный тег script:

    - var html = "<script></script>"
    | !{html}

Вложенные теги, содержащие текст, могут использовать как текстовый блок:

    label
      | Username:
      input(name='user[name]')

так и inline-текст:

    label Username:
      input(name='user[name]')

Теги, которые допускают _только_ текст, например, `script`, `style`, и `textarea`,
не нуждаются в начальном символе `|`, например:

      html
        head
          title Example
          script
            if (foo) {
              bar();
            } else {
              baz();
            }

Также альтернативно мы можем использовать точку (`.`), чтобы обозначиь текстовый блок:

      p.
        foo asdf
        asdf
         asdfasdfaf
         asdf
        asd.

На выходе будет:

        <p>foo asdf
        asdf
          asdfasdfaf
          asdf
        asd
        .
        </p>

Однако это отличается от точки, перед которой идет пробел. Такая точка воспринимается парсером Jade просто как литерал точки:

    p .

на выходе даст:

    <p>.</p>

Следует заметить, что текстовые блоки должны быть дважды заэкранированы. Например, если нужен следующий HTML:

    </p>foo\bar</p>

, следует использовать:

    p.
      foo\\bar

### Комментарии

Однострочные комментарии выглядят порсто как комментарии JavaScript,
то есть "//", и дожны помещаться на свойе строке:

    // just some paragraphs
    p foo
    p bar

на выходе даст:

    <!-- just some paragraphs -->
    <p>foo</p>
    <p>bar</p>

Jade также поддерживает небуферизируемые комментарии, просто добавьте дефис:

    //- will not output within markup
    p foo
    p bar

на выходе имеем:

    <p>foo</p>
    <p>bar</p>

### Блочные комментарии

Блочные комментарии задаются отступами:

      body
        //
          #content
            h1 Example

на выходе:

    <body>
      <!--
      <div id="content">
        <h1>Example</h1>
      </div>
      -->
    </body>

Jade также поддерживает условные комментарии:

    body
      //if IE
        a(href='http://www.mozilla.com/en-US/firefox/') Get Firefox

на выходе:

    <body>
      <!--[if IE]>
        <a href="http://www.mozilla.com/en-US/firefox/">Get Firefox</a>
      <![endif]-->
    </body>

### Вложенность

Jade поддерживает вложенность тегов, выполняемую естественным способом:

    ul
      li.first
        a(href='#') foo
      li
        a(href='#') bar
      li.last
        a(href='#') baz

### Раскрытие блока

Раскрытие блока позволяет писать компактные однострочные конструкции вложенных тегов,

следующий пример эквивалентен примеру вложенности выше.

      ul
        li.first: a(href='#') foo
        li: a(href='#') bar
        li.last: a(href='#') baz

### Атрибуты

Jade в настоящее время поддерживает разделители атрибутов '(' и ')'.

    a(href='/login', title='View login page') Login

Когда значение `undefined` или `null`, атрибут _не_ добавляется,

и тогда следующий пример не даст в результате 'something="null"':

    div(something=null)

Булевы атрибуты также поддерживаются:

    input(type="checkbox", checked)

Булев атрибут с кодом будет рендериться только если он равен `true`:

    input(type="checkbox", checked=someValue)

Все javascript выражения также работают (если authenticated = true, class у body будет `authed`, иначе - `anon`):

    // - var authenticated = true
    body(class=authenticated ? 'authed' : 'anon')

Атрибуты можно разбивать на несколько строк:

    input(type='checkbox',
      name='agreement',
      checked)

При переносе запятую можно опускать:

    input(type='checkbox'
      name='agreement'
      checked)

Можно манипулировать отступами:

    input(
      type='checkbox'
      name='agreement'
      checked)

Двоеточия учитываются:

    rss(xmlns:atom="atom")

Например у нас есть переменная `user` = `{ id: 12, name: 'tobi' }`
и нам надо создать тег гиперссылки с `href`, указывающим на "/user/12".

Можно конечно использовать обычную JS-конкатенацию:

    a(href='/user/' + user.id)= user.name

, а можно - Jade-овскую интерполяцию, которая была добавлена
по просьбам <strike>трудящихся</strike> рубистов и CoffeeScrip-щиков:

   a(href='/user/#{user.id}')= user.name

Атрибут `class` - особенный, в него можно передавать массив,
например, `bodyClasses = ['user', 'authenticated']`:

    body(class=bodyClasses)

### Doctypes

Чтобы добавить doctype, просто используйте `!!!`, или `doctype`, с необязательным параметром:

    !!!

Выдаст _transitional_ doctype, однако:

    !!! 5

или

    !!! html

или

    doctype html

doctypes нечувствительны к регистру, так что следующее эквивалентно:

    doctype Basic
    doctype basic

Это выдаст _html 5_ doctype.

Вот doctypes определенные по умолчанию (можно легко дополнить своими):

    var doctypes = exports.doctypes = {
	    '5': '<!DOCTYPE html>',
	    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
	    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
	    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
	    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
	    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
	    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
	};

Чтобы изменить значения по умолчанию:

    jade.doctypes.default = 'whatever you want';

## Фильтры

Фильтры пишутся с префиксом `:`, например: `:markdown` и
им передается на обработку последующий блок текста.

См. _возможности_ вверху документа - там есть список доступных фильтров.

    body
      :markdown
        Woah! jade _and_ markdown, very **cool**
        we can even link to [stuff](http://google.com)

Рендерится в:

	<body>
		<p>Woah! jade <em>and</em> markdown, very
		<strong>cool</strong> we can even link to
		<a href="http://google.com">stuff</a>
		</p>
	</body>

Фильтры также могут манипулировать AST-деревом.

Например если надо компилировать условные конструкции прямо в Jade, это можно сделать с помощью фильтра _conditionals_. Обычно фильтры оперируют текстом, однако если фильтру передан обыкновенный блок, он может делать что угодно с тегами, вложенными в него:

    body
      conditionals:
        if role == 'admin'
          p You are amazing
        else
          p Not so amazing

Обратите внимание, что мы не ставим префикс "-" для наших блоков кода.

Примеры того, как можно манипулировать деревом можно найти в [./examples/conditionals.js](https://github.com/visionmedia/jade/blob/master/examples/conditionals.js) и  [./examples/model.js](https://github.com/visionmedia/jade/blob/master/examples/model.js). Есть много вариантов использования этой штуки. Например сжатие/склейка ресурсов на лету (чтобы снизить HTTP-трафик), поддержка сообщений об ошибках, и многое другое.

## Код

Jade поддердивает три типа исполняемого кода. Первый -
это когда ставится префикс `-`, буфферизации не происходит:

    - var foo = 'bar';

Этим можно пользоваться для условных конструкций, циклов:

    - for (var key in obj)
      p= obj[key]

В соответствии с техникой буфферизации Jade, следующее также валидно:

    - if (foo)
      ul
        li yay
        li foo
        li worked
    - else
      p oh no! didnt work

Да, можно итерировать явно:

    - if (items.length)
      ul
        - items.forEach(function(item){
          li= item
        - })

Все что угодно!

Теперь получим заэкранированный буферизированный код,
который буферизирует возвращаемое значение, с префиксом `=`:

    - var foo = 'bar'
    = foo
    h1= foo

Что дает на выходе `bar<h1>bar</h1>`. Код, буферизированый с помощью `=`, по умолчанию экранируется.

Из соображений безопасности.

Однако можно использовать неэкранируемый вариант:

    p!= aVarContainingMoreHTML

Чтобы подсластить синтаксис,
сделано одно исключение - `-each`. Вот в такой форме:

    - each VAL[, KEY] in OBJ

Пример итерации по массиву:

    - var items = ["one", "two", "three"]
    - each item in items
      li= item

на выходе имеем:

    <li>one</li>
    <li>two</li>
    <li>three</li>

Итерация по массиву с индексами:

    - var items = ["one", "two", "three"]
    - each item, i in items
      li #{item}: #{i}

на выходе получаем:

    <li>one: 0</li>
    <li>two: 1</li>
    <li>three: 2</li>

Итерация по ключам и значениям объекта:

    - var obj = { foo: 'bar' }
    - each val, key in obj
      li #{key}: #{val}

дает на выходе `<li>foo: bar</li>`

Также можно вкладывать структуры одна в другую!

    - each user in users
      - each role in user.roles
        li= role

Когда свойство `undefined`, Jade выдаст пустую строку. Например:

    textarea= user.signature

хотя `undefined` должно рисоваться в HTML как "undefined",

последние версии Jade просто выдадут:

    <textarea></textarea>

## Инклюды

Инклюды позволяют статически подключать куски кода шаблонов Jade,

находящиеся в отдельных файлах. Классический пример

это подключение хедера и футера. Например есть следующая

структура папок:

     ./layout.jade
     ./includes/
       ./head.jade
       ./tail.jade

и следующий _layout.jade_:

      html
        include includes/head  
        body
          h1 My Site
          p Welcome to my super amazing site.
          include includes/foot

оба инклюда _includes/head_ и _includes/foot_
читаются относительно опции `filename`, переданной в _layout.jade_,
где должен быть абсолютный путь к файлу данного шаблона, однако Express
и метод `renderFile()` делают это за вас. Include потом парсит
эти файлы, и вставляет получившееся AST, чтобы отрендерить то, что ожидается:


	<html>
	  <head>
		<title>My Site</title>
		<script src="/javascripts/jquery.js">
		</script><script src="/javascripts/app.js"></script>
	  </head>
	  
	  <body>
		<h1>My Site</h1>
		<p>Welcome to my super lame site.</p>
		<div id="footer">
		  <p>Copyright>(c) foobar</p>
		</div>
	  </body>

	</html>


## Примеси (Mixin)

Примеси конвертируются в обычные JavaScript функции внутри
скомпилированного Jade-ом шаблона. Примеси могут
принимать аргументы, впрочем необязательные:

      mixin list
        ul
          li foo
          li bar
          li baz

Вызов примеси без аргументов выглядит похоже, но под ней не пишется блок:

      h2 Groceries
      mixin list

Примесь может принимать несколько аргументов, аргументы -
это обычные javascript выражения, так например следующее:

      mixin pets(pets)
        ul.pets
          - each pet in pets
            li= pet

      mixin profile(user)
        .user
          h2= user.name
          mixin pets(user.pets)

Породит нечто подобное следующему html:

	<div class="user">
	  <h2>tj</h2>
	  <ul class="pets">
		<li>tobi</li>
		<li>loki</li>
		<li>jane</li>
		<li>manny</li>
	  </ul>
	</div>


## Генерируемый код

Например у нас есть такой Jade:

	- var title = 'yay'
	h1.title #{title}
	p Just an example

Когда опция `compileDebug` не указана явно как false, Jade
скомпилирует функцию, оснащенную отладочной информацией вида `__.lineno = n;`,
которая в случае исключения передается в `rethrow()`, который конструирует
читабельное сообщение об ошибке.

	function anonymous(locals) {
	  var __ = { lineno: 1, input: "- var title = 'yay'\nh1.title #{title}\np Just an example", filename: "testing/test.js" };
	  var rethrow = jade.rethrow;
	  try {
		var attrs = jade.attrs, escape = jade.escape;
		var buf = [];
		with (locals || {}) {
		  var interp;
		  __.lineno = 1;
		   var title = 'yay'
		  __.lineno = 2;
		  buf.push('<h1');
		  buf.push(attrs({ "class": ('title') }));
		  buf.push('>');
		  buf.push('' + escape((interp = title) == null ? '' : interp) + '');
		  buf.push('</h1>');
		  __.lineno = 3;
		  buf.push('<p>');
		  buf.push('Just an example');
		  buf.push('</p>');
		}
		return buf.join("");
	  } catch (err) {
		rethrow(err, __.input, __.filename, __.lineno);
	  }
	}

__
Когда опция `compileDebug` _явно_ задана как `false`, эта отладочная информация
опускается, что очень важно для легковесных клиентских шаблонов.

Комбинируя Jade-овские опции и `./runtime.js` из github-репозитария, можно
сделать скомпилированной функции `toString()` и избежать подключения целого компилятора Jade в клиенте,
что повысит производительность, и уменьшит
трафик JS-скриптов.


	function anonymous(locals) {
	  var attrs = jade.attrs, escape = jade.escape;
	  var buf = [];
	  with (locals || {}) {
		var interp;
		var title = 'yay'
		buf.push('<h1');
		buf.push(attrs({ "class": ('title') }));
		buf.push('>');
		buf.push('' + escape((interp = title) == null ? '' : interp) + '');
		buf.push('</h1>');
		buf.push('<p>');
		buf.push('Just an example');
		buf.push('</p>');
	  }
	  return buf.join("");
	}


## bin/jade

Выдать html в  _stdout_:

    jade < my.jade > my.html

Сгенерировать _examples/*.html_:

    jade examples/*.jade

*
Передача опций:

    jade examples/layout.jade --options '{ locals: { title: "foo" }}'

Хелп:

    Использование: jade [options]
                [path ...]
                < in.jade > out.jade  
    Опции:
      -o, --options <str>  JavaScript object с опциями
      -h, --help           Показать хелп
      -w, --watch          Следить за изменениями файлов и перекомпилировать
      -v, --version        Показать версию Jade
      --out <dir>          Выдать откомпилированный HTML в <dir>

## Лицензия 

(The MIT License)

Copyright (c) 2009-2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»), безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, добавление, публикацию, распространение, сублицензирование и/или продажу копий Программного Обеспечения, также как и лицам, которым предоставляется данное Программное Обеспечение, при соблюдении следующих условий:

Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного Обеспечения.

ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ГАРАНТИЯМИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ ПРАВ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО ИСКАМ О ВОЗМЕЩЕНИИ УЩЕРБА, УБЫТКОВ ИЛИ ДРУГИХ ТРЕБОВАНИЙ ПО ДЕЙСТВУЮЩИМ КОНТРАКТАМ, ДЕЛИКТАМ ИЛИ ИНОМУ, ВОЗНИКШИМ ИЗ, ИМЕЮЩИМ ПРИЧИНОЙ ИЛИ СВЯЗАННЫМ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ ИЛИ ИСПОЛЬЗОВАНИЕМ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫМИ ДЕЙСТВИЯМИ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.

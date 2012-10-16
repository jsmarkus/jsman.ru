---
layout: post
title: Browserify - cобираем JS-проект
comments: 1
---

**Browserify** (github:[github.com/substack/node-browserify](https://github.com/substack/node-browserify/), npm:[browserify](https://npmjs.org/package/browserify)) не просто склеивает файлы - он работает с CommonJS-модулями, как Node.js: каждый JS-файл имеет свою изолированную область видимости и умеет экспортировать переменные через `exports`.

Если Вы любите писать серверный код для Node.js, то обязательно полюбите писать и клиентский - с помощью browserify.

Browserify - интеллектуальный сборщик. Анализируя ваш код, он понимает, какие файлы войдут в сборку проекта, а какие - нет.

Я хотел сначала написать сложную статью, рассказать о предыстории моего знакомства с browserify, сравнить его с AMD и require.js, детально описать принцип действия, расписать все ключи командной строки и методы API, перечислить все поддерживаемые node-модули... Но потом понял, что никто такую статью читать не будет - и многие по-прежнему продолжат изобретать велосипеды, собирать JS-код по старинке, а то и не собирать вовсе. Поэтому я решил передать свой субъективный и предвзятый опыт работы с browserify на практике - и сделать это в форме вопросов и ответов.

Итак:

## У меня есть куча JS-файлов, я их хочу собрать в один. Что делать?

Сначала установим [Node.js](http://nodejs.org/download/).

Потом - установим browserify, выполнив в консоли:

	sudo npm -g install browserify

Теперь можно приступать к экспериментам.

Создаём два файла.

{% highlight javascript %}
//----------------------
//Файл index.js
var hello = require('./hello');
hello.helloWorld();

//----------------------
//Файл hello.js
exports.helloWorld = function () {
	alert('Hello browserify world!');
}
{% endhighlight %}

Выполняем в консоли:

	browserify index.js > packed.js

Подключаем `packed.js` в HTML-файле:

{% highlight html %}
<html>
	<head>
		<script src="packed.js"></script>
	</head>
	<body>
	</body>
</html>
{% endhighlight %}


## Эй, а как же отладка?

Как же отлаживать в браузере всё это, если мои файлы упакованы в один здоровенный файл?
Ведь потеряются номера строк!

Однако тут browserify - и разработчики Chrome и Firefox преподносят нам приятный сюрприз.

С файлами из предыдущего примера выполним в консоли:

	browserify --debug index.js > packed.js

Мы добавили ключ `--debug`, и browserify снабдил собранный файл специальными метками,
позволяющими отладчику браузера определить из какого исходника пришёл тот или иной фрагмент кода.

В результате если мы откроем панель "Scripts" в Chrome Developer Tools,
то мы увидим не один - собранный - файл, а отдельно все исходники, из которых он собирался.

![](/i/posts-browserify-debug.png)

## А если мне нужно jQuery?

{% highlight javascript %}
//----------------------
//Файл index.js
var $ = require('br-jquery');

$(function () {
	var hello = $('<h3>Hello world!</h3>');
	$('body').append(hello);
});
{% endhighlight %}

Выполняем в консоли:

	npm install br-jquery

У нас создастся папка `node_modules`, в которой будет лежать модуль `br-jquery`.

Теперь:

	browserify index.js > packed.js

Запускаем HTML-файл из предыдущего примера, и видим, что всё работает.

Что мы сделали - мы установили npm-модуль `br-jquery`.
Это CommonJS-совместимая сборка jQuery последней версии, и её можно подключать в browserify-проектах.
Вообще тенденция такова, что в npm-репозитории стало появляться всё больше клиентских библиотек - например уже есть npm-модули для Knockout, Backbone и пр.

Если для вашей библиотеки нет `npm`-модуля, вы можете написать его сами и первым опубликовать на [http://npmjs.org/](http://npmjs.org/) - это совсем не трудно!
<small>Труднее потом поддерживать актуальную версию, кхм...</small>

## Хочу компилировать CoffeeScript, не задумываясь. Как?

Нет ничего проще. Browserify имеет встроенную поддержку "обработчиков".
Можно просто указать какие расширения файлов используются каким обработчиком.
К счастью, coffeescript уже зарегистрирован для *.coffee-файлов и поэтому CoffeeScript-модули компилируются "из коробки".


{% highlight coffeescript %}
#----------------------
#Файл index.coffee
hello = require './hello'
hello.helloWorld()

#----------------------
#Файл hello.coffee
exports.helloWorld = () ->
	alert 'Hello browserify world!'

{% endhighlight %}


Выполняем в консоли:

	browserify index.coffee > packed.js

И у нас есть `packed.js` - в который упакованы откомпилированные coffeescript-модули.


## А еще хочу компилировать jade!

[Jade - язык шаблонов для серверного JavaScript](/jade/), однако он компилируется в обычный JavaScript и может использоваться в браузере.

У browserify есть [API](https://github.com/substack/node-browserify/blob/master/doc/methods.markdown), позволяющее добавлять свои обработчики (например, компиляторы), как это уже сделано для CoffeeScript.

**UPD: не так давно появился прекрасный модуль, представляющий собой набор плагинов для компиляции различных шаблонов, в том числе и Jade. Называется он [resourcify](https://github.com/alexeypetrushin/resourcify) `npm install resourcify`.**

Но нам интересна теория, поэтому мы пойдем другим путём.

Создадим скрипт `our-browserify.js`, который нам - пусть и сильно упрощённо - заменит команду `browserify`.
В этом скрипте мы будем обращаться напрямую к API, что позволит нам добавить обработчик для `*.jade`.

{% highlight javascript %}
var browserify = require('browserify');
var jade = require('jade');

var b = browserify({
	debug : false
});

b.register('.jade', function (src) {
	var options = {
		client: true,
		compileDebug: false
	};

	src = "module.exports = " + jade.compile(src, options).toString() +";";

	return src;
});

b.addEntry('index.js');

var jaderuntime = require('fs').readFileSync('./node_modules/jade/runtime.js', 'utf8');

b.prepend(jaderuntime);

console.log(b.bundle());
{% endhighlight %}

Теперь установим browserify локально (без опции `-g`):

	npm install browserify

Также установим jade:

	npm install jade

Вернёмся самому первому примеру на JavaScript. Изменим файл `hello.js` следующим образом:


{% highlight javascript %}
//----------------------
//Файл hello.js
var template = require('./template.jade');

exports.helloWorld = function () {
	var html = template({greetingText:'Hello browserify world!'});
	alert(html);
}
{% endhighlight %}

И добавим файл `template.jade`:

	h2= greetingText

Для сборки проекта мы должны вызывать наш скрипт вместо штатной утилиты browserify.

Поэтому выполним:

	node our-browserify.js > packed.js

Если все сделано правильно, `packed.js` будет заканчиваться следующими строками:

{% highlight javascript %}
require.define("/hello.js",function(require,module,exports,__dirname,__filename,process){var template = require('./template.jade');

exports.helloWorld = function () {
	var html = template({greetingText:'Hello browserify world!'});
	alert(html);
}

});

require.define("/template.jade",function(require,module,exports,__dirname,__filename,process){module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h2>');
var __val__ = greetingText
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</h2>');
}
return buf.join("");
};
});

require.define("/index.js",function(require,module,exports,__dirname,__filename,process){var hello = require('./hello');
hello.helloWorld();


});
require("/index.js");

{% endhighlight %}


В итоге если мы запустим файл `index.html` в браузере, мы увидим алерт, в котором будет выведено:

	<h2>Hello browserify world!</h2>

***На этом заканчиваю раздел "для новичков" и перехожу к двум "экспертным" разделам.***

## Я пользуюсь командой make. Как бы это запихнуть в Makefile?

**GNU make** - это целая философия нескольких поколений UNIX-разработчиков.

Опять же, чтобы не превращать статью в академическое исследование,
я не буду приводить здесь сравнение с Apache Ant, Rake, Jake, Cake и пр.
Я предвзят, люблю make, и ничего с этим не поделаешь.

Мы воспользуемся одной из самых главных фишек make - отслеживанием зависимостей.

Правильно написанный Makefile - ленив.
Он не будет ничего собирать, если всё уже собрано ранее, а файлы проекта не изменились.
Чтобы это сделать, нам нужно научить make отслеживать зависимости.
Статья не про make, поэтому буду писать так, будто читатель уже знаком с этой утилитой,
ну или - по крайней мере - изо всех сил вчитывается в её документацию прямо сейчас.

Создадим файл Makefile следующего содержания:

{% highlight makefile %}
#определяем зависимости
DEPS:=$(shell find node_modules/ -type f -name "*.js")
DEPS:=$(DEPS) $(shell ls *.js)

#цель: собранный файл, зависит от всех js-файлов в папке node_modules и в корне проекта
build/packed.js:$(DEPS)
	mkdir -p $(@D)
	node our-browserify.js > $@

#цель - "очистить"
clean:
	rm -rfv build

.PHONY: clean
{% endhighlight %}

Теперь, чтобы собрать проект, нам достаточно просто выполнить в консоли:

	make

Если папка build не создана - она создастся автоматически.
После этого в неё запишется файл `packed.js` - наш собранный проект.

Если теперь выполнить make еще раз, мы увидим сообщение:

	make: `build/packed.js' is up to date.

Это значит, что make проанализировал зависимости, понял, что `build/packed.js` не старше файлов, от которых зависит, и решил не пересобирать его.
Вот она - магия GNU make!

Если же вам позарез надо пересобрать проект, выполните:

	make clean

и затем снова:

	make

Можно даже - у кого Linux - зациклить `make` через `watch`:

	watch -n 4 make

Это приведет к вызову make каждые четыре секунды,
но пересборка будет выполняться только в случае, если хоть один файл с момента последней сборки изменился.
Ну разве не клёво?

## Я пишу сервер на Connect (Express). Как интегрировать туда browserify?

Это всё хорошо, скажете Вы.
Но у меня есть сервер, написанный на [Express](/express/), он работает в облаке,
и я не хочу использовать make, всякие скрипты, утилиты, - я хочу чтобы всё просто работало с запуском сервера.

Нет проблем! Для этого browserify умеет становиться прослойкой (**middleware**) фреймворка Express.

Данный раздел опять-таки предполагает, что Вы разбираетесь в Connect или Express, и знаете, как работает механизм прослоек. Если нет - то либо Вам это не нужно, либо почитайте [мануал по Express-middleware](/express/#middleware).

Простой и понятный пример использования прослойки browserify для Connect показан в папке [example/simple-midleware](https://github.com/substack/node-browserify/tree/master/example/simple-middleware) github-репозитория browserify. Собственно, вот те строки, которые нас интересуют:

{% highlight javascript %}
var browserify = require('browserify');
var bundle = browserify(__dirname + '/js/entry.js');
server.use(bundle); //переменная server - это экземпляр Connect-сервера. Но это может быть и Express - в данном случае без разницы
{% endhighlight %}


Поскольку у Connect и Express работа с прослойками одинакова, то данный пример справедлив и для Express.

Если полностью скачать и запустить тот пример, то при обращении `http://127.0.0.1:8080/browserify.js` сервер будет отдавать собранный проект клиентских файлов.

## Выводы

В данной статье я рассказал о browserify - многообещающей утилите сборки проектов, написанных на JavaScript, CoffeeScript и не только. Практически не требуя настройки, данная утилита приносит всё удобство CommonJS-модулей в мир браузерного JavaScript.

Проекты можно интегрировать в существующую инфраструктуру сборки (у нас её роль выполнял Makefile, но, конечно, можно использовать и другие системы).

Кроме того, возможна сборка на лету, если ваш сервер написан на Node.js и использует один из популярных веб-фреймворков.

Также было показано, как добавлять компиляторы для других языков (в нашем случае - Jade, но в приципе - можно адаптировать любой компилятор из обширного списка [языков, компилирующихся в JS](https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS)).
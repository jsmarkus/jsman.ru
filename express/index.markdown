---
title: Фреймворк Express - руководство пользователя
layout: default
original_url: http://expressjs.com/guide.html
original_title: Express
---

# Express: веб-фреймворк для Node.js. Руководство пользователя

* toc:
{:toc}

    var app = express.createServer();
    app.get('/', function(req, res) {
        res.send('Hello World');
    });
    app.listen(3000);

## Возможности

 - Понятная маршрутизация
 - Помощники перенаправления (redirect helpers)
 - Динамические помощники представлений
 - Опции представлений уровня приложения
 - Взаимодействие с контентом
 - Монтирование приложений
 - Ориентированность на высокую производительность
 - Рендеринг шаблонов и поддержка фрагментных шаблонов (view partials)
 - Конфигурации, быстро переключаемые под разные задачи (`development`, `production`, и т.д.)
 - Хранимые в сессии всплывающие сообщения (flash messages)
 - Сделано на основе [Connect](http://github.com/senchalabs/connect)
 - Скрипт `express` для быстрой генерации каркаса приложения
 - Высокое покрытие тестами


## Установка {#installation}

    $ npm install express

или, чтобы иметь доступ к команде express, установите глобально:

    $ npm install -g express

## Быстрый старт {#quickstart}

Проще всего начать работу с Express можно выполнив команду `express`, которая сгенерирует приложение:

Создание приложения:

    $ npm install -g express
    $ express /tmp/foo && cd /tmp/foo

Установка зависимостей:

    $ npm install -d

Запуск сервера:

    $ node app.js

## Создание сервера {#serverCreation}

Чтобы создать экземпляр `express.HTTPServer`, просто вызовите метод `createServer()`. С помощью нашего экземпляра приложения мы можем задавать маршруты, основанные на HTTP-методах, в данном примере `app.get()`.

    var app = require('express').createServer();
    
    app.get('/', function(req, res){
        res.send('hello world');
    });
    
    app.listen(3000);

## Создание HTTPS-сервера {#https-server-creation}

Чтобы инициализировать `express.HTTPSServer`, мы совершаем те же действия, что и выше, но к тому де передаем объект опций, содержащий ключ, сертификат и другие параметры, о которых написано в документации модуля https NodeJS.

    var app = require('express').createServer({ key: ... });


## Конфигурирование {#configuring}

Express поддерживает произвольные окружения (environments), как например, `production` и `development`. Разработчики могут использовать метод `configure()`, чтобы добавить нужные для данного окружения функции. Когда `configure()` вызывается без имени окружения, он будет срабатывать в любом окружении прежде чем сработает любой `configure`, в котором окружение задано.

В приведенном ниже примере мы просто используем опцию `dumpExceptions` и в режиме разработки выдаем клиенту в ответ стек-трейс исключения. В обоих же режимах мы используем прослойку `methodOverride` и `bodyParser`. Обратите внимание на использование `app.router`, который сам по себе позволяет монтировать маршруты - в противном случае они монтируются при первом вызове `app.get()`, `app.post()` и т.д.

    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(app.router);
    });
    
    app.configure('development', function(){
        app.use(express.static(__dirname + '/public'));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
    
    app.configure('production', function(){
        var oneYear = 31557600000;
        app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
        app.use(express.errorHandler());
    });

Для окруженией со схожими настройками можно передавать несколько имен окружений:

    app.configure('stage', 'prod', function(){
        // config
    });

Для внутренних и произвольных настроек в Express есть методы `set(key[, val])`, `enable(key)`, `disable(key)`:
    
    app.configure(function () {
        app.set('views', __dirname + '/views');
        app.set('views');
        // => "/absolute/path/to/views"
        app.enable('some feature');
        // все равно что app.set('some feature', true);
        app.disable('some feature');
        // все равно что app.set('some feature', false);
        app.enabled('some feature')
        // => false
    });

Чтобы задать окружение мы можем установить переменную окружения `NODE_ENV`. Например:

    $ NODE_ENV=production node app.js

Это очень важно, потому что множество механизмов кэширования включаются только в окружении 	`production`.

## Настройки {#settings}

Из коробки Express поддерживает следующие настройки:

 - `home` - базовый путь приложения, который используется для res.redirect(), а также для прозрачной поддержки примонтированных приложений.
 - `views` корневая директория представлений. По умолчанию `текущая_папка/views`
 - `view engine` - шаблонизатор по умолчанию для представлений, вызываемых без расширения файла.
 - `view options` - объект, отражающий глобальные опции представлений
 - `view cache` - включить кэширование представлений (включается в окружении `production`)
 - `case sensitive routes` - включить маршруты, чувствительные к регистру
 - `strict routing` - если включено, то завершающие слэши больше не игннорируются
 - `jsonp callback` - разрешить методу `res.send()` прозрачную поддержку JSONP

## Маршрутизация {#routing}

Express использует HTTP-методы для обеспечения осмысленного, выразительного API маршрутизации. Например, мы хотим, чтобы по запросу `/user/12` отображался профиль пользователя с `id=12`. Для этого мы определяем привелденный ниже маршрут. Значения, связанные с именованными полями, доступны в объекте `res.params`.

    app.get('/user/:id', function(req, res){
        res.send('user ' + req.params.id);
    });

Маршрут это просто строка, которая внутри движка компилируется в регулярное выражение. Например, когда компилируется `/user/:id`, то получается регулярное выражение вроде такого:

    \/user\/([^\/]+)\/?

Также можно сразу передавать регулярное выражение. Но поскольку группы в регулярных выражениях не именуются, к ним можно добраться в `req.params` по номерам. Так первая группа попадает в `req.params[0]`, вторая в `req.params[1]` и т.д.

    app.get(/^\/users?(?:\/(\d+)(?:\.\.(\d+))?)?/, function(req, res){
        res.send(req.params);
    });

Теперь возьмем curl и пошлем запрос на вышеупомянутый маршрут:

    $ curl http://dev:3000/user
    [null,null]
    $ curl http://dev:3000/users
    [null,null]
    $ curl http://dev:3000/users/1
    ["1",null]
    $ curl http://dev:3000/users/1..15
    ["1","15"]

Ниже приведены несколько примеров маршрутов и пути, которые могут им соответствовать:

	"/user/:id"
	/user/12
	"/users/:id?"
	/users/5
	/users
	"/files/*"
	/files/jquery.js
	/files/javascripts/jquery.js
	"/file/*.*"
	/files/jquery.js
	/files/javascripts/jquery.js
	"/user/:id/:operation?"
	/user/1
	/user/1/edit
	"/products.:format"
	/products.json
	/products.xml
	"/products.:format?"
	/products.json
	/products.xml
	/products
	"/user/:id.:format?"
	/user/12
	/user/12.json

Например, мы можем послать POST-ом некоторый JSON и ответить тем же JSON-ом, используя прослойку `bodyParser`, который умеет парсить JSON запрос (как впрочем и другие запросы) и помещать ответ в `req.body`:

    var express = require('express'),
        app = express.createServer();
    app.use(express.bodyParser());
    app.post('/', function(req, res) {
        res.send(req.body);
    });
    app.listen(3000);

Как правило мы используем "глупое" поле (например, `/user/:id`), у которого нет ограничений. Но если мы, к примеру, хотим ограничить ID пользователя только числовыми символами, можно использовать `/user/:id([0-9]+)`. Такая конструкция не будет срабатывать, если значение поля содержит нечисловые символы.

## Передача управления на другой маршрут {#routing-next}

Вызвав третий аргумент - `next()`,  можно передать управление на следующий маршрут. Если соответствие не найдено, управление передается назад в Connect, и прослойки продолжают вызываться в порядке, в котором они были включены с помощью `use()`. Так же работают несколько маршрутов, имеющих один и тот же путь. Они просто вызываются по очереди, до того момента, когда один их них ответит вместо того, чтобы вызвать `next()`.

    app.get('/users/:id?', function(req, res, next) {
        var id = req.params.id;
        if (id) {
            // делаем что-то
        } else {
            next();
        }
    });

    app.get('/users', function(req, res) {
        // делаем что-то другое
    });

Метод `app.all()` полезен, если нужно выполнить одну и ту же логику для всех HTTP-методов. Ниже мы используем этот метод для извлечения юзера из базы данных и назначения его в `req.user`.

    var express = require('express'),
        app = express.createServer();
    var users = [{
        name: 'tj'
    }];
    app.all('/user/:id/:op?', function(req, res, next) {
        req.user = users[req.params.id];
        if (req.user) {
            next();
        } else {
            next(new Error('cannot find user ' + req.params.id));
        }
    });

    app.get('/user/:id', function(req, res) {
        res.send('viewing ' + req.user.name);
    });

    app.get('/user/:id/edit', function(req, res) {
        res.send('editing ' + req.user.name);
    });

    app.put('/user/:id', function(req, res) {
        res.send('updating ' + req.user.name);
    });

    app.get('*', function(req, res) {
        res.send('what???', 404);
    });

    app.listen(3000);

## Прослойки {#middleware}

Прослойки фреймворка Connect можно передавать в `express.createServer()` точно так же, как если бы использовался обычный Connect-сервер. Например:

    var express = require('express');
    var app = express.createServer(
        express.logger(),
        express.bodyParser());

Так же можно использовать `use()`. Так удобнее добавлять прослойки внутри блоков `configure()`, что более прогрессивно.

    app.use(express.logger({ format: ':method :url' }));

Обычно с прослойками Connect мы можем подключить Connect следующим образом:

    var connect = require('connect');
    app.use(connect.logger());
    app.use(connect.bodyParser());

Это не совсем удобно, поэтому Express повторно экспортирует Connect-овские прослойки:

    app.use(express.logger());
    app.use(express.bodyParser());

Порядок прослоек имеет значение. Так, когда Connect получает запрос, выполняется первая прослойка, добавленная через `createServer()` или `use()`. Она вызывается с тремя параметрами: `request`, `response` и callback-функция, обычно называемая `next`. когда вызывается `next()`, управление передается на вторую прослойку и т.д. Это важно учитывать, так так множество прослоек зависят друг от друга. Например `methodOverride()` обращается к `req.body.method` для перегрузки HTTP-метода, а `bodyParser()` парсит тело запроса, чтобы заполнить `req.body`. Другой пример - парсинг cookies и поддержка сессий - вначале необходимо вызывать `use()` для `cookieParser()`, затем для `session()`.

Множество Express-приложений может иметь строчку `app.use(app.router)`. Это может показаться странным, но это нужно просто для того, чтобы явным образом указать прослойку, которая включает в себя все созданные нами маршруты. Эту прослойку можно включать в любом порядке, хотя по умолчанию она включается в конце. Изменяя ее позицию, можно управлять очередностью ее выполнения. Например, нам нужен обработчик ошибок, который будет срабатывать после всех других прослоек и отображать любое исключение, переданное в него с помощью `next()`. Или же может понадобиться понизить очередность выполнения прослойки, обслуживающей статические файлы, чтобы позволить другим маршрутам перехватывать запросы к таким файлам и, например, считать количество скачиваний и т.д. Вот как это может выглядеть:

    app.use(express.logger(...));
    app.use(express.bodyParser(...));
    app.use(express.cookieParser(...));
    app.use(express.session(...));
    app.use(app.router);
    app.use(express.static(...));
    app.use(express.errorHandler(...));

Сначала мы добавляет `logger()` - он будет оборачивать метод `req.end()`, чтобы предоставлять нам данные о скорости ответа. Потом мы парсим тело запроса (если таковое имеется), затем куки, далее сессию, чтобы `req.session` был уже определен, когда мы доберемся до маршрутов в `app.router`. Если, например, запрос `GET /javascripts/jquery.js` будет обрабатываться маршрутами, и мы не вызовем `next()`, то прослойа `static()` никогда не получит этот запрос. Однако, если мы определим маршрут, как показано ниже, можно будет записывать статистику, отклонять загрузки, списывать оплату за загрузки, и т.д.

    var downloads = {};
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.get('/*', function(req, res, next) {
        var file = req.params[0];
        downloads[file] = downloads[file] || 0;
        downloads[file]++;
        next();
    });


## Маршруты-прослойки {#route-middleware}

Маршруты могут использовать маршрутные прослойки путем передачи методу дополнительных коллбэков (или массивов). Это полезно, если нужно ограничить доступ либо подгружать какие-либо данные перед использованием маршрута, и т.д.

Обычно асинхронное получение данных может выглядеть примерно как показано ниже (тут мы берем параметр `:id` и грузим данные юзера).

    app.get('/user/:id', function(req, res, next) {
        loadUser(req.params.id, function(err, user) {
            if (err) return next(err);
            res.send('Viewing user ' + user.name);
        });
    });

Чтобы придерживаться принципа [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself) и повысить читабельность кода, можно организовать такую логику с помощью прослоек. Как можно заметить, абстрагируя логику с помощью прослоек, можно как добиться повторного использования прослоек, так и сделать код маршрута более красивым.

    function loadUser(req, res, next) {
        // тут мы грузим юзера из базы данных
        var user = users[req.params.id];
        if (user) {
            req.user = user;
            next();
        } else {
            next(new Error('Failed to load user ' + req.params.id));
        }
    }
    app.get('/user/:id', loadUser, function(req, res) {
        res.send('Viewing user ' + req.user.name);
    });

Можно добавлять несколько маршрутных прослоек, и они будут выполняться последовательно, чтобы обеспечить различную логику, как, например, ограничение доступа к пользовательскому аккаунту. В нижеприведенном примере только авторизованный юзер может редактировать свой аккаунт.

    function andRestrictToSelf(req, res, next) {
        req.authenticatedUser.id == req.user.id ? next() : next(new Error('Unauthorized'));
    }
    app.get('/user/:id/edit', loadUser, andRestrictToSelf, function(req, res) {
        res.send('Editing user ' + req.user.name);
    });

Принимая во внимание тот факт, что прослойки - это просто функции, можно написать функцию, которая бы возвращала прослойку (чтобы обеспечить еще более выразительное и гибкое решение), как показано ниже.

    function andRestrictTo(role) {
        return function(req, res, next) {
            req.authenticatedUser.role == role ? next() : next(new Error('Unauthorized'));
        }
    }
    app.del('/user/:id', loadUser, andRestrictTo('admin'), function(req, res) {
        res.send('Deleted user ' + req.user.name);
    });

Часто используемые "стеки" прослоек можно передавать как массивы произвольной глубины и древовидности (они будут применяться рекурсивно):

    var a = [middleware1, middleware2],
        b = [middleware3, middleware4],
        all = [a, b];
    app.get('/foo', a, function() {});
    app.get('/bar', a, function() {});
    app.get('/', a, middleware3, middleware4, function() {});
    app.get('/', a, b, function() {});
    app.get('/', all, function() {});

Полный пример можно посмотреть в [репозитории](http://github.com/visionmedia/express/blob/master/examples/route-middleware/app.js).

Бывают случаи, когда надо пропустить остальные прослойки маршрута в стеке, но продолжить выполнение следующих маршрутов. Для этого надо вызывать `next()` с аргументом `route`: `next("route")`. Если не осталось маршрутов для выполнения, Express ответит ошибкой `404 Not Found`.

## HTTP-методы {#http-verbs}

Мы уже неоднократно пользовались `app.get()`, однако Express также предоставляет прочие HTTP-методы - `app.post()`, `app.del()` и т.д.

Самый распространенный пример использования POST - это отправка формы. В примере ниже мы просто делаем HTML-форму. А потом управление будет передаваться маршруту, который мы определим в следующем примере.

    <form method="post" action="/">
        <input type="text" name="user[name]" />
        <input type="text" name="user[email]" />
        <input type="submit" value="Submit" />
    </form>

По умолчанию Express не знает, что ему делать с телом запроса, поэтому мы должны добавить прослойку `bodyParser()`, которая будет парсить тело запроса, закодированное в `application/x-www-form-urlencoded` или `application/json`, и помещать результаты парсинга в `req.body`. Для этого мы должны сказать `use()`, как показано ниже:

    app.use(express.bodyParser());

Теперь нижеприведенный маршрут будет иметь доступ к объекту `req.body.user`, у которого будут свойства `name` и `email`:

    app.post('/', function(req, res) {
        console.log(req.body.user);
        res.redirect('back');
    });

В случае использования формой таких методов как PUT, можно использовать скрытый инпут по имени `_method`, который позволяет изменить HTTP-метод. Чтобы этого добиться, нужно сначала задействовать прослойку `methodOverride()`, которая будет помещена после `bodyParser()`, что позволит ей использовать `req.body`, содержащий поля переданной формы.

    app.use(express.bodyParser());
    app.use(express.methodOverride());

Эти прослойки не задействованы по умолчанию, потому что Express не обязательно должен сразу обладать полным функционалом. В зависимости от нужд приложения, можно и не использовать их. И тогда методы PUT и DELETE все так же будут доступны, но уже напрямую. В то же вреям `methodOverride` - это отличное решение для HTML-форм. Ниже показан пример использования метода PUT:

    <form method="post" action="/">
        <input type="hidden" name="_method" value="put" />
        <input type="text" name="user[name]" />
        <input type="text" name="user[email]" />
        <input type="submit" value="Submit" />
    </form>

    app.put('/', function() {
        console.log(req.body.user);
        res.redirect('back');
    });


## Обработка ошибок {#errors-handling}

У Express есть метод `app.error()`, который принимает все исключения, брошенные маршрутами, или переданные в виде `next(err)`. Ниже пример, как обслуживать несколько страниц с использованием самодельного исключения `NotFound`:

    function NotFound(msg) {
        this.name = 'NotFound';
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    }
    NotFound.prototype.__proto__ = Error.prototype;
    app.get('/404', function(req, res) {
        throw new NotFound;
    });
    app.get('/500', function(req, res) {
        throw new Error('keyboard cat!');
    });

Можно вызывать `app.error()` несколько раз, как показано ниже. Тут мы проверяем `instanceof NotFound` и показываем страницу `404`, или же передаем управление следующему обработчику ошибок.

Заметьте, что эти обработчики могут быть определены где угодно, поскольку они все равно будут помещены ниже обработчиков маршрутов в `listen()`. Это позволяет их определять внутри блоков `configure()`, так что можно обрабатывать исключения по-разному в зависимости от текущего окружения.

    app.error(function(err, req, res, next) {
        if (err instanceof NotFound) {
            res.render('404.jade');
        } else {
            next(err);
        }
    });

Для просто ты мы принимаем здесь, что все ошибки имеют код 500, но вы можете это изменить как угодно. Например когда Node делает операции с файловой системой, можно получить объект ошибки с полем `error.code = ENOENT`, что означает "не найден файл или директория", мы можем использовать это в обработчике ошибок и показывать соответствующую страницу.

    app.error(function(err, req, res) {
        res.render('500.jade', {
            error: err
        });
    });

Также приложения могут использовать для обработки исключений Connect-овскую прослойку `errorHander`. Например, если нужно в окружении `development` показывать исключения в `stderr`, можно сделать так:

    app.use(express.errorHandler({ dumpExceptions: true }));

Также в ходе разработки нам могут понадобиться клевые HTML-странички, показывающие переданные или брошенные исключения. В таком случае нужно установить `showStack` в `true`:

    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

Прослойка `errorHandler` также отвечает в JSON, если клиентом передан заголовок `Accept: application/json`, что полезно для разработки AJAX-приложений.

## Пред-обработки параметров маршрута {#route-params-preconditions}

Пред-обработки параметров маршрута могут существенно улучшить читабельность приложения, через явную загрузку данных и валидацию URL запроса. Например, если вы постоянно извлекаете какие-то данные для определенных запросов (например грузите пользовательские данные для `/user/:id`), можно сделать что-то вроде этого:

    app.get('/user/:userId', function(req, res, next) {
        User.get(req.params.userId, function(err, user) {
            if (err) return next(err);
            res.send('user ' + user.name);
        });
    });

С пред-условиями на наши параметры запроса можно навесить callback-функции, которые бы выполняли валидацию, ограничене доступа, или даже загрузку данных из базы данных. В примере ниже мы вызываем `app.param()` с именем параметра, на который хотим навесить callback. Как можно заметить мы получаем аргумент `id`, который содержит имя поля. Таким образом мы загружаем объект пользователя и выполняем обычную обработку ошибок и простой вызов `next()`, чтобы передать управление на следующее пред-условие либо уже на обработчик маршрута.

    app.param('userId', function(req, res, next, id) {
        User.get(id, function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('failed to find user'));
            req.user = user;
            next();
        });
    });

Вышеуказанные действия, как уже говорилось, значительно улучшают читабельность кода и позволяют легко использовать одну логику в разных местах приложения:

    app.get('/user/:userId', function(req, res) {
        res.send('user ' + req.user.name);
    });

## Рендеринг представлений {#view-rendering}

Имена файлов представлений образуются по схеме `{имя}.{движок}`, где `{движок}` - это название модуля шаблонизатора, который должен быть подключен. Например представление `layout.ejs` говорит системе представлений, что надо сделать `require('ejs')`. Чтобы интегрироваться в Express, загружаемый модуль должен экспортировать метод `exports.compile(str, options)`, и возвращать функцию. Чтобы изменить это поведение, можно пользоваться методом `app.register()` - он позволяет проассоциировать расширения файлов с определенными движками. Например можно сделать, чтобы `foo.html` рендерился движком **ejs**.

Ниже - пример, использующий **[Jade](/jade/guide.html)** для рендеринга `index.html`. И поскольку мы не используем `layout:false`, отрендеренный контент представления `index.jade` будет передан как локальная переменная `body` в представление layout.jade.

    app.get('/', function(req, res) {
        res.render('index.jade', {
            title: 'My Site'
        });
    });

Настройка `view engine` позволяет указать шаблонизатор по умолчанию. Так например при использовании Jade можно сделать так:

    app.set('view engine', 'jade');

что позволит нам рендерить так:

    res.render('index');

, а не так:

    res.render('index.jade');

Когда шаблонизатор установлен через `view engine`, расширения файлов не нужны. Однако мы по-прежнему можем использовать сразу несколько шаблонизаторов:

    res.render('another-page.ejs');

В Express также есть настройка `view options`, которая будет накладываться при каждом рендеринге представления. Например если вы не так часто используете лэйауты, можно написать так:

    app.set('view options', {
        layout: false
    });

Что можно при необходимости потом перегрузить в вызове `res.render()`:

    res.render('myview.ejs', { layout: true });

Когда же нужен другой лэйаут, можно также указать путь. Например, если у нас `view engine` установлен в `jade`, и файл лэйаута называется `./views/mylayout.jade`, можно просто передать:

    res.render('page', { layout: 'mylayout' });

В противном случае можно передать расширение файла:

    res.render('page', { layout: 'mylayout.jade' });

Пути могут быть также абсолютными:

    res.render('page', { layout: __dirname + '/../../mylayout.jade' });

Хороший пример - это указание нестандартных открывающих и закрывающих тегов движка **ejs**:

    app.set('view options', {
        open: '{% raw %}{{{% endraw %}',
        close: '{% raw %}}}{% endraw %}'
    });

## Фрагменты представлений {#view-partials}

Система представлений Express имеет встроенную поддержку фрагментов и коллекций, своего рода мини-представлений. Например, вместо того, чтобы итерировать в представлении циклом для отображения списка комментариев, можно просто использовать фрагмент `collection`:

    partial('comment', { collection: comments });

Если другие опции или локальные переменные не нужны, то можно пропустить объект и просто передать массив данных. Пример ниже равносилен предыдущему:

    partial('comment', comments);

В случае использовании коллекций мы имеем несколько "волшебных" локальных переменных:

 - `firstInCollection` - `true`, если это первый объект
 - `indexInCollection` - индекс объекта в коллекции
 - `lastInCollection` - `true`, если это последний объект
 - `collectionLength` - длина коллекции

Переданные или сгенерированные локальные переменные имеет более высокий приоритет, однако локальные переменные, переданные в родительское представление, также доступны и в дочернем. Так например, если мы рендерим представление с помощью `partial('blog/post', post)` и оно породит локальную переменную `post`, а представление, вызвавшее эту функцию, имело локальную переменную `user`, то `user` также будет виден в представлении `blog/post`.

Дополнительную документацию см в разделе `res.partial()`.

Примечание: используйте коллекции осторожно, так как рендеринг массива в 100 элементов означает рендеринг 100 представлений. Для простых коллекций лучше итерировать циклом внутри представления, а не использовать коллекции. Так  нагрузка будет меньше.

## Поиск представлений {#view-lookup}

Поиск представлений производится относительно родительского преставления. Например если у нас есть представление `views/user/list.jade` и внутри него мы вызываем фрагмент `partial('edit')`, система попытается загрузить представление `views/user/edit.jade`, тогда как `partial('../messages')` приведет к загрузке `views/messages.jade`

Система представлений также позволяет делать index-файлы. Например, мы можем вызвать `res.render('users')`, и это может загрузить как `views/users.jade`, так и `views/users/index.jade`.

Использовать index-файлы можно также из представления в той же директории. Так вызовом `partial('users')` можно обратиться к представлению `../users/index` вместо того чтобы вызывать `partial('index')`.

## Шаблонизаторы {#view-engines}

Ниже представлены несколько шаблонизаторов, часто используемых с Express:

 - [**Haml**](http://github.com/visionmedia/haml.js)
 - [**Jade**](http://jade-lang.com/)
 - [**EJS**](http://github.com/visionmedia/ejs) - встроенный JavaScript
 - [**CoffeeKup**](http://github.com/mauricemach/coffeekup) - шаблонизация на основе **CoffeeScript**
 - [**jQuery Templates**](https://github.com/kof/node-jqtpl) для Node

## Поддержка сессий {#session-support}

Поддержку сессий можно включить используя Connect-овскую прослойку `session`. Также для этого нам нужна вышележащая прослойка `cookieParser`, которая будет парсить куки и помещать их в `req.cookies`.

    app.use(express.cookieParser());
    app.use(express.session({ secret: "keyboard cat" }));

По умолчанию прослойка `session` использует Connect-овское хранилище в памяти, однако существует множество других решений. Например **connect-redis** поддерживает хранилище сессий в **Redis**. Вот как им пользоваться:

    var RedisStore = require('connect-redis')(express);
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "keyboard cat",
        store: new RedisStore
    }));

Теперь свойства `req.session` и `req.sessionStore` будут доступны из всех маршрутов и последующих прослоек. Свойства `req.session` автоматически сохраняются при ответе. Вот как можно организовать корзину:

    var RedisStore = require('connect-redis')(express);
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "keyboard cat",
        store: new RedisStore
    }));
    app.post('/add-to-cart', function(req, res) {
        // допустим мы передали из формы несколько объектов
        // используем для этого bodyParser()
        var items = req.body.items;
        req.session.items = items;
        res.redirect('back');
    });
    app.get('/add-to-cart', function(req, res) {
        // Когда мы редиректим назат на GET /add-to-cart
        // мы можем проверить req.session.items && req.session.items.length
        // чтобы распечатать наше сообщение
        if (req.session.items && req.session.items.length) {
            req.flash('info', 'You have %s items in your cart', req.session.items.length);
        }
        res.render('shopping-cart');
    });

Объект `req.session` также имеет методы `Session.touch()`, `Session.destroy()`, `Session.regenerate()` для манипуляции сессиями. Для более полной информации см. документацию [Connect Session](http://senchalabs.github.com/connect/middleware-session.html).

## Руководство по миграции {#migration}

Разработчики, работавшие с Express 1.x могут обращаться к [руководству по миграции](http://expressjs.com/migrate.html), чтобы научить свои приложения работать с Express 2.x, Connect 1.x, и Node 0.4.x.

## Request {#request}

### req.header(key[, defaultValue]) {#req-header}

Получить заголовок запроса `key` (нечувствительно к регистру) с необязательным значением по умолчанию `DefaultValue`:

    req.header('Host');
    req.header('host');
    req.header('Accept', '*/*');

Заголовки `Referrer` и `Referer` - особый случай, обе конструкции будут работать:

    // послан заголовок "Referrer: http://google.com"
    req.header('Referer');
    // => "http://google.com"
    req.header('Referrer');
    // => "http://google.com"
    
### req.accepts(type) {#req-accepts}

Проверяет передан ли заголовок `Accept`, и подходит ли он под данный тип.

Когда заголовок `Accept` отсутствует, возвращается `true`. В противном случае проверяется соответствие типа, а потом подтипов. Можно передавать `'html'` которое внутренне конвертируется в `'text/html'`, используя таблицу соответствия MIME.

    // Accept: text/html
    req.accepts('html');
    // => true
    // Accept: text/*; application/json
    req.accepts('html');
    req.accepts('text/html');
    req.accepts('text/plain');
    req.accepts('application/json');
    // => true
    req.accepts('image/png');
    req.accepts('png');
    // => false

### req.is(type) {#req-is}

Проверяет входящий запрос на наличие заголовка `Content-Type` и соответствие заданному MIME-типу.

    // Пусть Content-Type: text/html; charset=utf-8
    req.is('html');
    req.is('text/html');
    // => true
    // Пусть Content-Type теперь application/json
    req.is('json');
    req.is('application/json');
    // => true
    req.is('html');
    // => false

В Express можно регистрировать собственные коллбэки для различных проверок запроса. Например, пусть нам нужно сделать красивую проверку является ли входящий запрос изображением. Для этого можно зарегистрировать коллбэк `'an image'`:

    app.is('an image', function(req) {
        return 0 == req.headers['content-type'].indexOf('image');
    });

Теперь внутри обработчиков маршрутов можно использовать его, чтобы проверять `Content-Type` вида `'image/jpeg'`, `'image/png'` и т.д.

    app.post('/image/upload', function(req, res, next) {
        if (req.is('an image')) {
            // выполняем определенные действия
        } else {
            next();
        }
    });

Не забывайте, что этот метод распространяется не только на `Content-Type` - вы можете делать любые проверки.

Также можно использовать подстановочные символы. Это упростит наш пример с изображением. Тут мы будем проверять только тип:

    req.is('image/*');

Мы также можем также проверять подтип, как показано ниже. Тут проверка вернет `true` в случаях `'application/json'`, и `'text/json'`.

    req.is('*/json');

### req.param(name[, default]) {#req-param}

Возвращает значение параметра `name` или - если оно не существует - `default`.

Проверяет параметры маршрута (`req.params`), например, `/user/:id`

Проверяет параметры строки запроса (`req.query`), например, `?id=12`

Проверяет urlencoded-параметры тела запроса (`req.body`), например, `id=12`

Чтобы получать urlencoded-параметры тела запроса, должен существовать объект `req.body`. Для этого включите прослойку `bodyParser()`.

### req.get(field, param) {#req-get}

Получает параметр поля заголовка. По умолчанию - пустая строка.

    req.get('content-disposition', 'filename');
    // => "something.png"
    req.get('Content-Type', 'boundary');
    // => "--foo-bar-baz"

### req.flash(type[, msg]) {#res-flash}

Помещает всплывающее сообщение в очередь.

    req.flash('info', 'email sent');
    req.flash('error', 'email delivery failed');
    req.flash('info', 'email re-sent');
    // => 2
    req.flash('info');
    // => ['email sent', 'email re-sent']
    req.flash('info');
    // => []
    req.flash();
    // => { error: ['email delivery failed'], info: [] }

Всплывающие сообщения также могут использовать форматные строки. По умолчанию доступна строка `'%s'`:

    req.flash('info', 'email delivery to _%s_ from _%s_ failed.', toUser, fromUser);

### req.isXMLHttpRequest {#res-xhr}

Также имеет сокращение `req.xhr`. Проверяет заголовок `X-Requested-With` на предмет того, что запрос сделан с помощью `XMLHttpRequest`:

    req.xhr
    req.isXMLHttpRequest

## Response {#response}

### res.header(key[, val]) {#res-header}

Получает или устанавливает заголовок ответа.

    res.header('Content-Length');
    // => undefined
    res.header('Content-Length', 123);
    // => 123
    res.header('Content-Length');
    // => 123

### res.charset {#res-charset}

Устанавливает кодировку следующих заголовков `Content-Type`. Например, `res.send()` и `res.render()` по умолчанию будут `"utf8"`, а мы можем явно задать кодировку перед тем как рендерить шаблон:

    res.charset = 'ISO-8859-1';
    res.render('users');

или перед тем, как отвечать с помощью `res.send()`:

    res.charset = 'ISO-8859-1';
    res.send(str);

или с помощью встроенного в Node `res.end()`:

    res.charset = 'ISO-8859-1';
    res.header('Content-Type', 'text/plain');
    res.end(str);

### res.contentType(type) {#res-content-type}

Устанавливает заголовок ответа `Content-Type`.

    var filename = 'path/to/image.png';
    res.contentType(filename);
    // Content-Type теперь "image/png"

Можно задавать `Content-Type` и строкой:

    res.contentType('application/json');

Или просто расширением файла (без ведущей точки):

    res.contentType('json');

### res.attachment([filename]) {#res-attachment}

Устанавливает заголовок ответа `Content-Disposition` в `"attachment"`. Опционально может быть передано имя файла.

    res.attachment('path/to/my/image.png');

### res.sendfile(path[, options[, callback]]) {#res-sendfile}

Используется в `res.download()` для передачи произвольного файла.

    res.sendfile('path/to/my.file');

Этод метод принимает необязательный параметр `callback`, который вызывается в случае ошибки или успеха передачи файла. По умолчанию вызывается `next(err)`, однако если передан `callback`, то надо это делать явно, или обрабатывать ошибку.

    res.sendfile(path, function(err) {
        if (err) {
            next(err);
        } else {
            console.log('transferred %s', path);
        }
    });

Также можно передавать опции вызову `fs.createReadStream()`. Например, чтобы изменить размер буфера:

    res.sendfile(path, {
        bufferSize: 1024
    }, function(err) {
        // обработка...
    });

### res.download(file[, filename[, callback[, callback2]]]) {#res-download}

Передать данный файл как вложение (можно задать необязательное альтернативное имя файла).

res.download('path/to/image.png');

res.download('path/to/image.png', 'foo.png');

Это эквивалентно следующему:

    res.attachment(file);
    res.sendfile(file);

Опционально можно задать `callback` вторым или третьим аргументом `res.sendfile()`. Внутри него вы можете отвечать, как если бы заголовок еще не был передан.

    res.download(path, 'expenses.doc', function(err) {
        // обработка...
    });

Также можно опционально передать второй коллбэк - `callback2`. В нем обрабатываются ошибки, связанные с соединением. Однако в нем не следует пытаться посылать ответ.

    res.download(path, function(err) {
        // ошибка или завершение
    }, function(err) {
        // ошибка соединения
    });

### res.send(body|status[, headers|status[, status]]) {#res-send}

Метод `res.send()` - высокоуровневое средство ответа, позволяющее передавать объекты (для JSON-ответа), строки (для HTML-ответа), экземпляры `Buffer`, или целые числа, определяющие статус-код (`404`, `500` и т.д.). Вот как это используется:

    res.send(); // 204
    res.send(new Buffer('wahoo'));
    res.send({
        some: 'json'
    });
    res.send('<p>some html</p>');
    res.send('Sorry, cant find that', 404);
    res.send('text', {
        'Content-Type': 'text/plain'
    }, 201);
    res.send(404);

По умолчанию заголовок `Content-Type` устанавливается автоматически. Однако если он был вручную, явным образом задан в `res.send()` или перед этим с помощью `res.header()`, или с помощью `res.contentType()`, то автоматической установки не произойдет.

Заметьте, что в этом методе происходит завершение ответа (аналогично `res.end()`), поэтому, если нужно выдать множественный ответ, или поток, то нужнопользоваться `res.write()`.

### res.json(obj[, headers|status[, status]]) {#res-json}

Посылает JSON-ответ с необязательными заголовками и статус-кодом. Этот метод идеален для организации JSON-API, однако JSON можно посылать также с помощью `res.send(obj)` (что впрочем не идеально, если нужно послать только строку, закодированную в JSON, так как `res.send(string)` отправит HTML)

    res.json(null);
    res.json({
        user: 'tj'
    });
    res.json('караул!', 500);
    res.json('Ничего не найдено', 404);

### res.redirect(url[, status]) {#res-redirect}

Перенаправляет на заданный URL. Статус-код по умолчанию - `302`.

    res.redirect('/', 301);
    res.redirect('/account');
    res.redirect('http://google.com');
    res.redirect('home');
    res.redirect('back');

Express поддерживает сокращения для редиректов - по умолчанию это `'back'` и `'home'`. При этом `'back'` перенаправляет на URL, заданный в заголовке Referrer (или Referer), а `'home'` использует настройку `"home"` (по умолчанию `"/"`).

### res.cookie(name, val[, options]) {#res-cookie}

Устанавливает значение `cookie` с именем `name` в `val`. Опции: `httpOnly`, `secure`, `expires`, и т.д. Опция `path` по умолчанию принимает значение, установленное в настройке `"home"`, обычно это `"/"`.

    // "Запомнить меня" на 15 минут
    res.cookie('rememberme', 'yes', {
        expires: new Date(Date.now() + 900000),
        httpOnly: true
    });

Свойством `maxAge` можно задавать `expire` относительно `Date.now()` в миллисекундах. Таким образом наш вышеупомянутый пример теперь можно переписать так:

    res.cookie('rememberme', 'yes', { maxAge: 900000 });

Чтобы парсить входящие куки, использйте прослойку `cookieParser`, которая формирует объект `req.cookies`:

    app.use(express.cookieParser());
    app.get('/', function(req, res) {
        // используем req.cookies.rememberme
    });

### res.clearCookie(name[, options]) {#res-clear-cookie}

Очищаем `cookie` по имени `name`, присваивая параметру `expires` дату в далеком прошлом. Опции те же, что у `res.cookie()`, `path` точно так же по умолчанию равен настройке `"home"`.

    res.clearCookie('rememberme');

### res.render(view[, options[, fn]]) {#res-render}

Рендерит представление `view` с заданными опциями `options` и необязательным коллбеком `fn`. Когда задана `fn`, ответ клиенту не происходит автоматически, в противном же случае делается ответ `text/html` с кодом `200`.

Передаваемые опции являются по совместительству локальными переменными представления. Например, если мы хотим передать переменую `user` и запретить лэйаут, мы делаем это в одном объекте:

    var user = {
        name: 'tj'
    };
    res.render('index', {
        layout: false,
        user: user
    });

Также объект `options` служит для передачи опций. Например, если вы передаете свойство `status`, то оно не только становится доступно представлению, а  также устанавливает статус-код ответа. Это также полезно, если шаблонизатор принимает определенные опции, например `debug` или `compress`. Ниже - пример того, как можно отрендерить страницу ошибки - тут передается `status` как для его отображения, так и для установки статус-кода `res.statusCode`.

    res.render('error', { status: 500, message: 'Internal Server Error' });

### res.partial(view[, options]) {#res-partial}

Рендерит фрагмент с заданными опциями. Этот метод всегда доступен из представления как локальная переменная.

 - `object` - объект, передаваемый в представление
 - `as` - имя переменной, которая будет представлять объект `object` или каждый элемент коллекции `collection`, переданных в представление. По умолчанию - имя представления.
    - `as: 'something'` - добавит локальную переменную something
    - `as: this` - будет использовать элемент коллекции как контекст представления (this)
    - `as: global` - сольёт воедино свойства элемента колекции и локальные переменные представления
    - `collection` - массив объектов. Имя его происходит из имени представления. Например  video.html будет имметь внутри объект video.

Следующие конструкции эквивалентны друг другу и имя коллекции, переданное фрагменту, везде будет `"movie"`.

    partial('theatre/movie.jade', {
        collection: movies
    });
    partial('theatre/movie.jade', movies);
    partial('movie.jade', {
        collection: movies
    });
    partial('movie.jade', movies);
    partial('movie', movies);
    // Внутри представления: moovie.director
    

Чтобы сменить имя локальной переменной с `'movie'` на `'video'`, можно использовать опцию `as`:

    partial('movie', {
        collection: movies,
        as: 'video'
    });
    // Внутри представления: video.director
    

Также мы  можем сделать `movie` значением `this` внутри нашего представления, чтобы вместо `movie.director` можно было обращаться `this.director`.

    partial('movie', {
        collection: movies,
        as: this
    });
    // Внутри представления: this.director

Альтернативное решение - это развернуть свойства элемента коллекции в псевдо-глобальные (на самом деле локальные) переменные, используя `as: global`, такой вот "синтаксический сахар":

    partial('movie', {
        collection: movies,
        as: global
    });
    // Внутри представления: director

Такая же логика применима не только к коллекциям, но и к объекту внутри фрагментного представления:

    partial('movie', {
        object: movie,
        as: this
    });
    // Внутри представления: this.director
    partial('movie', {
        object: movie,
        as: global
    });
    // Внутри представления: director
    partial('movie', {
        object: movie,
        as: 'video'
    });
    // Внутри представления: video.director
    partial('movie', {
        object: movie
    });
    // movie.director
    

Когда второй аргумент - не-коллекция (про признаку отсутствия `.length`), он считается объектом. При этом имя локальной переменной для этого объекта образуется из имени представления.

    var movie = new Movie('Nightmare Before Christmas', 'Tim Burton')
     partial('movie', movie)
    // => Внутри представления: movie.director

Исключение из этого правила - это когда передается простой объект (`"{}"` или `"new Object"`), тогда он считается объектом с локальными переменными (прим перев.: и недоступен по имени внутри фрагментного представления). Например в следующем примере можно ожидать, что будет локальная переменная `"movie"`, однако поскольку это простой объект, локальные переменные уже `"director"` и `"title"`, то есть его свойства:

    var movie = {
        title: 'Nightmare Before Christmas',
        director: 'Tim Burton'
    };
    partial('movie', movie)

Для таких случаев, когда нужно передавать именно простой объект, просто присвойте его какому-нибудь свойству, или используйте свойства `object`, которое унаследует имя объекта из имени файла. Перечисленные ниже примеры эквивалентны:

    partial('movie', {
        locals: {
            movie: movie
        }
    })
     partial('movie', {
        movie: movie
    })
     partial('movie', {
        object: movie
    })

Такой же самый API может быть использован из маршрута, чтобы можно было ответить HTML-фрагментом через AJAX или WebSockets, например можно отрендерить коллекцию пользователей напрямую из маршрута:

    app.get('/users', function(req, res) {
        if (req.xhr) {
            // передаем в ответ каждого юзера из коллекции
            // переданной в представление "user"
            res.partial('user', users);
        } else {
            // отвечаем полным лэйаутом со страницей списка пользователей
            // шаблон которой внутри себя делает partial('user', users)
            // ну и добавляет какой-то интерфейс
            res.render('users', {
                users: users
            });
        }
    });

### res.local(name[, val]) {#res-local}

Получить или установить заданную локальную переменную. Под локальными переменными в данном случае имеются в виду переменные, передаваемые в методы рендеринга представления, например в `res.render()`.

    app.all('/movie/:id', function(req, res, next) {
        Movie.get(req.params.id, function(err, movie) {
            // Делает присваивание res.locals.movie = movie
            res.local('movie', movie);
        });
    });
    app.get('/movie/:id', function(req, res) {
        // локальная переменная movie уже есть
        // , но мы можем ее дополнить, если нужно
        res.render('movie', {
            displayReviews: true
        });
    });

### res.locals(obj) {#res-locals}

Присвоить несколько локальных переменных с помощью данного объекта `obj`. Следующее эквивалентно:

    res.local('foo', bar);
    res.local('bar', baz);
    res.locals({
        foo: bar,
        bar,
        baz
    });

## Server {#server}

### app.set(name[, val]) {#app-set}

Установить настройку приложение `name` в значение `val`, или получить значение настройки `name`, если `val` отсутствует:

    app.set('views', __dirname + '/views');
    app.set('views');
    // => ...path...

Также можно добраться до настроек через `appsettings`:

    app.settings.views
    // => ...path...

### app.enable(name) {#app-enable}

Устанавливает настройку `name` в `true`: 

    app.enable('some arbitrary setting');
    app.set('some arbitrary setting');
    // => true
    app.enabled('some arbitrary setting');
    // => true

### app.enabled(name) {#app-enabled}

Проверяет, равна ли `true` настройка `name`:

    app.enabled('view cache');
    // => false
    app.enable('view cache');
    app.enabled('view cache');
    // => true

### app.disable(name) {#app-disable}

Установить настройку `name` в `false`:

    app.disable('some setting');
    app.set('some setting');
    // => false
    app.disabled('some setting');
    // => false

### app.disabled(name) {#app-disabled}

Проверяет, равна ли `false` настройка `name`:

    app.enable('view cache');
    app.disabled('view cache');
    // => false
    app.disable('view cache');
    app.disabled('view cache');
    // => true

### app.configure(env|function[, function]) {#app-configure}

Задает коллбэк-функцию `callback` для окружения `env` (или для всех окружений):

    app.configure(function() {
        // выполняется для всех окружений
    });
    app.configure('development', function() {
        // выполняется только для окружения 'development'
    });

### app.redirect(name, val) {#app-redirect}

Для `res.redirect()` мы можем определить сокращения (в области видимости приложения), как показано ниже:

    app.redirect('google', 'http://google.com');

Теперь в маршруте мы можем вызвать:

    res.redirect('google');

Также можно делать динамические сокращения:

    app.redirect('comments', function(req, res) {
        return '/post/' + req.params.id + '/comments';
    });

Теперь можно сделать следующее и редирект динамически построится в соответствие с контекстом запроса. Если мы вызвали маршрут с помощью `GET /post/12`, наш редирект будет `/post/12/comments`.

    app.get('/post/:id', function(req, res) {
        res.redirect('comments');
    });

В случае монтированного приложения `res.redirect()` будет учитывать точку монтирования приложения. Например, если блог-приложение смонтировано в `/blog`, следующий пример сделает редирект в `/blog/posts`:

    res.redirect('/posts');

### app.error(function) {#app-error}

Добавляет функцию-обработчик ошибок, которая первым параметром будет принимать все исключения, как показано ниже. Заметьте, что можно устанавливать несколько обработчиков ошибок, путем нескольких вызовов этого метода, однако метод должен вызывать `next()`, если он не хочет сам обрабатывать исключение:

    app.error(function(err, req, res, next) {
        res.send(err.message, 500);
    });

### app.helpers(obj) {#app-helpers}

Регистрирует статические помощники представлений.

    app.helpers({
        name: function(first, last) {
            return first + ', ' + last
        },
        firstName: 'tj',
        lastName: 'holowaychuk'
    });

Наше представление может теперь пользоваться переменными `firstName` и `lastName` и функцией `name()`.

    <%= name(firstName, lastName) %>

Также Express предоставляет по умолчанию несколько локальных переменных:

 - `settings` - объект настроек приложения
 - `layout(path)` указать лэйаут прямо изнутри представления

Этот метод имеет псевдоним `app.locals()`.

### app.dynamicHelpers(obj) {#app.dynamic-helpers}

Регистрирует динамические помощники представлений. Динамические помощники представлений - это просто функции, принимающие `res`, `req` и выполняемые в контексте экземпляра `Server` перед тем, как отрендерить любое представление. Возвращаемое значение такой функции становится локальной переменной, с которой функция ассоциирована.

    app.dynamicHelpers({
        session: function(req, res) {
            return req.session;
        }
    });

Теперь все наши представления будут иметь доступ к сессии - данные сессии будут доступны на манер `session.name` и т.д.:

    <%= session.name %>

### app.lookup {#app-lookup}

Возвращает обработчики маршрута, связанные с заданным путем `path`.

Допустим, есть такие маршруты:

    app.get('/user/:id', function() {});
    app.put('/user/:id', function() {});
    app.get('/user/:id/:op?', function() {});

Можно использовать функционал `lookup` для проверки того, какие мрашруты заданы. Это может пригодиться для фреймворков более высокого уровня, построенных на Express.

    app.lookup.get('/user/:id');
    // => [Function]
    app.lookup.get('/user/:id/:op?');
    // => [Function]
    app.lookup.put('/user/:id');
    // => [Function]
    app.lookup.all('/user/:id');
    // => [Function, Function]
    app.lookup.all('/hey');
    // => []

Псевдонимом для `app.lookup.HTTP_МЕТОД()` является просто `app.HTTP_МЕТОД()` - без аргумента `callback`. Такое вот сокращение. Например следующее эквивалентно:

    app.lookup.get('/user');
    app.get('/user');

Каждая возвращенная функция дополняется полезными свойствами:

    var fn = app.get('/user/:id/:op?')[0];
    fn.regexp
    // => /^\/user\/(?:([^\/]+?))(?:\/([^\/]+?))?\/?$/i
    fn.keys
    // => ['id', 'op']
    fn.path
    // => '/user/:id/:op?'
    fn.method
    // => 'GET'

### app.match {#app-match}

Возвращает массив коллбэк-функций, срабатывающих на заданный URL, который может содержатьстроку запроса, и т.д. Это может пригодиться, чтобы понять какие маршруты имеют возможность ответить.

Допустим, есть следующие маршруты:

    app.get('/user/:id', function() {});
    app.put('/user/:id', function() {});
    app.get('/user/:id/:op?', function() {});

Вызов `match` для GET вернет две функции, поскольку `:op` в последнем маршруте необязательный параметр.

    app.match.get('/user/1');
    // => [Function, Function]

А следующий вызов вернет только один коллбэк для `/user/:id/:op?`.

    app.match.get('/user/23/edit');
    // => [Function]

Можно использовать и `all()`, если нам не важен HTTP-метод

    app.match.all('/user/20');
    // => [Function, Function, Function]

Каждая функция снабжается следующими свойствами:

    var fn = app.match.get('/user/23/edit')[0];
    fn.keys
    // => ['id', 'op']
    fn.params
    // => { id: '23', op: 'edit' }
    fn.method
    // => 'GET'

### app.mounted(fn) {#app-mounted}

Назначить коллбэк `fn`, который вызывается, когда этот Server передается в `Server.use()`.

    var app = express.createServer(),
        blog = express.createServer();
    blog.mounted(function(parent) {
        //parent  - это app 
        // this - это blog
    });
    app.use(blog);

### app.register(ext, exports) {#app-register}

Ассоциирует заданные экспортируемые свойства (`exports`) шаблонизатора с расширением `ext` файла шаблона.

    app.register('.html', require('jade'));

Также это может пригодиться в случае с библиотеками, имя которых не совпадает в точности с расширением файла шаблона. Живой пример - **Haml.js**, который устанавливается **npm**-ом как `"hamljs"`, а мы можем зарегистрировать его на шаблоны `".haml"`, а не `".hamljs"`, как было бы по умолчанию:

    app.register('.haml', require('haml-js'));

Кроме того `app.register` очень помогает в случае с шаблонизаторами, API которых не соответствует спецификациям Express. В примере ниже мы ассоциируем расширение `.md` с рендерером **markdown**-файлов. Рендерить в HTML будем только первый раз - для большей производительности - и будем поддерживать подстановку переменных вида `"{name}"`.

    app.register('.md', {
        compile: function(str, options) {
            var html = md.toHTML(str);
            return function(locals) {
                return html.replace(/\{([^}]+)\}/g, function(_, name) {
                    return locals[name];
                });
            };
        }
    });

### app.listen(&#91;port&#91;, host&#93;&#93;) {#app-listen}

Биндим сокет сервера `app` к адресу `host:port`. Порт по умолчанию `3000`, хост - `INADDR_ANY`.

    app.listen();
    app.listen(3000);
    app.listen(3000, 'n.n.n.n');

Аргумент `port` может быть также строкой, представляющей собой путь к **unix domain socket**:

    app.listen('/tmp/express.sock');

Теперь попробуем:

    $ telnet /tmp/express.sock
    GET / HTTP/1.1
    HTTP/1.1 200 OK
    Content-Type: text/plain
    Content-Length: 11
    Hello World

## Участники проекта

Основной вклад в проект внесли следующие лица:

 - TJ Holowaychuk (visionmedia)
 - Ciaran Jessup (ciaranj)
 - Aaron Heckmann (aheckmann)
 - Guillermo Rauch (guille)

## Сторонние модули

Следующие модули работают с Express или построены на его основе:

 - [express-resource](http://github.com/visionmedia/express-resource) обеспечивает ресурсную маршрутизацию
 - [express-messages](http://github.com/visionmedia/express-messages) рендеринг всплывающих уведомлений
 - [express-configure](http://github.com/visionmedia/express-configuration) поддержка асинхронной конфигурации (загрузка данных из Redis, и т.д.)
 - [express-namespace](http://github.com/visionmedia/express-namespace) - пространства имен в маршрутах
 - [express-expose](http://github.com/visionmedia/express-expose) простая публикация JS-кода в клиентскую часть приложения
 - [express-params](https://github.com/visionmedia/express-params) - расширения `app.param()`
 - [express-mongoose](https://github.com/LearnBoost/express-mongoose) - плагин для простого рендеринга результатов запросов Mongoose (ORM для MongoDB)

## Прочая информация

 - `#express` на freenode
 - Следите за [tjholowaychuk](http://twitter.com/tjholowaychuk) в Твиттере
 - [Google Group](http://groups.google.com/group/express-js)
 - [Wiki](http://github.com/visionmedia/express/wiki)
 - [日本語ドキュメンテーション](http://hideyukisaito.com/doc/expressjs/) by [hideyukisaito](https://github.com/hideyukisaito)
 - [Русскоязычная документация](http://jsman.ru/express-guide.html)

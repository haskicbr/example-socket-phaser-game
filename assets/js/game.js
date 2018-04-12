SOCKET_SERVER = (function () {
    var port = '777';
    var ip = "127.0.0.1";

    return {
        ip: ip,
        port: port,
        connectionString: "http://" + ip + ":" + port
    }
})();

var gameStructure = function () {

    var sides = {
        EVIL: "EVIL",
        GOOD: "GOOD",
        EVIL_SPRITE: 'reaper',
        GOOD_SPRITE: 'shepard'
    };

    var config = {
        assetsPath: './assets/',
        width: window.innerWidth,
        height: window.innerHeight,
        countX: 5,
        countY: 5,
        fieldMargin: 5,
        playerSide: sides.EVIL
    };

    this.render = function () {

    };

    this.init = function () {

        var game = new Phaser.Game(config.width, config.height, Phaser.CANVAS, 'game', {
            preload: preload,
            create: create,
            update: update,
            render: render
        });

        function preload() {
            game.load.image("background", config.assetsPath + "img/back.jpg");
            game.load.image("shepard", config.assetsPath + "img/shepard.jpg");
            game.load.image("reaper", config.assetsPath + "img/reaper.png");
            game.load.image("trump", config.assetsPath + "img/trump.jpg");
            game.load.audio('backgroundMusic', ['assets/music/background.mp3']);
        }

        function create() {
            var tile = game.add.tileSprite(0, 0, config.width, config.height, "background");
            music = game.add.audio('backgroundMusic');
            music.play();

            createSelectSide();
        }

        function createSelectSide() {
            var good = game.add.sprite(window.innerWidth / 2 + 60, 20, sides.GOOD_SPRITE, 64);
            var evil = game.add.sprite(window.innerWidth / 2, 20, sides.EVIL_SPRITE, 64);

            good.side = sides.GOOD;
            evil.side = sides.EVIL;

            function destroyIntro(sprite) {

                config.playerSide = sprite.side;

                userName = 'user' + (new Date).getTime();
                socket = io(SOCKET_SERVER.connectionString, {query: "user=" + userName + "&side=" + config.playerSide});
                socket.connect(SOCKET_SERVER.connectionString, {query: "user=" + userName + "&side=" + config.playerSide});

                good.destroy();
                evil.destroy();
                createLevel(config.countX, config.countY);

                socket.on('connect', function (data) {
                    console.log('socket.connect')
                });
            }

            addDownEvent(evil, function (evil) {
                destroyIntro(evil);
            });
            addDownEvent(good, function (good) {
                destroyIntro(good);
            });
        }

        function render() {

        }

        function update() {

        }

        function addDownEvent(sprite, callback) {

            if (!sprite.inputEnabled) {
                sprite.inputEnabled = true;
            }
            sprite.events.onInputDown.add(function () {

                console.log(sprite.fields);

                callback(sprite)
            });

            return sprite;
        }


        function compareResult() {

            var allResults = {
                data: []
            };

            var maxX = config.countX;
            var maxY = config.countY;

            for (var x = 0; x < maxX; x++) {

                var curResults = allResults.data[allResults.data.length] = [];

                for (var y = 0; y < maxY; y++) {
                    curResults.push(gameSprites[y][x].side);
                }

                var curResults = allResults.data[allResults.data.length] = [];

                for (var y = 0; y < maxY; y++) {
                    curResults.push(gameSprites[x][y].side);
                }
            }
            console.log(allResults.data)

            allResults.data.map(function (e) {
                if (e.indexOf(sides.GOOD) >= 0 && e.indexOf(undefined) < 0 && e.indexOf(sides.EVIL) < 0) {
                    alert('GOOD WIN!');
                    socket.disconnect();
                }

                if (e.indexOf(sides.EVIL) >= 0 && e.indexOf(undefined) < 0 && e.indexOf(sides.GOOD) < 0) {
                    alert('EVIL WIN!');
                    socket.disconnect();
                }
            });
        }

        function createLevel(countX, countY) {

            gameSprites = [];

            var mrg = config.fieldMargin;

            for (var x = 0; x < countX; x++) {
                gameSprites[x] = [];

                for (var y = 0; y < countY; y++) {
                    item = game.add.sprite(90 + x * 64 + x * mrg, 90 + mrg * y + y * 64, 'trump', 64);

                    item.fields = {
                        x: x,
                        y: y
                    };

                    gameSprites[x][y] = item;

                    addDownEvent(item, function (sprite) {
                        socket.emit('clickPoint', Object.assign(sprite.fields, {side: config.playerSide}))
                    });
                }
            }

            socket.on('clickPoint', function (params) {

                if (params.side === sides.EVIL) {
                    spriteTexture = 'reaper';
                } else if (params.side === sides.GOOD) {
                    spriteTexture = 'shepard';
                } else {
                    spriteTexture = 'trump';
                }

                var sprite = gameSprites[params.x][params.y];

                sprite.loadTexture(spriteTexture);
                sprite.side = params.side;


                compareResult();
            });

            socket.on('msg', function (params) {
                var msg = params.msg;
                alert(msg);
            })
        }
    };

    this.init();
};


window.addEventListener('load', function () {
    new gameStructure()
});
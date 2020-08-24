var game;
var gameOptions = {
    bounceHeight: 300,
    ballGravity:1200,
    ballPower: 1200,
    obstacleSpeed: 250,
    obstacleDistanceRange: [200, 450],
    localStorageName: 'bestballscore'
}



function print(text){
  console.log(text);
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x87ceeb,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'thegame',
            width: 750,
            height: 500
        },
        physics: {
            default: 'arcade'
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    print("game created")
    window.focus();
}
class playGame extends Phaser.Scene{
    constructor(){
        super('PlayGame');
    }
    preload(){
        this.load.image('ground', 'assets/images/ground.png');
        this.load.image('ball', 'assets/images/ball.png');
        this.load.image('obstacle', 'assets/images/obstacle.png');
    }
    create(){

        this.firstBounce = 0;  //rebound velocity on first bounce

        // add ground
        this.ground = this.physics.add.sprite(game.config.width / 2, game.config.height / 4 * 3, 'ground');
        this.ground.setImmovable(true);

        // add ball
        this.ball = this.physics.add.sprite(game.config.width / 10 * 2, game.config.height / 4 * 3 - gameOptions.bounceHeight, 'ball');
        this.ball.body.gravity.y = gameOptions.ballGravity;
        this.ball.setBounce(1);
        this.ball.setCircle(25);

        // to create obstacles
        this.obstacleGroup = this.physics.add.group();
        let obstacleX = game.config.width;
        for(let i = 0; i < 2; i++){
            let obstacle = this.obstacleGroup.create(obstacleX, this.ground.getBounds().top, 'obstacle');
            obstacle.setOrigin(0.5, 1);
            obstacle.setImmovable(true);
            obstacleX += Phaser.Math.Between(gameOptions.obstacleDistanceRange[0], gameOptions.obstacleDistanceRange[1])
        }
        this.obstacleGroup.setVelocityX(-gameOptions.obstacleSpeed);

        // read game inputs
        this.input.on('pointerdown', this.boost, this);

        // track score
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);
    }
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }
    boost(){
        if(this.firstBounce != 0){
            this.ball.body.velocity.y = gameOptions.ballPower;
        }
    }
    getRightmostObstacle(){
        let rightmostObstacle = 0;
        this.obstacleGroup.getChildren().forEach(function(obstacle){
            rightmostObstacle = Math.max(rightmostObstacle, obstacle.x);
        });
        return rightmostObstacle;
    }
    update(){
        this.physics.world.collide(this.ground, this.ball, function(){
            if(this.firstBounce == 0){
              console.log("in the first-bounce if statement")
                this.firstBounce = this.ball.body.velocity.y;
            }
            else{
                this.ball.body.velocity.y = this.firstBounce;
            }
        }, null, this);
        this.physics.world.collide(this.ball, this.obstacleGroup, function(){
            localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
            this.scene.start('PlayGame');
        }, null, this);
        this.obstacleGroup.getChildren().forEach(function(obstacle){
            if(obstacle.getBounds().right < 0){
                this.updateScore(1);
                obstacle.x = this.getRightmostObstacle() + Phaser.Math.Between(gameOptions.obstacleDistanceRange[0], gameOptions.obstacleDistanceRange[1]);
            }
        }, this)
    }
}

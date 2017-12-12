/********************************
*********Game Loop Code**********
********************************/
var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };


window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};


var step = function() {
  update();
  render();
  animate(step);
};

var update = function() {
  map.update();
};

var render = function() {
  map.render();
};


/********************************
*********Game Object Code********
********************************/

//-----------Cell-----------
var blank = 'b';
var tower = 't';
var start = 's';
var end   = 'e';

var up    = 'u';
var down  = 'd';
var left  = 'l';
var right = 'r';
var none  = 'n';
var final = 'f';

class Cell {
  constructor(row, col, size, type) {
    this.row = row;
    this.col = col;
    this.size = size;
    this.type = type;
    //TODO: should start as none on constructor, wiped to none before pathfinding, set in pathfinding
    /*var dirVal = Math.floor(Math.random()*4) + 1;
    if(dirVal == 1)this.next = down;
    if(dirVal == 2)this.next = left;
    if(dirVal == 3)this.next = up;
    if(dirVal == 4)this.next = right;*/
    this.next = down;
  }

  render(){
    if(this.type == tower){
      context.fillStyle = "#FFFFAA";
    } else if(this.type == blank) {
      context.fillStyle = "#AAFFFF";
    } else if(this.type == start){
      context.fillStyle = "#00FF00";
    } else if(this.type == end || this.type==final){
      context.fillStyle = "#FF0000"
    }
    context.fillRect(this.col*this.size, this.row*this.size, this.size, this.size);
    if(this.type == final){
      context.beginPath();
      context.moveTo(this.col*this.size, this.row*this.size);
      context.lineTo((this.col+1)*this.size, (this.row+1)*this.size);
      context.stroke();
      context.beginPath();
      context.moveTo((this.col+1)*this.size, this.row*this.size);
      context.lineTo(this.col*this.size, (this.row+1)*this.size);
      context.stroke();
      context.beginPath();
      context.moveTo(this.col*this.size, this.row*this.size);
      context.lineTo(this.col*this.size, (this.row+1)*this.size);
      context.stroke();
    }
  }
}

//-----------Map------------
class Map{
  constructor(width, height, cellSize) {
    this.width = width/cellSize;
    this.height = height/cellSize;
    this.cellSize = cellSize;
    this.creepUpperBound = 3*cellSize/4;
    this.creepLowerBound = cellSize/4;
    this.creeps = [];
    this.grid = [];
    for(var i = 0; i < this.height; i++){
      this.grid[i] = [];
      for(var j = 0; j < this.width; j++){
        this.grid[i][j] = new Cell(i, j, cellSize, blank);
      }
    }
    for(var i = 0; i < this.width; i++){
      this.grid[0][i].type = start;
      this.grid[this.height-1][i].type = end;
      this.grid[this.height-1][i].next = right;
    }
    this.grid[this.height-1][this.width-1].type = final;
    this.grid[this.height-1][this.width-1].next = none;
  }

  render(){
    for(var i = 0; i < this.height; i++){
      for(var j = 0; j < this.width; j++){
        this.grid[i][j].render();
      }
    }
    for(var i = 0; i <= this.width; i++){
      context.beginPath();
      context.moveTo(i*this.cellSize, cellSize);
      context.lineTo(i*this.cellSize, (this.height-1)*this.cellSize);
      context.stroke();
    }
    for(var i = 1; i <= this.height-1; i++){
      context.beginPath();
      context.moveTo(0, i*this.cellSize);
      context.lineTo(this.width*this.cellSize, i*this.cellSize);
      context.stroke();
    }
    for(var i = 0; i < this.creeps.length; i++){
      this.creeps[i].render();
    }
  }

  update(){
    for(var i = 0; i < this.creeps.length; i++){
      this.creeps[i].update();
    }
  }

  selectCell(x, y){
    var gridX = Math.floor(x/this.cellSize);
    var gridY = Math.floor(y/this.cellSize);
    return this.grid[gridY][gridX];
  }

  buildTower(cell){
    //TODO: try to update pathfind here, make sure building it is legal (pathfind is successful), if not alert/return
    if(cell.type == blank){
      cell.type = tower;
    }
  }

  sellTower(cell){
    if(cell.type == tower){
      cell.type = blank;
    }
  }

  spawnCreep(){
    //spawns creep in random position towards center of a starting cell
    var x = (Math.floor(Math.random()*this.width) * this.cellSize) + (Math.random()*(this.creepUpperBound - this.creepLowerBound) + this.creepLowerBound);
    var y = (Math.random()*(this.creepUpperBound - this.creepLowerBound) + this.creepLowerBound);
    var creep = new Creep(x, y, 3);
    this.creeps.push(creep);
    return creep;
  }
}

//-----------Creep----------

class Creep{
  constructor(x, y, radius){
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.radius = radius;
    this.dir = none;
    this.dist = 0;
  }

  render(){
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#880088";
    context.fill();
  }

  move(){
    var diff = this.dist - this.speed;
    if(this.dir == up){
      if(diff < 0){
        this.y -= this.dist;
        this.dir = none;
        this.dist = 0;
      } else{
        this.y -= this.speed;
        this.dist = diff;
      }
    }
    else if(this.dir == down){
      if(diff < 0){
        this.y += this.dist;
        this.dir = none;
        this.dist = 0;
      } else{
        this.y += this.speed;
        this.dist = diff;
      }
    }
    else if(this.dir == left){
      if(diff < 0){
        this.x -= this.dist;
        this.dir = none;
        this.dist = 0;
      } else{
        this.x -= this.speed;
        this.dist = diff;
      }
    }
    else if(this.dir == right){
      if(diff < 0){
        this.x += this.dist;
        this.dir = none;
        this.dist = 0;
      } else{
        this.x += this.speed;
        this.dist = diff;
      }
    }
  }

  update(){
    if(this.dir == none){
      var currCell = map.selectCell(this.x, this.y)
      if(currCell.type != final){
        this.dir = currCell.next;
        this.dist = map.cellSize;
        this.move();
      } else {
        //TODO: destruct creep, remove from list, decrease player lives
      }
    } else {
      this.move();
    }
  }
}



/********************************
***********Driver Code***********
********************************/
var canvas = document.createElement('canvas');
var width = 450;
var height = 600;
var cellSize = 50;
canvas.width = width;
canvas.height = height;
canvas.style.cssText = "border:2px solid #000000;";
var context = canvas.getContext('2d');

//note: width and height must both be divisible by cellSize
var map = new Map(width, height, cellSize);

canvas.onclick = function(e){
  x = e.clientX - canvas.offsetLeft;
  y = e.clientY - canvas.offsetTop;
  selectedCell = map.selectCell(x,y);
  map.buildTower(selectedCell);
  e.preventDefault();
  return false;
};

canvas.oncontextmenu = function(e) {
  x = e.clientX - canvas.offsetLeft;
  y = e.clientY - canvas.offsetTop;
  selectedCell = map.selectCell(x,y);
  map.sellTower(selectedCell);
  e.preventDefault();
  return false; 
}

window.addEventListener("keydown", function(event) {
  if(event.keyCode == 83){
    map.spawnCreep();
  }
});
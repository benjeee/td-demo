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
  constructor(x, y, size, type) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = type;
    this.next = none;
    this.prev = none;
    this.turret = none;
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
    context.fillRect(this.x*this.size, this.y*this.size, this.size, this.size);
    if(this.type == final){
      context.beginPath();
      context.moveTo(this.x*this.size, this.y*this.size);
      context.lineTo((this.x+1)*this.size, (this.y+1)*this.size);
      context.stroke();
      context.beginPath();
      context.moveTo((this.x+1)*this.size, this.y*this.size);
      context.lineTo(this.x*this.size, (this.y+1)*this.size);
      context.stroke();
      context.beginPath();
      context.moveTo(this.x*this.size, this.y*this.size);
      context.lineTo(this.x*this.size, (this.y+1)*this.size);
      context.stroke();
    }
  }
}

//----------Turret----------
var splash  = 's'
var gun     = 'g'

class Turret{
  constructor(type, x, y){
    this.type = type;
    this.x = x;
    this.y = y;
  }

  render(){
    
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
    for(var i = 0; i < this.width; i++){
      this.grid[i] = [];
      for(var j = 0; j < this.height; j++){
        this.grid[i][j] = new Cell(i, j, cellSize, blank);
      }
    }
    for(var i = 0; i < this.width; i++){
      this.grid[i][0].type = start;
      this.grid[i][this.height-1].type = end;
      //this.grid[i][this.height-1].next = right;
    }
    this.grid[this.width-1][this.height-1].type = final;
    this.grid[this.width-1][this.height-1].next = none;
  }

  render(){
    for(var i = 0; i < this.width; i++){
      for(var j = 0; j < this.height; j++){
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
    return this.grid[gridX][gridY];
  }

  doSearch(){
    var found = false;

    for(var i = 0; i < this.width; i++){
      for(var j = 0; j < this.height; j++){
        this.grid[i][j].next = none;
      }
    }

    var queue = [];
    queue.push(this.grid[this.width-1][this.height-1]);

    while(queue.length != 0){
      var curr = queue.shift();
      console.log(curr);
      if(curr.x > 0){
        var cand = this.grid[curr.x-1][curr.y];
        if(cand.type != tower && cand.next == none){
          cand.next = right;
          queue.push(cand);
          if(cand.type == start){
            found = true;
          }
        }
      }
      if(curr.x < this.width - 1){
        var cand = this.grid[curr.x+1][curr.y];
        if(cand.type != tower && cand.next == none){
          cand.next = left;
          queue.push(cand);
          if(cand.type == start){
            found = true;
          }
        }
      }
      if(curr.y > 0){
        var cand = this.grid[curr.x][curr.y-1];
        if(cand.type != tower && cand.next == none){
          cand.next = down;
          queue.push(cand);
          if(cand.type == start){
            found = true;
          }       
        }
      }
      if(curr.y < this.height - 1){
        var cand = this.grid[curr.x][curr.y+1];
        if(cand.type != tower && cand.next == none){
          cand.next = up;
          queue.push(cand);
          if(cand.type == start){
            found = true;
          }
        }
      }
    }
    return found;
  }

  creepInCell(cell){
    for(var i = 0; i < this.creeps.length; i++){
      var currCreep = this.creeps[i];
      var creepCell = this.selectCell(currCreep.x, currCreep.y);
      if(creepCell.x == cell.x && creepCell.y == cell.y) return true;
    }
    return false;
  }

  buildTower(cell){
    //TODO: try to update pathfind here, make sure building it is legal (pathfind is successful), if not alert/return
    if(cell.type == blank){
      if(!this.creepInCell(cell)){
        cell.type = tower;
        var valid = this.doSearch();
        console.log(valid);
        if(!valid) {
          cell.type = blank;
          this.doSearch();
        } else {
          cell.type = tower;
        }
      }
    }
  }

  sellTower(cell){
    if(cell.type == tower){
      this.doSearch();
      cell.type = blank;
    }
  }

  spawnCreep(){
    //spawns creep in random position towards center of starting cell
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
    this.speed = 2;
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
      this.moveHelp(diff, 'y', -1);
    }
    else if(this.dir == down){
      this.moveHelp(diff, 'y', 1);
    }
    else if(this.dir == left){
      this.moveHelp(diff, 'x', -1);
    }
    else if(this.dir == right){
      this.moveHelp(diff, 'x', 1);
    }
  } 

  moveHelp(diff, axis, flip){
    if(diff < 0){
      if(axis == 'y'){
        this.y += flip * this.dist;
      } else {
        this.x += flip * this.dist;
      }
      this.dir = none;
      this.dist = 0;
    } else{
      if(axis == 'y'){
        this.y += flip*this.speed;
      } else {
        this.x += flip*this.speed;
      }
      this.dist = diff;
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
map.doSearch();

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
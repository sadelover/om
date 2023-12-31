
function Drag(id) {
	var _this = this;
	this.disX = 0;
	this.disY = 0;
	this.oDiv = document.querySelector(id);
	// this.oDiv = document.getElementsByClassName(id)[0];
	this.oDiv.onmousedown = function () {
		_this.fnDown();
		return false;	
	};
};

Drag.prototype.fnDown = function(e) {
	let ProcessNode = document.getElementById("observerProcessSliderView")
	if(ProcessNode){
		return
	}
	var oEvent = e || event;
	var _this = this;
	this.disX = oEvent.clientX - this.oDiv.offsetLeft;
	this.disY = oEvent.clientY - this.oDiv.offsetTop;

	document.onmousemove = function () {
		_this.fnMove();
	};
	document.onmouseup = function () {
		_this.fnUp();
	};
};		

Drag.prototype.fnMove = function(e) {
	var oEvent = e || event;
	this.oDiv.style.left = oEvent.clientX - this.disX + 'px';
	this.oDiv.style.top = oEvent.clientY - this.disY + 'px';
};

Drag.prototype.fnUp = function() {
	document.onmousemove = null;
	document.onmouseup = null;
};		

export default Drag;


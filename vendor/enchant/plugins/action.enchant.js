/**
 * @fileOverview
 * action.enchant.js
 * @version 0.1 (2015/03/08)
 * @requires enchant.js v0.4.0 or later
 * @author Yoshito Imai
 *
 * @description
 * Action Game plugin for enchant.js
 *
 * @example
 */

/**
 * action namespace object
 * @type {Object}
 */
enchant.action = {};

/**
 * Action Game
 * Base class of enchant.Action
 * @scope enchant.action.Action.prototype
 */
enchant.action.ActionSprite = enchant.Class.create(enchant.Sprite, {
	/**
	 * Constructor of Action
	 * @param {String} imagePath
	 * @param {Integer} width
	 * @param {Integer} height
	 */
	initialize: function(imagePath, width, height){
		enchant.Sprite.call(this, width, height);
		this.image = core.assets[imagePath];
		this.collision;
		this.speed = 1;
		this.map;
		this.rect;
		this.scrollMap;
		// gravity
		this.gravity = 0;
		// move
		this.moveX = 0;
		this.moveY = 0;
		// acceleration
		this.accelerationX = 0;
		this.accelerationY = 0;
		// velocity
		this.velocityX = 0;
		this.velocityY = 0;
		this.collisionTarget = new Array();

		this.addEventListener('enterframe', function(){
			// if (this.moveX != 0) this.velocityX = this.moveX;
			// if (this.moveY != 0) this.velocityY = this.moveY;
			if (this.accelerationY == 0 && this.velocityY == 0) {
				this.velocityX = this.moveX;
				this.velocityY = this.moveY;
			}
			// collision Map
			if (this.map instanceof Map) {
				// collision left
				if (this._judgeCollisionLeft()) {
					this.dispatchEvent(new Event('collisionmap'));
					if (this.velocityX < 0) this.velocityX = 0;
				}
				// collision right
				if (this._judgeCollisionRight()) {
					this.dispatchEvent(new Event('collisionmap'));
					if (this.velocityX > 0) this.velocityX = 0;
				}
				// collision top
				if (this._judgeCollisionTop()) {
					this.dispatchEvent(new Event('collisionmap'));
					if (this.velocityY < 0) this.velocityY = 0;
					if (this.accelerationY < 0) this.accelerationY = 0;
				}
				// collision bottom
				if (this._judgeCollisionBottom()) {
					this.dispatchEvent(new Event('collisionmap'));
					if (this.velocityY > 0) this.velocityY = 0;
					if (this.accelerationY > 0) this.accelerationY = 0;
				} else {
					// gravity
					if (this.gravity > 0) {
						this.accelerationY += this.gravity;
					}
				}
				this.velocityY += this.accelerationY;
				// judge move
				var absVelocityX = Math.abs(this.velocityX);
				var absVelocityY = Math.abs(this.velocityY);
				var maxVelocity = Math.max(absVelocityX, absVelocityY);
				var absX = this.velocityX < 0 ? -1 : 1;
				var absY = this.velocityY < 0 ? -1 : 1;
				for (var i = 0; i <= maxVelocity; i++) {
					var x = Math.ceil(i * absVelocityX / maxVelocity) * absX;
					var y = Math.ceil(i * absVelocityY / maxVelocity) * absY;
					// judge collision left
					if (x < 0) {
						if (this._judgeCollisionLeft(x, y)) {
							this.velocityX = x;
							this.velocityY = y;
							break;
						}
					// judge collision right
					} else if (x > 0) {
						if (this._judgeCollisionRight(x, y)) {
							this.velocityX = x;
							this.velocityY = y;
							break;
						}
					}
					// judge collision top
					if (y < 0) {
						if (this._judgeCollisionTop(x, y)) {
							this.velocityX = x;
							this.velocityY = y;
							break;
						}
					// judge collision bottom
					} else if (y > 0) {
						if (this._judgeCollisionBottom(x, y)) {
							this.velocityX = x;
							this.velocityY = y;
							break;
						}
					}
				};
			}
			// collision Sprite
			if (this.collision) {
				if (this.collision instanceof Sprite) {
					// if (this.intersect(this.collision)) {
					if (this.hitTestTarget(this.collision)) {
						// this.dispatchEvent(new Event('collision'));
						this.dispachCollision(this.collision);
					}
				}
				if (this.collision instanceof Group) {
					for (var i = 0; i < this.collision.childNodes.length; i++) {
						if (this.collision.childNodes[i] instanceof Sprite) {
							// if (this.intersect(this.collision.childNodes[i])) {
							if (this.hitTestTarget(this.collision.childNodes[i])) {
								this.dispachCollision(this.collision.childNodes[i]);
								// this.dispatchEvent(new Event('collision'));
							}
						}
					}
				}
			}
			// move
			this.x += this.velocityX;
			this.y += this.velocityY;
			// sroll
			if (this.map instanceof Map) {
				if (this.scrollMap.top && this.velocityY < 0) {
					if (this.y + this.map.parentNode.y < this.scrollMap.top) {
						this.map.parentNode.y = this.scrollMap.top - this.y;
					}
				}
				if (this.scrollMap.bottom && this.velocityY > 0) {
					if (this.y + this.map.parentNode.y > this.scrollMap.bottom) {
						this.map.parentNode.y = this.scrollMap.bottom - this.y;
					}
				}
				if (this.scrollMap.left && this.velocityX > 0) {
					if (this.x + this.map.parentNode.x > this.scrollMap.left) {
						this.map.parentNode.x = this.scrollMap.left - this.x;
					}
				}
				if (this.scrollMap.right && this.velocityX > 0) {
					if (this.x + this.map.parentNode.x > this.scrollMap.right) {
						this.map.parentNode.x = this.scrollMap.right - this.x;
					}
				}
			}

		});
	},
	jump: function(acceleration) {
		if (this.accelerationY == 0) {
			this.accelerationY = acceleration * (-1);
		}
	},
	stop: function() {
		this.moveX = 0;
		this.moveY = 0;
	},
	moveLeft: function() {
		this.moveX = this.speed * (-1);
		this.moveY = 0;
	},
	moveRight: function() {
		this.moveX = this.speed;
		this.moveY = 0;
	},
	moveTop: function() {
		this.moveX = 0;
		this.moveY = this.speed * (-1);
	},
	moveBottom: function() {
		this.moveX = 0;
		this.moveY = this.speed;
	},
	hitTest: function(x, y) {
		var target = {};
		target.x = this.x + this.width / 2 - this.width / 2 * this.scaleX;
		target.y = this.y + this.height / 2 - this.height / 2 * this.scaleY;
		target.width = this.width * this.scaleX;
		target.height = this.height * this.scaleY;
		if (this.rect) {
			target.x += this.rect.x * this.scaleX;
			target.y += this.rect.y * this.scaleY;
			target.width = this.rect.width * this.scaleX;
			target.height = this.rect.height * this.scaleY;
		}
		if (x >= target.x && x <= target.x + target.width &&
			y >= target.y && y <= target.y + target.height) {
			return true;
		}
		return false;
	},
	hitTestTarget: function(target) {
		var judgeCollision = function(target1, target2) {
			var target = target1.getTarget();
			// TopLeft
			if (target2.hitTest(target.x, target.y)) {
				return true;
			}
			// TopRight
			if (target2.hitTest(target.x + target.width * target.scaleX, target.y)) {
				return true;
			}
			// BottomLeft
			if (target2.hitTest(target.x, target.y + target.height * target.scaleY)) {
				return true;
			}
			// BottomRight
			if (target2.hitTest(target.x + target.width * target.scaleX, target.y + target.height * target.scaleY)) {
				return true;
			}
		};
		// judgeCollision
		if (judgeCollision(this, target)) {
			return true;
		}
		if (judgeCollision(target, this)) {
			return true;
		}
		return false;

	},
	getTarget: function() {
		var target = {};
		target.x = this.x;
		target.y = this.y;
		target.width = this.width;
		target.height = this.height;
		target.scaleX = this.scaleX;
		target.scaleY = this.scaleY;
		if (this.rect) {
			target.x += this.rect.x;
			target.y += this.rect.y;
			target.width = this.rect.width;
			target.height = this.rect.height;
		}
		return target;
	},
	_judgeCollisionLeft: function(x, y) {
		x = x || 0;
		y = y || 0;
		var target = this.getTarget();
		target.x += x;
		target.y += y;
		var collision = false;
		if (this.map instanceof Map) {
			if (this.map.hitTest(target.x - 1, target.y) ||
				this.map.hitTest(target.x - 1, target.y + target.height)
			){
				collision = true;
			}
		}
		return collision;
	},
	_judgeCollisionRight: function(x, y) {
		x = x || 0;
		y = y || 0;
		var target = this.getTarget();
		target.x += x;
		target.y += y;
		var collision = false;
		if (this.map instanceof Map) {
			if (this.map.hitTest(target.x + target.width + 1, target.y) ||
				this.map.hitTest(target.x + target.width + 1, target.y + target.height)
			){
				collision = true;
			}
		}
		return collision;
	},
	_judgeCollisionTop: function(x, y) {
		x = x || 0;
		y = y || 0;
		var target = this.getTarget();
		target.x += x;
		target.y += y;
		var collision = false;
		if (this.map instanceof Map) {
			if (this.map.hitTest(target.x, target.y - 1) ||
				this.map.hitTest(target.x + target.width, target.y - 1)
			){
				collision = true;
			}
		}
		return collision;
	},
	_judgeCollisionBottom: function(x, y) {
		x = x || 0;
		y = y || 0;
		var target = this.getTarget();
		target.x += x;
		target.y += y;
		var collision = false;
		if (this.map instanceof Map) {
			if (this.map.hitTest(target.x, target.y + target.height + 1) ||
				this.map.hitTest(target.x + target.width, target.y + target.height + 1)
			){
				collision = true;
			}
		}
		return collision;
	},
	dispachCollision: function(target) {
		var existCount = this.collisionTarget.indexOf(target);
		var alreadyCollisioned;
		if (existCount < 0) {
			alreadyCollisioned = false;
		} else {
			alreadyCollisioned = true;
		}
		this.collisionTarget.push(target);
		var e = new Event('collision');
		e.collisionTarget = target;
		e.alreadyCollisioned = alreadyCollisioned;
		this.dispatchEvent(e);
	},
	remove: function() {
		if (this.parentNode) {
			this.parentNode.removeChild(this);
			var e = new Event('removed');
			this.dispatchEvent(e);
		}
	}
});

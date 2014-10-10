/*function Snake() {
	this.length = 5;

	this.show_length = function() {
		alert(this.length);
	}
}

var snake = new Snake;
*/

var snake = (function(){
	var _t = this;
	var limb_size = 30;
	var starting_point = [0, 0];

	var field_width = 800;
	var field_height = 600;
	
	
	// var $head = $("#snake_head"); can't manipulate it later dunno why
	
	var interval;
	var speed = 50;
	var score_total = 0;
	var score_actual_level = 0;
	
	
	var hasTail = false;	
	var keyReady = true;
	
	var turning_points = [];
	/*
	var turning_points = [
		left_top => direction
		5_3 => "top",
		2_6 => "left"
	];
	*/
	var limbs = [];
	var obstacles = [];
	var grower_food = ""; // string x_y to check later if head steps on grower food
	var grower_food_score_value = 1; // 1 point for eating 1 grower food
	var bonus_food = ""; // string x_y to check later if head steps on bonus food
	var bonus_food_score_value = 1;
	
	var levels = []; // holds functions defining each level
	var actual_level = 0;	
	var game_stopped = false;
	var limbs_to_get = 15;
	var limbs_got = 0;
	var bonus = 0;
	var bonus_food_timeout = [7, 5];
	var bonus_appearance_timeout_obj;
	var bonus_delay_timeout_obj;
	
	var survival_mode = 0; // int, tells how many second survival will last, if 0, survival mode is disabled
	var survival_time = 90;
	var survival_snake_limbs = 10;
	
	var untouchable = []; // fields where will be added no grower food or bonus food

	return {
		"fetch_size" : function() {
			console.log("Field size is: " + field_width + "x" + field_height);
		},
		
		"set_limb_size":function(s){
			limb_size = s;
		},		
				
		"try_configuration":function(conf_obj){
			if (typeof(conf_obj.width) === "undefined" || typeof(conf_obj.height) === "undefined") {
				return "not enough data";
			}
			var width = conf_obj.width;
			var height = conf_obj.height;
			var width_margins = [10,10];
			var height_margins = [10,10];
			
			if (typeof(conf_obj.width_margins) !== "undefined") {
				width_margins = conf_obj.width_margins; 
			}
			if (typeof(conf_obj.height_margins) !== "undefined") {
				height_margins = conf_obj.height_margins;
			}
			
						
			var give_results = function(major_param, major_param_value, minor_param_value, major_param_margins, minor_param_margins) {
				var major_starts = major_param_value - major_param_margins[1];
				var major_stops = major_param_value + major_param_margins[0];
				
				var minor_starts = minor_param_value - minor_param_margins[1];
				var minor_stops = minor_param_value + minor_param_margins[0];
				
				var results = new Array();
				
				for (var i = major_starts; i < major_stops + 1; i++) {
					for (var f = 40; f > 29; f--) {
						if (i % f === 0) {
							var ls = i / f;
							for (var j = minor_starts; j < minor_stops + 1; j++) {
								if (j % ls === 0) {
									var result = "";
									if (major_param === "width") {
										result = i + "x" + j + ": " + ls;
									}
									else {
										result = j + "x" + i + ": " + ls;
									}
									results.push(result);
								}
							}
						}
					}
				}
				
				return results;
			};
			
			var major_param;
			if (width > height) {
				major_param = "width";
				return give_results(major_param, width, height, width_margins, height_margins);				
			}
			else {
				major_param = "height";
				return give_results(major_param, height, width, height_margins, width_margins);	
			}

		},
		/**
		 *	@width - integer [px]
		 *	@height - int [px]
		 *	@ls - int [px]
		 *	@levs - array with JSON Objects
		 *
		 */
		"configure" : function(width, height, ls, levs) {			
			field_width = width;
			field_height = height;
			limb_size = ls;
			levels = levs;
			console.log("Lvs length = " + levels.length);
			$("#snake_game_field").css({width: field_width, height: field_height});
		},

		"pause_game" : function() {
			// $("#snake_pause_button").blur();
			$("#snake_pause_button").attr("disabled", "disabled");
			$("#snake_resume_button").removeAttr("disabled");
			clearInterval(interval);
			$("body").unbind("keydown");			
			$("#snake_resume_button").focus();
		},

		"resume_game" : function() {
			$("#snake_resume_button").blur();
			$("#snake_resume_button").attr("disabled", "disabled");
			$("#snake_pause_button").removeAttr("disabled");

			interval = setInterval(this.move_head, speed);
			this.add_key_binds();
			$("#snake_game_field").focus();
		},

		"start_game" : function(){
			//$("div#snake_head, div#snake_game_field > div.snake_limb").remove();
		
		
			$("#snake_start_button").blur();
			$("#snake_start_button").attr("disabled", "disabled");
			$("#snake_stop_button").removeAttr("disabled");
			$("#snake_pause_button").removeAttr("disabled");
			$("#snake_game_field").html("<div id=\"snake_head\"></div>");
			var $head = $("div#snake_head");
			$head.css({"left" : starting_point[0] * limb_size, "top" : starting_point[1] * limb_size, "visibility" : "visible", "width":limb_size, "height":limb_size});
			$head.attr("direction","right");					
			//$head.attr({"direction" : "right", "costam" : "leszcze"});
			
			hasTail = false;
			for (var i in levels[actual_level]) {
				var args = levels[actual_level][i];
				this[i].apply(this, args);
			}
			this.add_key_binds();
			interval = setInterval(this.move_head, speed);
			
			if (survival_mode) {
				setTimeout(function(){survival_mode = 0;}, survival_snake_limbs * speed);
				
			}
			else {
				this.add_new_food(1);
			}
			if (bonus) {
				this.regenerate_bonus_food(); // func. regenerates but is also sufficient to generate				
			}
			game_stopped = false;
			/*
			hasTail = false;
			grower_food = "";
			this.add_new_grower_food();
			game_stopped = false;
			turning_points = [];
			limbs = [];
			obstacles = [];
			*/
			
			$("#snake_pause_button").focus();
		},

		"stop_game" : function() {
			game_stopped = true;
			clearInterval(interval);
			clearTimeout(bonus_appearance_timeout_obj);
			clearTimeout(bonus_delay_timeout_obj);
			$("#snake_stop_button").attr("disabled", "disabled");
			$("#snake_start_button").removeAttr("disabled");
			$("#snake_pause_button").attr("disabled", "disabled");
			$("#snake_resume_button").attr("disabled", "disabled");
			
			grower_food = "";
			turning_points = [];
			obstacles = [];
			limbs = [];
			untouchable = [];
			
			limbs_got = 0;
			$("body").unbind("keydown");			
			//alert("You loose. Your score is: " + score_total);	
			
			$("#snake_start_button").focus();
		},
		
		"level_fail" : function() {
			this.stop_game();
			alert("You've lost");
			return;
		},
		
		"level_complete" : function() {
			this.stop_game();
			score_total += score_actual_level;
			
			if (actual_level === levels.length - 1) {
				alert("Congratulations! You've completed all the levels!\nYour final score is: " + score_total);
				actual_level = 0;
			}
			else {
				if(confirm("Congratulations! Level Completed; Your score for that level is: " + score_actual_level + "\nAnd for whole game till now: " + score_total + "\nProceed to next level?")){
					this.start_game();
				}
				score_actual_level = 0;
				actual_level++;
			}
		},

		"move_head" : function() {
			keyReady = true; // new interval so allow to ...
			if (game_stopped) {return;} // why proceeding to below checking if game is stopped			
			var $head = $("div#snake_head");
			var top = parseInt($head.css("top")); // css("top") gives "280px", alternatevly $head.position().top gives 280;
			var left = parseInt($head.css("left"));
			var direction = $head.attr("direction");
			
			var next_left = left, next_top = top;
			
			switch (direction) {

				case "up":
				var next_top = top - limb_size;
				if (next_top < 0) { snake.level_fail();}
				else { $head.css("top", next_top); }
				break;

				case "right":
				var next_left = left + limb_size;
				if (next_left === field_width) { snake.level_fail(); }
				else { $head.css("left", next_left); }
				//console.log("Field width in move head is: " + field_width);
				break;

				case "down":
				var next_top = top + limb_size;
				if(next_top === field_height) { snake.level_fail(); }
				else { $head.css("top", next_top); }
				//console.log("Field height in move head is: " + field_height);
				break;

				case "left":
				var next_left = left - limb_size;
				if(next_left < 0) { snake.level_fail(); }
				else { $head.css("left", next_left); }
			}

			
			
			// check what is on the next field element
			// is it grower food?
			var next_field = next_left + "_" + next_top;
			
			if (next_field === grower_food) {
				score_actual_level += grower_food_score_value;
				limbs_got++;
				if (limbs_got === limbs_to_get) {return snake.level_complete();}
				// regenerate grower_food
				//snake.remove_current_grower_food();			// "this" instead of "snake" doesn't work; nor does _t; maybe because its called from interval? RIGHT: console.log(this); gave: Window snake.html
				$("#snake_game_field > div.snake_grower_food").remove();
				snake.add_new_food(1);
				//console.log(this); //-- results in Window (because called from interval)
				//console.log(speed);
				// add a new limb
				snake.add_new_limb(left, top, direction);
			}
			else if (next_field === bonus_food) {
				score_actual_level += bonus_food_score_value;				
				snake.regenerate_bonus_food();
				snake.move_limbs();
			}
			// is it limb?
			else if (limbs[next_field]) {
				snake.level_fail();
			}
			
			else if(obstacles[next_field]) {
				snake.level_fail();
			}
			else if(survival_mode) {
				snake.add_new_limb(left, top, direction);
			}
			else {
				snake.move_limbs();
			}
			
			
		},

		"add_key_binds" : function() {

			$("body").on("keydown", function(e) {

				if (!keyReady) {return;}
			
				var code = e.keyCode || e.which;
				var $head = $("div#snake_head");
				
				// will be needed while creating new entry in turning_point
				
				var top = parseInt($head.css("top")); // css("top") gives "280px", alternatevly $head.position().top gives 280;
				var left = parseInt($head.css("left"));
				var index = left + "_" + top;
				var current_direction = $head.attr("direction");
											
				switch(code) {

					case 37: // left
					if (hasTail) {
						if (current_direction === "right") {break;}
						turning_points[index] = "left";
					}
					
					$head.attr("direction", "left");
					break;

					case 38: // up
					if (hasTail) {
						if (current_direction === "down") {break;}
						turning_points[index] = "up";
					}
					$head.attr("direction", "up");					
					break;

					case 39: // right
					if (hasTail) {
						if (current_direction === "left") {break;}
						turning_points[index] = "right";
					}
					$head.attr("direction", "right");					
					break;

					case 40: // down
					if (hasTail) {
						if (current_direction === "up") {break;}
						turning_points[index] = "down";
					}
					$head.attr("direction", "down");
					break;

					default:
					alert("don't know which key was pressed");
				}
				keyReady = false;
			});
		},
		
		/*
		"create_turning_point" : function(x, y) {
			var index = x + "_" + y;
			turning_points[index] = true;
		}
		*/

		"generate_random_field_element" : function() {
			// left and top number must be multiples of limb size
		
					
			var left = Math.floor(Math.random() * ((field_width)/limb_size)) * limb_size;
			var top = Math.floor(Math.random() * ((field_height)/limb_size)) * limb_size;
			
			//console.log("Field height in generate_random: " + field_height);
			
			var index = left + "_" + top;
			if (obstacles[index] || bonus_food == index || grower_food == index || untouchable[index]) {return this.generate_random_field_element();}
			return [left, top];
		},
		
		"add_new_limb" : function(left, top, direction) {
			var new_limb = document.createElement("div");
			
			if (!hasTail) {
				$(new_limb).addClass("snake_tail");
				hasTail = true;
			} 
			
			$(new_limb).css({"left": left, "top": top, "width": limb_size, "height": limb_size}).addClass("snake_limb").attr("direction", direction);
			
			$("#snake_game_field").append(new_limb);
		},
		
		"survival_add_limb" : function() {
			var $head = $("div#snake_head");
			var top = parseInt($head.css("top")); // css("top") gives "280px", alternatevly $head.position().top gives 280;
			var left = parseInt($head.css("left"));
			var direction = $head.attr("direction");
			snake.add_new_limb(left, top, direction);
		},
		
		/*
		 * @param option integer; 1 - grower food; 2 - bonus food
		 */
		"add_new_food" : function(option) {
			
			var coordinates = this.generate_random_field_element();
			
			// check if upper && lower field elements are obstacles
			var upper = coordinates[0] + "_" + (coordinates[1] - limb_size);
			var lower = coordinates[0] + "_" + (coordinates[1] + limb_size); 
			if (obstacles[upper] && obstacles[lower]) {return this.add_new_food(option);}
			// check if to_right && to_left field elements are obstacles
			var to_left = (coordinates[0] - limb_size) + "_" + coordinates[1];
			var to_right = (coordinates[0] + limb_size) + "_" + coordinates[1];
			if (obstacles[to_left] && obstacles[to_right]) {return this.add_new_food(option);}
			
			var new_food = document.createElement("div");
			
			
			$(new_food).css({"left":coordinates[0],"top":coordinates[1], "width":limb_size, "height": limb_size});
			
			if (option === 1) {
				grower_food = coordinates[0] + "_" + coordinates[1];
				$(new_food).addClass("snake_grower_food");
			}
			else if (option === 2) {
				bonus_food = coordinates[0] + "_" + coordinates[1];
				$(new_food).addClass("snake_bonus_food");				
			}			
			$("#snake_game_field").append(new_food);
		},		
		
		"remove_current_grower_food" : function() {
			$("#snake_game_field > div.snake_grower_food").remove();
		},		
		
		"move_limbs" : function() {
			$limbs = $("#snake_game_field .snake_limb");
			
			$limbs.each(function() {
				$limb = $(this);
				var top = parseInt($limb.css("top"));
				var left = parseInt($limb.css("left"));
				
				var next_left = left, next_top = top; 
			
				switch ($limb.attr("direction")) {
					case "up":
					next_top = top - limb_size;
					$limb.css("top", next_top);
					break;
					
					case "right":
					next_left = left + limb_size;
					$limb.css("left", next_left);
					break;
					
					case "down":
					next_top = top + limb_size;
					$limb.css("top", next_top);
					break;
					
					case "left":
					next_left = left - limb_size;
					$limb.css("left", next_left);
					break;
				}
				
				// now check if next field's element is a turning point
				
				var index = next_left + "_" + next_top;
				if (turning_points[index]) {
					$limb.attr("direction", turning_points[index]);
					// if tail has just passed the turning value in that point should vanish
					if ($limb.hasClass("snake_tail")) {turning_points[index] = null;}
				}
				
				// now add new position of a limb to limbs array
				limbs[index] = true;
				
				if ($limb.hasClass("snake_tail")) {
					var previous_index = left + "_" + top;
					limbs[previous_index] = false;
				}
				
				
				
			});
		},
		/*
		 *	@thickness [limb sizes]
		 *	@start_x [limb sizes]
		 *	@start_y [limb sizes]
		*/
		"draw_X" : function(start_x, start_y, thickness) {
			if (typeof(start_y) === "undefined")  {
				start_y = start_x;
			}
			if (typeof(thicnkess) === "undefined") {
				thicnkess = 1;
			}
			//start_y *= limb_size; // [px]
			//start_x *= limb_size; // [px]
			
			var w_limbs = (field_width / limb_size) - (start_x * 2);
			var h_limbs = (field_height / limb_size) - (start_y * 2);
			console.log("w_limbs: " + w_limbs);
			console.log("h_limbs: " + h_limbs);
			
			var b_h = w_limbs - thickness + 1; // # of blocks on height on the /normal building/
			
			
			if (field_width > field_height) {
				var x_excess = b_h - h_limbs;
				console.log("Starting x_excess: " + x_excess);
				//var excess = x_excess; // !!delete later
				//console.log("b_h: " + b_h);
				
				/* 
				 *	compute where to (on y axis - field height) add extra squares
				 */
				
				// eg. xtra_y[3] = 2 means that on index 3 there will be 2 extra squares [1x1 limb]
				var xtra_y = [];
				for (var y = 0; y < h_limbs; y++) {
					xtra_y[y] = 0;
				}
				
				/* 
				 *	auxiliary functions:
				 */
				var add_xtra_sq_everywhere = function(number) {
					for (var y = 0; y < h_limbs; y++) {
						xtra_y[y] += number;
					}
				};
				
				// this func is used when left excess < h_limbs
				var add_xtra_sq_somewhere = function(excess, sign) {
					console.log("Left X_Excess: " + excess);
					if (typeof(sign)==="undefined") {sign = "+";}
					var divisor = Math.floor(h_limbs / excess);
					if (divisor === 1) {
						for (var y = 0; y < h_limbs; y++) {
							xtra_y[y]++;
						}
						add_xtra_sq_somewhere(h_limbs - excess, "-");
						return;
					}
				
					var counter = 0;
					var h_middle = Math.ceil(h_limbs / 2);
					
					for (var y = 0; y < h_middle; y++) {
						if (counter > excess - 1) {break;}
						if ((y + 1) % divisor === 0) {
							if (sign === "+") {xtra_y[y]++;} else {xtra_y[y]--;}
							counter++;
							if (counter > excess - 1) {break;}							
							var sym_y = h_limbs - (y + 1); // symetric y index
							if (sign === "+") {xtra_y[sym_y]++;} else {xtra_y[sym_y]--;}
							counter++;
						}
						
					}
					if (counter < excess && excess % 2 !== 0) {
						if (sign === "+") {xtra_y[0]++;} else {xtra_y[0]--;}
					}
				};
				/* 
				 *	end of auxiliary functions:
				 */
				 
				 
				 
				/* 
				 *	there could be three cases:
				 */
				if (x_excess > h_limbs) {
					var quantity_of_h_limbs = Math.floor(x_excess / h_limbs);
					add_xtra_sq_everywhere(quantity_of_h_limbs);
					x_excess -= quantity_of_h_limbs * h_limbs;
					add_xtra_sq_somewhere(x_excess);
				}
				
				else if (x_excess === h_limbs) {
					add_xtra_sq_everywhere(1);
				}
				
				else if (x_excess < h_limbs) {
					add_xtra_sq_somewhere(x_excess);
				}			
				
				
				/*
				var a111 = Math.floor(h_limbs / excess);
				var a112 = 0;
				if (a111 === 0) { // excess > h_limbs
					a112 = Math.floor(excess / h_limbs); // add this ls to each y
					var a113 = excess - a112 * h_limbs; // still ls to add
					if (a113) {var a114 = Math.floor(h_limbs / a113);}
					console.log("a113: " + a113);
					console.log("a114: " + a114);
				}
				
				
				console.log("a111: " + a111);
				var x = start_x;
				
				var y_extra_counter = 0;
				
				for (var y = 0; y < h_limbs; y++) {
					$obstacle = $(document.createElement("div"));
					$obstacle.addClass("snake_obstacle");
					$obstacle.css({top: y * limb_size + start_y * limb_size, left: x * limb_size, height: limb_size});
					var this_width = 0;
					if (a111 && y_extra_counter < excess && (y+1) % a111 === 0) {
						this_width = (thickness + 1) * limb_size;
						x++;
						y_extra_counter++;
					}
					else if (a112) {
						this_width = (thickness + a112) * limb_size;
						x += a112;
						//x++;
						if (a113 && (y + 1) % a114 && y_extra_counter < a113) {
							this_width += limb_size;
							x++;
							y_extra_counter++;
						}
					}
					else {
						this_width = thickness * limb_size;
					}
					x++;
					$obstacle.width(this_width);
					$("#snake_game_field").append($obstacle);
					
					$obstacle_symetric = $obstacle.clone();
					$obstacle_symetric.css({
						left: "auto",
						right: $obstacle.css("left")
					});
					$("#snake_game_field").append($obstacle_symetric);
					
					// add values to obstacles array
					this.add_to_obstacles($obstacle);
					this.add_to_obstacles($obstacle_symetric);
					
				}*/
				
				// add obstacles to the DOM
				var x = start_x;
				for (var y = 0; y < h_limbs; y++) {
				
					$obstacle = $(document.createElement("div"));
					$obstacle.addClass("snake_obstacle");
					var this_width = limb_size * (thickness + xtra_y[y]);
					$obstacle.css({top: y * limb_size + start_y * limb_size, left: x * limb_size, height: limb_size, width: this_width});
					x += (thickness - 1) + xtra_y[y]; 
					
					$("#snake_game_field").append($obstacle);
					
					$obstacle_symmetric = $obstacle.clone(); // symmetry line is vertical line in the middle of game_field
					$obstacle_symmetric.css({
						left: "auto",
						right: $obstacle.css("left")
					});
					$("#snake_game_field").append($obstacle_symmetric);
					
					// add values to obstacles array
					this.add_to_obstacles($obstacle);
					this.add_to_obstacles($obstacle_symmetric);
				} 
				
				
			}
			
			else { // field_width <= field_height
				
				/*
				 *	Auxilary func. similar to above however with counter,
				 * 	it seems that if Floor(h_limbs/deficit) = 1; we need to increment deficit
				 */
				var add_xtra_sq_somewhere = function(xtra_arr, counter, excess, sign) {
					
					if (typeof(sign)==="undefined") {sign = "+";}
					var divisor = Math.floor(h_limbs / excess);
					if (divisor === 1) {
						for (var y = 0; y < h_limbs; y++) {
							xtra_arr[y]++;
						}
						add_xtra_sq_somewhere(xtra_arr, 1, h_limbs - excess, "-");
						return;
					}
				
					//var counter = 0;
					var h_middle = Math.ceil(h_limbs / 2);
					
					for (var y = 0; y < h_middle; y++) {
						if (counter > excess - 1) {break;}
						if ((y + 1) % divisor === 0) {
							if (sign === "+") {xtra_arr[y]++;} else {xtra_arr[y]--;}
							counter++;
							if (counter > excess - 1) {break;}							
							var sym_y = h_limbs - (y + 1); // symetric y index
							if (sign === "+") {xtra_arr[sym_y]++;} else {xtra_arr[sym_y]--;}
							counter++;
						}
						
					}
					
					console.log("Deficit left: " + excess);
					if (counter < excess && excess % 2 !== 0) {
						if (sign === "+") {xtra_arr[0]++;} else {xtra_arr[0]--;}
					}
					console.log("Deficit - counter: " + (excess - counter));
				};
				
				
				/*
				 *	Now compute
				 */
				 
				var deficit = h_limbs - b_h;
				console.log("Deficit: " + deficit);
				var half_length = Math.ceil(h_limbs/2);
				
				var xtra_x = []; // which x will have exactly one extra square on y axis
				for (y = 0; y < h_limbs; y++) {
					xtra_x[y] = 0;
				}
				
				add_xtra_sq_somewhere(xtra_x, 0, deficit);				
					
				
				
				// create obstacles in DOM
				var x = 0;
				for (var y = 0; y < h_limbs; y++) {
					$obstacle = $(document.createElement("div"));
					$obstacle.css({
						width: thickness * limb_size,
						height: limb_size,
						top: (y + start_y) * limb_size,
						left: (x + start_x) * limb_size
					});
					$obstacle.addClass("snake_obstacle");
					$("#snake_game_field").append($obstacle);
					
					$obstacle_symetric = $obstacle.clone();
					$obstacle_symetric.css({
						left: "auto",
						right: $obstacle.css("left")
					});
					$("#snake_game_field").append($obstacle_symetric);
					
					this.add_to_obstacles($obstacle);
					this.add_to_obstacles($obstacle_symetric);
															
					if (!xtra_x[y]) {x++;}
				}
			} 

		},
		
		"add_to_obstacles" : function($obstacle) {
		
			// take index in format left_top
			var width = $obstacle.width();
			var height = $obstacle.height();
			var left = $obstacle.css("left");
			left = left.substr(0, left.length-2);
			var top = $obstacle.css("top");
			top = top.substr(0, top.length-2);
			
		
			for (var l = 0; l < width; l += limb_size) {
				var this_left = parseInt(left) + l;
				
				for (var t = 0; t < height; t += limb_size) {
						var this_top = parseInt(top) + t;
						var index = this_left + "_" + this_top;
						obstacles[index] = true;
				}			
				
			}
			
		},
		
		"show_obstacles" : function() {
			console.log(obstacles);
		},
		
		"regenerate_bonus_food" : function() {
			//clearTimeout(bonus_delay_timeout_obj);
			clearTimeout(bonus_appearance_timeout_obj);
			bonus_food = "";
			$("#snake_game_field > div.snake_bonus_food").remove();
			
			bonus_delay_timeout_obj = setTimeout(
				function(){
					snake.add_new_food(2);
					bonus_appearance_timeout_obj = setTimeout(function(){snake.regenerate_bonus_food();}, bonus_food_timeout[0] * 1000);
				},
				bonus_food_timeout[1] * 1000
			);
		},
		
		"log" : function(txt) {
			if (console.log) {console.log(txt);}
		},
		
		"draw_v_lines" : function(lines_no, line_width, y_gap, lines_gap) {
			var lines_set_width = (lines_no * line_width + (lines_no - 1) * lines_gap) * limb_size;
			var starting_pixel = Math.ceil((field_width - lines_set_width) / 2);
			if (starting_pixel < 0) {return this.log("Lines of given parameters don't fit in the game field.");}
			if (starting_pixel % limb_size !== 0) {
				this.log("Vertical obstacle lines won't be exactly in the middle of the game field. You may want to adjust parameters.");
				var starting_pixel = Math.floor(starting_pixel / limb_size) * limb_size;				
			}
			
			for (var i = 0; i < lines_no; i++) {
				$obstacle = $(document.createElement("div"));
				$obstacle.css({
					top: y_gap * limb_size,
					left: starting_pixel + i * (lines_gap + line_width) * limb_size,
					width: line_width * limb_size,
					height: field_height - 2 * y_gap * limb_size
				});
				
				$obstacle.addClass("snake_obstacle");
				$("#snake_game_field").append($obstacle);
				this.add_to_obstacles($obstacle);
			}
		},
		
		"draw_h_lines" : function(lines_no, line_height, x_gap, lines_gap) {
			var lines_set_height = (lines_no * line_height + (lines_no - 1) * lines_gap) * limb_size;
			var starting_pixel = Math.ceil((field_height - lines_set_height) / 2);
			if (starting_pixel <=0) {return false;}
			if (starting_pixel % limb_size !== 0) {
				starting_pixel = Math.floor(starting_pixel / limb_size) * limb_size;
			}
			for (var i = 0; i < lines_no; i++) {
				$obstacle = $(document.createElement("div"));
				$obstacle.css({
					left: x_gap * limb_size,
					height: line_height * limb_size,
					top: starting_pixel + i * (lines_gap + line_height) * limb_size,
					width: field_width - 2 * (x_gap * limb_size)
				});
				
				$obstacle.addClass("snake_obstacle");
				$("#snake_game_field").append($obstacle);
				this.add_to_obstacles($obstacle);
			}
		},
		
		"draw_random_obstacles" : function(number) {},
		
		
		/*	
		 *	User gives speed level from 1 - lowest, to 10 - highest
		 *	10 will be converted to 60 milisecond, which will be interval
		 *	for moving head and limbs of the snake
		 *	@param spd integer
		 *	@return void, set speed variable
		 */
		"set_speed" : function(spd) {
			var to_set = 160 - spd * 10;
			speed = to_set;
		},
		
		/*
		 *	@param sp array integer [1,3]
		 *	[x,y]; css left = limb_size * x; css top = limb_size * y
		 */
		"set_starting_point" : function(sp) {
			starting_point = sp;
		},
		
		/*
		 *	Decide how much score player gets for "eating" grower food 
		 *	@param val int, if not set; default = 1
		 */
		"set_grower_food_score_value" : function(val) {
			grower_food_score_value = val;
		},
		
				
		/*
		 *	Decide how much grower food player needs to "eat" to complete level 
		 *	@param val int, if not set; default = 15
		 */		
		"set_limbs_to_get" : function(val) {
			limbs_to_get = val;
		},
		
		/*
		 *	Survival modes: player needs to survive in the world of obstacles without eating growing food
		 *	@param val integer, 1 - on, 0 - off; default: 0
		 */
		"set_survival_mode" : function(val) {
			survival_mode = val;
		},
		
		/*
		 *	@param val integer, time of survival (in seconds)
		 */
		"set_survival_time" : function(val) {
			survival_time = val;
		},
		
		/*
		 *	@param val integer, number of limbs which snake will have in survival mode
		 */
		"set_survival_snake_limbs" : function(val) {
			survival_snake_limbs = val;
		},
		
		/*
		 *	If on, bonus food will appear on the screen
		 *	@param val integer, 1 - on, 0 - off; default: 0
		 */
		"set_bonus" : function(val) {
			bonus = val;
		},
		
		/*
		 *	Decide how much score player gets for "eating" bonus food 
		 *	@param val int, if not set; default = 1
		 */
		"set_bonus_food_score_value" : function(val) {
			bonus_food_score_value = val;
		},
		
		/*
		 *	@param val array of int, [a, b]
		 *	a - how long (in seconds) should bonus food be on the field, unless eaten
		 *	b - period (in seconds) between eating or disappearing bonus food and appearing
		 *		a new one
		 */		
		"set_bonus_food_timeout" : function(val) {
			bonus_food_timeout = val;
		},
		
		/*
		 *	@param arr array of strings, ["a_b", "c_d"],
		 *	
		 */	
		"add_to_untouchable" : function(arr) {
			for (var i = 0; i < arr.length; i++) {
				untouchable[arr[i]] = true;
			}
		}
	
	
	}
})();

 
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
	var starting_point = [19, 14];

	var field_width = 800;
	var field_height = 600;
	
	
	// var $head = $("#snake_head"); can't manipulate it later dunno why
	
	var interval;
	var speed = 100;
	var score = 0;
	
	
	var hasTail = false;	
	var keyReady = true;
	
	var turning_points = [];
	/*
	var turning_points = [
		5_3 => "top",
		2_6 => "left"
	];
	*/
	var limbs = [];
	var grower_food; // string x_y to check later if head steps on grower food
		
	var game_stopped = false;

	return {
		"fetch_size" : function() {
			console.log("Field size is: " + field_width + "x" + field_height);
		},
		
		"set_limb_size":function(s){
			limb_size = s;
		},
		
		"try_configuration2":function(conf_obj){
			if (typeof(conf_obj) === "undefined") return;
			var field_width = 800;
			var field_height = 600;
			var limb_size = 20;
			
			var width = conf_obj.width;
			var height = conf_obj.height;
			var lesstouch = false;
			var moretouch = false;
			var param_less_touch = false;
			var param_more_touch = false;
			var param_majorum_type = false;
			
			var echo = {};
			
			if (typeof(conf_obj.lesstouch) !== "undefined") {
				lesstouch = conf_obj.lesstouch;
				if (lesstouch === "width") {
					param_less_touch = width;
					param_more_touch = height;
					moretouch = "height";
				}
				else {					
					param_less_touch = height;
					param_more_touch = width;
				}
			}
			
			if (height > width) {
				var param_majorum = height;
				param_majorum_type = "height";
				var param_minorum = width;
			}
			else {
				var param_majorum = width;
				param_majorum_type = "width";
				var param_minorum = height;
			}		
		
			
			var opener = Math.round(param_majorum / 40);
			var closer = Math.round(param_majorum / 30);
			
			var lss = new Array(); // limb sizes
			if (!param_less_touch) {
				param_less_touch = param_minorum;
			}			
			for (var i = param_less_touch; i > (param_less_touch - 11); i--) {
			for (var j = opener; j < closer + 1; j++) {
				if (i % j === 0) {
					//console.log(opener);
					lss.push(j);
				}
			}
			if (lss.length) {param_less_touch=i; break;}
			}
			if (!lss.length) return false;
			//console.log("--");
			var lss_verified = new Array();
			if  (!param_more_touch) {
				param_more_touch = param_majorum;
			}
			for (var i = param_more_touch; i > 0.95 * param_more_touch; i--){
			for (var j = 0; j < lss.length; j++) {
				if (i % lss[j] === 0) {
					//console.log(lss[j]);
					lss_verified.push(lss[j]);
				}
				
			}
			if (lss_verified.length) {param_more_touch = i; break;}
			}
			
			if (!lss_verified.length) {return false}
			
			if (typeof(conf_obj.echo) !== "undefined" && conf_obj.echo) {
				if (lesstouch) {
					if (lesstouch==="width") {
						echo.optimal_width = param_less_touch;
						echo.optimal_height = param_more_touch;						
					}
					else {
						echo.optimal_width = param_more_touch;
						echo.optimal_height = param_less_touch;
					}
				}
				else {
					if (param_majorum_type === "height") {
						echo.optimal_height = param_more_touch;
						echo.optimal_width = param_less_touch;
					}
					else {
						echo.optimal_height = param_less_touch;
						echo.optimal_width = param_more_touch;
					}
				}
				echo.limb_sizes = lss_verified;
				console.log(echo);
			}
			
			return true;		
		},
		"try_configuration":function(conf_obj){
			if (typeof(conf_obj) === "undefined") return;
			var field_width = 800;
			var field_height = 600;
			var limb_size = 20;
			
			var width = conf_obj.width;
			var height = conf_obj.height;
			
			
			var factor; // int
			var optimal_width;
			var optimal_height;
			
			for (var h = width; (h > width - 10 && h > 0); h--) {
			
				var find = false;
			
				for (var i = 40; i > 29; i--) {
					if (h % i === 0) {
						//alert("Factor is: " + i);
						factor = i;
						find = true;
						break;
					}
				}
				
				if (find) {optimal_width = h; limb_size = optimal_width / factor; break;}			
			
			}
			
			//alert("Optimal width: " + optimal_width);
			//return optimal_width;
			
			if (width === height) {
				optimal_height = optimal_width;
			}
			else {
				for (var i = height; i > 0; i--) {
					if (i % limb_size === 0) {
						optimal_height = i;
						break;
					}
				}
				return optimal_height;				
				//alert("Optimal height (lower bound): " + optimal_height);
				var optimal_height_upper = false;
				for (var i = height; i < height + 11; i++) {
					if (i % limb_size === 0) {
						optimal_height_upper = i;
						break;
					}					
				}
				//alert("Optimal height (upper bound): " + optimal_height_upper);
				if (optimal_height_upper && optimal_height_upper - height < height - optimal_height) {
					return optimal_height_upper;
				}
				else {return optimal_height;}
			
			}
			
		},
		
		"try_configuration3":function(conf_obj){
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
		"configure" : function(width, height, limb_size) {
			
			this.field_width = width;
			this.field_height = height;
			this.limb_size = limb_size;
		
			/*
			if (typeof(conf_obj) === "undefined") return;
			if (conf_obj.hasOwnProperty("field_width")) {
				field_width = conf_obj.field_width;
				field_height = Math.floor((field_width / 8) * 6);
				limb_size = field_width / 40;
				
				$("div#snake_menu").width(field_width);
				$("div#snake_game_field").css({"width":field_width,"height":field_height});				
				
				//$("div#snake_head").css({"width":limb_size,"height":limb_size});
				
			}
			if (conf_obj.hasOwnProperty("field_height")) {
				field_height = conf_obj.field_height;
				//limb_size = field_width * field_height / 6000;
				$("div#snake_game_field").css({"width":field_width,"height":field_height});	
			}
			if (conf_obj.hasOwnProperty("limb_size")) {
				limb_size = conf_obj.limb_size;
			}
			*/
		},
		
	
		"display_turning_points" : function() {
			console.log(turning_points);
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
			interval = setInterval(this.move_head, speed);
			
			this.score = 0;
			this.add_key_binds();
			
			
			hasTail = false;
			grower_food = "";
			this.add_new_grower_food();
			game_stopped = false;
			turning_points = [];
			limbs = [];
			
			$("#snake_pause_button").focus();
		},

		"stop_game" : function() {
			$("#snake_stop_button").attr("disabled", "disabled");
			$("#snake_start_button").removeAttr("disabled");
			$("#snake_pause_button").attr("disabled", "disabled");
			$("#snake_resume_button").attr("disabled", "disabled");

			clearInterval(interval);
			$("body").unbind("keydown");
			alert("You loose. Your score is: " + score);	
			game_stopped = true;
			score = 0;
			$("#snake_start_button").focus();
		},
		//"draw_obstacle" :

		"move_head" : function() {
			keyReady = true; // new interval so allow to ...
			var $head = $("div#snake_head");
			var top = parseInt($head.css("top")); // css("top") gives "280px", alternatevly $head.position().top gives 280;
			var left = parseInt($head.css("left"));
			var direction = $head.attr("direction");
			
			var next_left = left, next_top = top;
			
			switch (direction) {

				case "up":
				var next_top = top - limb_size;
				if (next_top < 0) { snake.stop_game();}
				else { $head.css("top", next_top); }
				break;

				case "right":
				var next_left = left + limb_size;
				if (next_left === field_width) { snake.stop_game(); }
				else { $head.css("left", next_left); }
				//console.log("Field width in move head is: " + field_width);
				break;

				case "down":
				var next_top = top + limb_size;
				if(next_top === field_height) { snake.stop_game(); }
				else { $head.css("top", next_top); }
				//console.log("Field height in move head is: " + field_height);
				break;

				case "left":
				var next_left = left - limb_size;
				if(next_left < 0) { snake.stop_game(); }
				else { $head.css("left", next_left); }
			}

			if (game_stopped) {return;} // why proceeding to below checking if game is stopped
			
			// check what is on the next field element
			// is it grower food?
			var next_field = next_left + "_" + next_top;
			
			if (next_field === grower_food) {
				score++;
				// regenerate grower_food
				snake.remove_current_grower_food();			// "this" instead of "snake" doesn't work; nor does _t; maybe because its called from interval? RIGHT: console.log(this); gave: Window snake.html
				snake.add_new_grower_food();
				//console.log(this); //-- results in Window (because called from interval)
				//console.log(speed);
				// add a new limb
				snake.add_new_limb(left, top, direction);
			}
			// is it limb?
			else if (limbs[next_field]) {
				snake.stop_game();
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
		
		"add_new_grower_food" : function() {
			var new_grower = document.createElement("div");
			var coordinates = this.generate_random_field_element();
			
			$(new_grower).css({"left":coordinates[0],"top":coordinates[1], "width":limb_size, "height": limb_size}).addClass("grower_food");
						
			grower_food = coordinates[0] + "_" + coordinates[1];
			
			$("#snake_game_field").append(new_grower);
		},
		
		"remove_current_grower_food" : function() {
			$("#snake_game_field > div.grower_food").remove();
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
			//start_y *= limb_size; // [px]
			//start_x *= limb_size; // [px]
			
			var w_limbs = (field_width / limb_size) - (start_x * 2);
			var h_limbs = (field_height / limb_size) - (start_y * 2);
			console.log("w_limbs: " + w_limbs);
			console.log("h_limbs: " + h_limbs);
			
			var b_h = w_limbs - thickness + 1; // # of blocks on height on the normal building
			
			
			if (field_width > field_height) {
				var excess = b_h - h_limbs;
				console.log("b_h: " + b_h);
				
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
				}
			}
			
			else { // field_width <= field_height
			console.log("here I am");
				var x = 0;
				var deficit = h_limbs - b_h;
				console.log("Deficit: " + deficit);
				var a111 = Math.floor(h_limbs / deficit);
				var x_extra_counter = 0;
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
					
					
					
					
					if (x_extra_counter < deficit && (y+1) % a111 === 0) {x_extra_counter++;}
					else {x++;}
				}
			} 

		}
	
	
	}
})();

 
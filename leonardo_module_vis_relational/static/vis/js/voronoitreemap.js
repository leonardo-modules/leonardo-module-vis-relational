
function voronoitreemap(config) {

	function make_regular_polygon(width, height, border, sides) {
		var center = [width*0.5, height*0.5],
			width_radius = (width - 2*border) * 0.5,
			height_radius = (height - 2*border) * 0.5,
			radius = Math.min( width_radius, height_radius ),
			angle_radians = 2*Math.PI / sides,
			initial_angle = sides%2==0 ? -Math.PI/2 -angle_radians*0.5 : -Math.PI/2, // subtract angles
			result = [],
			somevariable = 0;
		
		// special case few sides
		if (sides == 3) {
			center[1] += height_radius / 3.0; // can always do this (I think?)
		
			radius_for_width = width_radius * 2 / Math.sqrt(3);
			radius_for_height = height_radius * 4.0 / 3.0;
			radius = Math.min(radius_for_width, radius_for_height);
		}
		else if (sides == 4) {
			radius *= Math.sqrt(2);
		}
		
		for (var i = 0; i < sides; i++) {
			result.push([center[0] + radius * Math.cos(initial_angle - i * angle_radians), center[1] + radius * Math.sin(initial_angle - i * angle_radians)]);
		}

		return result;
	}

	// here we set up the svg
	var width = config.width;
	var height = config.height;
	var border = 10;
	var svg_container = d3.select(config.placeholder).append("svg")
		.attr("width",width)
		.attr("height",height);

	///////// bounding polygon
	function get_selected_polygon() {
		var width_less_border = width - 2*border;
		var height_less_border = height - 2*border;
		var entire_svg_polygon = [[border,border],
			[border,height_less_border],
			[width_less_border,height_less_border],
			[width_less_border,border]];

		var select_polygon = config.base_polygon;
		if (select_polygon == "rectangle") {
			return entire_svg_polygon;
		}
		else if (select_polygon == "triangle") {
			return make_regular_polygon(width, height, border, 3);
		}
		else if (select_polygon == "pentagon") {
			return make_regular_polygon(width, height, border, 5);
		}
		else if (select_polygon == "octogon") {
			return make_regular_polygon(width, height, border, 8);
		}
		else if (select_polygon == "circle") {
			return make_regular_polygon(width, height, border, 100);
		}	
	}

	function make_d3_poly(d) {
		return "M" + d.join("L") + "Z";
	}

	var paint = function(nodes){
		svg_container.selectAll("path").remove();

		// background color
		//var background_color = "lightgray";
		var background_color = "none";
		svg_container.append("g").append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.attr("fill", background_color);

		// strokes by depth
		var stroke_by_depth = true;		
		var stroke_min = 2,
			stroke_max = stroke_by_depth ? 10 : stroke_min,
			stroke_levels = 3,// could determine from max depth...see color...
			stroke_delta = (stroke_max - stroke_min) * 1.0 / stroke_levels;
		
		// color
		var select_color = 'name';
		if (select_color == "linear") {
			var nodes_all_depths = nodes.map(function(x) {return x.depth});
			var nodes_max_depth = Math.max.apply(null, nodes_all_depths);
			var color_d3_linear = d3.scale.linear().domain([0, nodes_max_depth]).range(["blue","lightblue"]);
			var color_func = function(d) { return color_d3_linear(d.depth); };
		}
		else if (select_color == "name") {
			var color_d3 = d3.scale.category20c();
			var color_func = function(d) { return d.children ? color_d3(d.name) : "none"; };
		}
		else {
			// none or some other weird thing ;)
			var color_func = "lightblue"; // or whatever color
		}
		
		// any maximum depth?
		//var select_max_depth = d3.select("#select_max_depth").node().value;
		var max_depth = 12; // or whatever big thing...
		//if (select_max_depth != "none") {
		//	max_depth = parseInt(select_max_depth);
		//}

		// consolidate and draw polygons
	    var selected_node_list = [];
	    for (var i = 0; i < nodes.length; i++){
	        var node = nodes[i];
	        if (node.polygon != null && node.depth <= max_depth){
	            selected_node_list.push(node);
	        }
	    }
	    var polylines = svg_container.append("g").selectAll("path").data(selected_node_list);
		polylines.enter().append("path")
		        .attr("d", function(d) {return make_d3_poly(d.polygon);})
				.attr("stroke-width", function(d) { return Math.max(stroke_max - stroke_delta*d.depth, stroke_min) + "px";})
		        .attr("stroke", "black")
		        .attr("fill", color_func);
	    polylines.exit().remove();
		
		
		// also circles?  only for leaves?
		// a subset of selected_node_list as it turns out
		var leaf_node_list = [];
	    for (var i = 0; i < selected_node_list.length; i++){
	        var node = selected_node_list[i];
	        if (!node.children || node.depth == max_depth){
	            leaf_node_list.push(node);
	        }
	    }

		// disabled because of weirdness with non-leaf centroids
		// centroid circles
		//var show_leaf_centroids = d3.select("#checkbox_leaf_centroids").property('checked');
		if (false) {
			var center_circles = svg_container.append("g").selectAll(".center.circle").data(leaf_node_list);
			center_circles.enter().append("circle")
				.attr("class", "center circle")
				.attr("cx", function(d) {return (d.site.x);})
				.attr("cy", function(d) {return (d.site.y);})
				.attr("r", function(d) {return 5;})
				//.attr("r", function(d) {return (Math.sqrt(d.weight));})
				//.attr("r", function(d) {return (Math.max(Math.sqrt(d.weight), 2));})
				.attr("stroke", "black")
				.attr("fill", "black");
		}
		
		// weight circles
		// this does work...but is kind of ugly
		if (false) {
			var radius_circles = svg_container.append("g").selectAll(".radius.circle").data(leaf_node_list);
			radius_circles.enter().append("circle")
				.attr("class", "radius circle")
				.attr("cx", function(d) {return (d.site.x);})
				.attr("cy", function(d) {return (d.site.y);})
				//.attr("r", function(d) {return 5;})
				.attr("r", function(d) {return (Math.sqrt(d.weight));})
				//.attr("r", function(d) {return (Math.max(Math.sqrt(d.weight), 2));})
				.attr("stroke", "white")
				.attr("stroke-width", "5px")
				.attr("fill", "none");
		}
	}

	function compute() {
		
		var newnodes;
		var select_polygon = get_selected_polygon();

		var vt = d3.layout.voronoitreemap()
			.root_polygon(select_polygon)
			.value(function(d) {return d.size; })
			.iterations(100);
		
		//var select_dataset = get_selected_dataset();
		d3.json(config.data_source, function(error, root) {
			newnodes = vt(root);
			paint(newnodes);
		});
	}

    compute();
}
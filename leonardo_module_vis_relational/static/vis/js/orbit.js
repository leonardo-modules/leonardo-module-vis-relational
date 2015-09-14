
function orbit_layout(config) {

  //down with category20a()!!
  colors = d3.scale.category20b();

  orbitScale = d3.scale.linear().domain([1, 3]).range([3.8, 1.5]).clamp(true);
  radiusScale = d3.scale.linear().domain([0,1,2,3]).range([20,10,3,1]).clamp(true);

  var vis = d3.select(config.placeholder).append("svg")
    .attr("width", config.width)
    .attr("height", config.height)

  orbit = d3.layout.orbit().size([config.height,config.width])
  .children(function(d) {return d.children})
  .revolution(function(d) {return d.depth})
  .orbitSize(function(d) {return orbitScale(d.depth)})
  .mode(config.mode)
  .speed(.1)
  .nodes(config.data);

  vis.selectAll("g.node").data(orbit.nodes())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", function(d) {return "translate(" +d.x +"," + d.y+")"})
  .on("mouseover", nodeOver)
  .on("mouseout", nodeOut)

  vis.selectAll("g.node")
  .append("circle")
  .attr("r", function(d) {return radiusScale(d.depth)})
  .style("fill", function(d) {return colors(d.depth)})

  vis.selectAll("circle.orbits")
  .data(orbit.orbitalRings())
  .enter()
  .insert("circle", "g")
  .attr("class", "ring")
  .attr("r", function(d) {return d.r})
  .attr("cx", function(d) {return d.x})
  .attr("cy", function(d) {return d.y})
  .style("fill", "none")

  orbit.on("tick", function() {
    vis.selectAll("g.node")
      .attr("transform", function(d) {return "translate(" +d.x +"," + d.y+")"});

    vis.selectAll("circle.ring")
    .attr("cx", function(d) {return d.x})
    .attr("cy", function(d) {return d.y});
  });

  orbit.start();

  function nodeOver(d) {
    orbit.stop();
    d3.select(this).append("text").text(d.name).style("text-anchor", "middle").attr("y", 35);
    d3.select(this).select("circle").style("stroke", "black");
  }

  function nodeOut() {
    orbit.start();
    vis.selectAll("text").remove();
    vis.selectAll("g.node > circle").style("stroke", "white"); 
  }

}

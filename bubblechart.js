
(function() {
  window.bubbleChart = {};

  bubbleChart.create = function(width,height,data) {

    var total_completed = 0;
    for(var i = 0; i < data.length; i++) {
      total_completed += data[i].completed_uploads;
    }

    var centerx = width / 2;
    var centery = height / 2;

    var area_of_largest_circle = Math.PI * Math.min(width/2,height/2) * Math.min(width/2,height/2);

    var radius_func = radius(total_completed,area_of_largest_circle);

    var circles = d3.select('svg').selectAll('circle').data(data).enter().append('circle')
    .attr('title', function(d) { return d.name; })
    .attr('r', radius_func);

    var force = d3.layout.force()
    .nodes(circles)
    .charge(-0.01)
    .gravity(-0.01)
    .on("tick", function() {
      circles
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    })
    .start();

  }

  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 8;
  }

  function radius(total_completed_uploads,area_available) {
    return (function(dataset) {
      var proportion_of_uploads = dataset.completed_uploads / total_completed_uploads;
      var area_to_consume = area_available * proportion_of_uploads;

      var radius_given_area = Math.sqrt(area_to_consume / Math.PI);

      console.log(total_completed_uploads,area_available,proportion_of_uploads,area_to_consume,radius_given_area);
      return Math.max(radius_given_area,10);
    });
  }

})();

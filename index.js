d3.json('records.json',make_vis);

function make_vis(raw_data) {
  var w = window.innerWidth;
  var h = window.innerHeight;

  var data = [];
  for(var i = 0;i < raw_data.length; i++) {
    data.push(
      {
      name: raw_data[i].name,
      wickets: raw_data[i].wickets,
      matches: raw_data[i].matches,
      strike_rate: raw_data[i].strike_rate,
      economy: raw_data[i].economy,
      playing_span: raw_data[i].playing_span,
      x: Math.random() * w,
      y: Math.random() * h
    });
  }

  var svg = d3.select('body').append('svg')
  .attr('width',w)
  .attr('height',h);

  var minWickets = d3.min(data,function(d) { return d.wickets; });
  var maxWickets = d3.max(data,function(d) { return d.wickets; });

  var minSR = d3.min(data,function(d) { return d.strike_rate; });
  var maxSR = d3.max(data,function(d) { return d.strike_rate; });

  var radiusScale = d3.scale.sqrt()
  .domain([minWickets,maxWickets])
  .range([10,100]);

  var ballColorScale = d3.scale.linear()
  .domain([minSR,maxSR])
  .range(['maroon','white']);

  var stitchColorScale = d3.scale.quantize()
  .domain([minSR,maxSR])
  .range(['beige','black','black']);

  var balls = svg.selectAll('g')
  .data(data)
  .enter()
  .append('g');

  balls.each(ballFromData);

  balls.append('svg:title').text(function(d) {
    return "name: " + d.name + "\n" +
      "played: " + d.playing_span + "\n" +
      "wickets: " + d.wickets + "\n" +
      "matches: " + d.matches + "\n" +
      "SR: " + d.strike_rate + "\n" +
      "economy: " + d.economy;
  });

  balls.on("mouseover",function(d) {
    d3.select(this).selectAll('circle.outline').
      attr('stroke','yellow');
  });

  balls.on("mouseout",function(d) {
    d3.select(this).selectAll('circle.outline').
      attr('stroke','black');
  });

  var centre = {x: w/2, y: h/2};
  var layout_gravity = -0.1;
  var layout_damper = 0.1;

  var layout = d3.layout.force()
  .nodes(data)
  .size([w,h]);

  layout.gravity(layout_gravity)
  .charge(layout_charge)
  .friction(0.9)
  .on("tick", function(e) {
    balls.each(move_towards_center(e.alpha))
    .each(moveBall);});

    layout.start();

    function moveBall(d) {
      adjustBall(d3.select(this),
                 radiusScale(d.wickets),
                 d.x,
                 d.y);
    }

    function layout_charge(d) {
      return -Math.pow(radiusScale(d.wickets),2.0) / 22;
    }

    function move_towards_center(alpha) {
      return function(d) {
        d.x = d.x + (centre.x - d.x) * (layout_damper + 0.02) * alpha;
        d.y = d.y + (centre.y - d.y) * (layout_damper + 0.02) * alpha;
      };
    }

    function ballFromData(d,i) {
      return drawBall(this,
                      radiusScale(d.wickets),
                      d.x,
                      d.y,
                      ballColorScale(d.strike_rate),
                      stitchColorScale(d.strike_rate));
    }

    function drawBall(group,radius,cx,cy,ballColor,stitchColor) {
      var ballRadius = 100;
      var seamHeight = 5;

      var topOfBallY = seamHeight;
      var bottomOfBallY = ballRadius * 2 + seamHeight;
      var centreOfBallY = ballRadius + seamHeight;

      var ball = d3.select(group);

      var outlineCircle = ball.append('circle')
      .classed('outline',true)
      .attr('r',ballRadius)
      .attr('cx',ballRadius)
      .attr('cy',centreOfBallY)
      .attr('stroke','black')
      .attr('stroke-width','2');

      var topRaise = ball.append('circle')
      .classed('outline',true)
      .attr('r',seamHeight * 4)
      .attr('fill',ballColor)
      .attr('cx',ballRadius)
      .attr('cy',topOfBallY + seamHeight * 3)
      .attr('stroke','black')
      .attr('stroke-width','2');

      var bottomRaise = ball.append('circle')
      .classed('outline',true)
      .attr('r',seamHeight * 4)
      .attr('fill',ballColor)
      .attr('cx',ballRadius)
      .attr('cy',bottomOfBallY - seamHeight * 3)
      .attr('stroke','black')
      .attr('stroke-width','2');

      var maincirlce = ball.append('circle')
      .attr('r',ballRadius)
      .attr('fill',ballColor)
      .attr('cx',ballRadius)
      .attr('cy',centreOfBallY);

      var seam = ball.append('line')
      .attr('x1',ballRadius)
      .attr('y1',topOfBallY - seamHeight)
      .attr('x2',ballRadius)
      .attr('y2',bottomOfBallY + seamHeight)
      .attr('stroke','black')
      .attr('stroke-width','0.5');

      var stitchLength = 4;
      var stitchGap = 1;

      function drawStitching(start,end,xpos) {
        ball.append('line')
            .attr('stroke',stitchColor)
            .attr('stroke-width','3')
            .attr('x1',xpos)
            .attr('y1',start)
            .attr('x2',xpos)
            .attr('y2',end)
            .attr('stroke-dasharray',stitchLength + ',' + stitchGap);
      }

      drawStitching(topOfBallY + stitchGap, bottomOfBallY - stitchGap, ballRadius - seamHeight * 3);
      drawStitching(topOfBallY + stitchGap, bottomOfBallY - stitchGap, ballRadius + seamHeight * 3);
      drawStitching(topOfBallY + stitchGap + 2, bottomOfBallY - stitchGap - 2, ballRadius + seamHeight * 5);
      drawStitching(topOfBallY + stitchGap + 2, bottomOfBallY - stitchGap - 2, ballRadius - seamHeight * 5);
      drawStitching(topOfBallY + stitchGap + 4, bottomOfBallY - stitchGap - 4, ballRadius + seamHeight * 6);
      drawStitching(topOfBallY + stitchGap + 4, bottomOfBallY - stitchGap - 4, ballRadius - seamHeight * 6);

      adjustBall(ball,radius,cx,cy);
      return ball;
    }

    function adjustBall(ball,radius,cx,cy) {
      ball.attr('transform',
                'rotate(' + (cx/w + cy/h)/2 * 5000 + ',' + cx + ',' + cy + ')' +
                  'translate(' + (cx - radius) + ',' + (cy - radius) + ') ' +
                  'scale(' + (radius / 100) + ') ');
    }

}

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hoodie Visualisation</title>
    <link rel="stylesheet" href="index.css">
  </head>
  <body>
    <meta charset="utf-8">
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script>

    var width = 960,
        height = 500,
        padding = 1.5, // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 12;

    var n = 200, // total number of nodes
        m = 6; // number of distinct clusters

    var color = d3.scale.category10()
        .domain(d3.range(m));

    // The largest node for each cluster.
    var clusters = new Array(m);

    var nodes = d3.range(n).map(function() {
      var i = Math.floor(Math.random() * m),
          r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
          d = {
            cluster: i,
            radius: r,
            x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
            y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
          };
      if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
      return d;
    });

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var node = svg.selectAll("circle")
        .data(nodes)
      .enter().append("circle")
        .style("fill", function(d) { return color(d.cluster); })
        .call(force.drag);

    node.transition()
        .duration(750)
        .delay(function(d, i) { return i * 5; })
        .attrTween("r", function(d) {
          var i = d3.interpolate(0, d.radius);
          return function(t) { return d.radius = i(t); };
        });

    function tick(e) {
      node
          .each(cluster(10 * e.alpha * e.alpha))
          .each(collide(.5))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
      return function(d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + cluster.radius;
        if (l != r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
        }
      };
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
        var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    </script>

    <script type="text/javascript" src='jquery.js'></script>
    <script type="text/javascript">
    function getrepo(){
      var token = "ec4b69ecbd6d862b79f183c522e55338cf97fb3f"
      var repoDummyPromises = []
      var repolist = [
      {
        name : "hoodie",
        url : "hoodiehq/hoodie"
      },
      {
        name : "camp",
        url : "hoodiehq/camp"
      },
      {
        name : "hoodie-server",
        url : "hoodiehq/hoodie-server"
      },
      {
        name : "hoodie-app-tracker",
        url : "hoodiehq/hoodie-app-tracker"
      },
      {
        name : "hoodie-client",
        url : "hoodiehq/hoodie-client"
      },
      {
        name : "hoodie-admin",
        url : "hoodiehq/hoodie-admin"
      }
      ]
      for(var i=0;i<repolist.length;i++){
        var repoDummy = $.ajax({
          url : "https://api.github.com/repos/" + repolist[i].url + "/issues?access_token"+token,
          method : 'GET'
        })
        repoDummyPromises.push(repoDummy);
      }
      $.when.apply($,repoDummyPromises).then(function(){
        var repos = [];
        var dummyLabelDictionary = {};
        for(var i=0;i<repolist.length;i++){
          repos.push({name : repolist[i].name,issues : arguments[i][0]});
        }
        for(var i=0;i <repos.length;i++){
          var repo_issues = repos[i].issues
          // console.log(repos[i].issues);
          // console.log(repo_issues);
          for(var j= 0;j<repo_issues.length;j++){
            var repo_issues_label = repos[i].issues[j].labels
            // console.log(repos[i].issues[j].labels);
            // console.log(repo_issues_label);
            for(var k=0;k<repo_issues_label.length;k++){
              var repo_issues_labeldummy = repos[i].issues[j].labels[k]
              // console.log(repos[i].issues[j].labels[k].name)
              // console.log(repo_issues_labeldummy);
              if(dummyLabelDictionary[repo_issues_labeldummy.name]){
                dummyLabelDictionary[repo_issues_labeldummy.name] += 1;
              }
              else{
                dummyLabelDictionary[repo_issues_labeldummy.name] = 1;
              }
            }
          }
          repos[i]['labelDictionary'] = dummyLabelDictionary;
        }
        console.log(repos);
      })
    }

    getrepo();
    </script>
  </body>
</html>

var width = 800,
    height = 500,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

var create_repos = function(arguments,repolist) {
  var repos = [];

  for(var i=0;i<repolist.length;i++){
    repos.push({name : repolist[i].name,issues : arguments[i][0]});
  }

  for(var i=0;i <repos.length;i++){
    var dummyLabelDictionary = {};
    var repo_issues = repos[i].issues
    // console.log(repos[i].issues);
    // console.log(repo_issues);
    for(var j= 0;j<repo_issues.length;j++){
      var repo_issues_label = repo_issues[j].labels
      // console.log(repos[i].issues[j].labels);
      // console.log(repo_issues_label);
      if(repo_issues_label.length==0){
        if(dummyLabelDictionary['no labels']){
          dummyLabelDictionary['no labels'] = 1;
        }
        else{
          dummyLabelDictionary['no labels'] = 1;
        }
      }
      for(var k=0;k<repo_issues_label.length;k++){
        var repo_issues_labeldummy = repos[i].issues[j].labels[k]
        // console.log(repos[i].issues[j].labels[k].name)
        // console.log(repo_issues_labeldummy);
        if(!dummyLabelDictionary[repo_issues_labeldummy.name]){
            dummyLabelDictionary[repo_issues_labeldummy.name] = [];
        }
        dummyLabelDictionary[repo_issues_labeldummy.name].push(repo_issues[j]);
      }
    }
    repos[i]['labelDictionary'] = dummyLabelDictionary;
  }
  return repos;
}
function create_node(repos){
  var m = repos.length;
  var nodedummy = [];
  var clusters = [];
  for(var i = 0;i<repos.length;i++){
    for(key in (repos[i].labelDictionary)){
      var obj = {cluster : i,
                 repo_name : repos[i].name,
                 label_name : key,
                 radius : Math.sqrt(repos[i].labelDictionary[key].length)*10 ,
                 total_issues : repos[i].labelDictionary[key].length,
                 x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                 y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
      };
      nodedummy.push(obj);
      if(clusters[i]) {
        if(clusters[i].radius < obj.radius) {
          clusters[i] = obj;
        }
      } else {
        clusters.push(obj);
      }
    }
  }
  return {nodes : nodedummy, clusters : clusters};
}

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
      url : "https://api.github.com/repos/" + repolist[i].url + "/issues?access_token="+token,
      method : 'GET'
    })
    repoDummyPromises.push(repoDummy);
  }

  $.when.apply($,repoDummyPromises).then(function(){

    var repos = create_repos(arguments,repolist); // total number of nodes
    var m = repos.length; // number of distinct clusters
    var obj = create_node(repos);
    var nodes = obj.nodes;
    var clusters = obj.clusters;
    var n = nodes.length
    // console.log(nodes);

        var color = d3.scale.category10()
            .domain(d3.range(m));

        // The largest node for each cluster.

        // var nodes = d3.range(n).map(function() {
        //   var i = node.length,
        //       r = node.issues_in_label * maxRadius,
        //       d = {
        //         cluster: i,
        //         radius: r, 40 Inch
        //         x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
        //         y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
        //       };
        //   if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        //   return d;
        // });

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(0.02)
            .charge(0)
            .on("tick", tick)
            .start();

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
            return "<span style = 'font-size:22px'><br>label name: <span style='color:red'>" + d.label_name + "</span><br>Number of Issues: <span style='color:red'>" + d.total_issues + "</span><br></span>"
            })

        var svg = d3.select("#node").append("svg:svg")
            .attr("width", width)
            .attr("height", height);

        svg.call(tip);

        var node = svg.selectAll("circle")
            .data(nodes)
          .enter().append("circle")
            .style("fill", function(d) { return color(d.cluster); })
            .call(force.drag)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // var titles = node.append('svg:title')
        //                   .text(function(d){
        //                     return d.label_name+" ("+d.total_issues+")";
        //                   });

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
              .each(collide(0.5))
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
      })
    }

getrepo();

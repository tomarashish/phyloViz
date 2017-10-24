//Inspired by Mike Bostock and Jason Davies 'Tree Of Life'
//A re-implementation of Mike's and Json's dendrogram tree
//http://bl.ocks.org/mbostock/c034d66572fd6bd6815a
//https://www.jasondavies.com/tree-of-life/
//https://javascript-minifier.com/
//https://jscompress.com/
//https://www.youtube.com/watch?v=fWyRoxv-DBM
//https://www.youtube.com/watch?feature=player_embedded&v=dpo9iK26el8

dendroGram = function module() {

  //Initializing valriables for main elements of dendrogram
  var root, nodes, links, linkExtension, node_counts, chart, nodeCircle;

  //Initializing variable for external chart parameter
  var input, timeout, link, node, textNode, textLabel, svgId, colorCount = 0;

  // Initializing variables for linear and radial dendrogram 
  var width, height, innerRadius, outerRadius;

  //Initializing variables for setting meta data for charts
  var heatData, pieData, barChart, domainData, geneData, addSun,
    addSeq, stackBarData, imageData;
  var barData = [];

  //Initializing variables for panning 
  var panSpeed = 200,
    panBoundary = 20; // Within 20px from edges will pan when dragging

  //chart to svg distance
  // Dynamically add more charts based on distance of previous svg element
  var addSVG = 0;

  // Textbox variable to dynamically calculate text box width 
  // textbox variable is used to create rect box with 
  // width of largest text svg
  var textBox = 0;

  // Initializing object to set/change default values of dendrogram
  var option = {
    weightLinks: false,
    linkValue: false,
    linkName: false,
    nodeSize: false,
    labelHide: false, //hide/unhide node labels
    legend: false,
    noLinkExtend: false,
    treeType: 'linear',
    nodeShape: '',
    subTree: false,
    collapseTree: false,
    textColor: false,
    colorBox: true,
    domainFill: 'gradient',
    domainType: 'gene',
    heatType: 'rect'
  };

  // Initializing color variables for dendrogram, chart, heatmap;
  var color = d3.scale.category20b();
  var colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8"]
  //["#EFD5D9","#EFD5D9","#EABEC6","#EAACB6","#E593A1","#E27487","#E25668","#DD4A63"]

  var baseColor = d3.scale.ordinal()
    .domain(["A", "T", "G", "C"])
    .range(["#E27487", "#1d91c0", "#7fcdbb", "#edf8b1"]);

  var colorScale = d3.scale.quantile()
    .range(colors);


  var buckets = colors.length;

  //
  var cluster = d3.layout.cluster()
    .children(function (d) {
      return d.branchset;
    })
    .value(function (d) {
      return d.length;
    })
    .separation(function (a, b) {
      return (a.parent == b.parent ? 1 : 1);
    });

  //Scale bar chart
  var barScale = d3.scale.linear()
    .domain([0, 1])
    .range([0, 30]);

  //Initializing variable for pie chart
  var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) {
      return d.value;
    });

  //Initializing variable to create custom pie arcs
  // Mainly to set heatmap and label box in radial chart
  var pieMap = d3.layout.pie()
    .value(function (d) {
      return 1;
    });

  // creating function to annotate link weight
  var link_weight = d3.scale.linear()
    .domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) // replace this line to use dynamic values from data
    .range([1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5])
    .interpolate(d3.interpolateRound);

  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 5]).on("zoom", zoom);

  // This makes the layout more consistent.
  var levelWidth = [1];

  /* Primary tree building function

     Initial render of all SVG elements
     including the GUI and the initial layout of
     the tree.  Subsequent updating in both style
     and format of the tree is done through updateTree()

     Main Elements :
     ===============
  	- div : string
  		div id (with included #) in which to generated tree
  	- newick : Newick obj
  		   return of function parseNewick()
  	- option: obj
  		   option object with keys and values

     Parameter:
     ===========
  	- Passing newick format data 

     Retrurns:
     =========
      - nothing

  */
  function exports(_selection) {
    _selection.each(function (_data) {

      svgId = this;

      root = parseNewick(_data);

      updateTree(root)

    }) //end of _selection
  } //end of exports            

  /* Function creates a new / update existing tree.
     Based on option object parameter create linear or radial 
     dendrogram. 
     Assumes globals (option, nodes, links, linkExtension) exist
     
     Parameter :
     ===========
     - data : root or sub tree data
     
     Returns :
     =========
     - nothing
  */
  function updateTree(data) {

    childCount(0, data);

    // Assign default value to variable of linear dendrogram
    // If option.treeType is radial
    if (option.treeType == "linear") {

      width = 600;
      height = 200;

      var newHeight = d3.max(levelWidth) * 50; // 25 pixels per line
      cluster = cluster.size([newHeight, width - 350]);
    }

    // Assign default value to variable of radial dendrogram
    // If option.treeType is radial
    if (option.treeType == "radial") {

      outerRadius = 500,
        innerRadius = outerRadius - 160,
        width = outerRadius * 2,
        height = outerRadius * 2,

        cluster = cluster.size([360, innerRadius])

    }

    nodes = cluster.nodes(data);
    links = cluster.links(nodes);
    input = d3.select("#show-length input").on("change", changed);
    //timeout = setTimeout(function() { input.property("checked", true).each(changed); }, 300);

    if (option.treeType == "radial") {
      setRadius(root, root.length = 0, innerRadius / maxLength(root));
    }
    var totalNodes = 0;
    var maxLabelLength = 0;
    var maxLableText = '';

    // remove if any previous drawn svg
    d3.select(svgId).select("svg").remove();

    chart = d3.select(svgId).append("svg")
      .attr("width", "800px")
      .attr("height", "700px")
      .attr("viewBox", "0 0 800 700")
      .attr("preserveAspectRation", "xMinYMid")
      .call(zoomListener)
      .append("g")
      .attr("transform", function (d) {
        if (option.treeType == 'linear')
          return "translate(40,40)";

        if (option.treeType == 'radial')
          return "translate(" + outerRadius + "," + outerRadius + ")";
      });


    linkExtension = chart.append("g")
      .attr("class", "link-extensions")
      .selectAll("path")
      .data(links.filter(function (d) {
        return !d.target.children;
      }))
      .enter().append("path")
      .each(function (d) {
        d.target.linkExtensionNode = this;
      })
      .attr("d", function (d) {

        if (option.treeType == 'radial')
          return stepRadial(d.target.x, d.target.y, d.target.x, innerRadius);

        if (option.treeType == 'linear')
          return stepLinear(d.target.x, d.target.y, d.target.x, d.target.y);
        //return d3_glyphEdge.d.taffy(d.target.x, d.target.y, d.target.x, d.target.y); 
      })
      .style("fill", "none")
      .style("stroke", function (d) {
        return color(d.target.name);
      })
      .style("stroke-width", function (d) {

        if (option.treeType == 'linear') {

          //	if(option.weightLinks == true){
          //		return link_weight(d.target.length)

          //else
          return 2;
        }

        if (option.treeType == 'radial') {
          return 2;
        }
      })
      .style("stoke-opacity", "0.25")
      .style("stroke-linecap", "round")
      .style("stroke-dasharray", function (d) {

        if (option.treeType == 'linear') {
          return 3.5;
        }

        if (option.treeType == 'radial') {
          return 0;
        }
      });

    link = chart.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", function (d) {

        if (option.treeType == 'radial')
          return stepRadial(d.source.x, d.source.y, d.target.x, d.target.y)
        if (option.treeType == 'linear')
          return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
      })
      .style("fill", "none")
      .style("stroke", function (d) {
        return color(d.target.name);
      })
      .style("stroke-linecap", "round")
      .style("opacity", ".7")
      .style("stroke-width", function (d) {

        if (option.treeType == 'linear') {
          if (option.weightLinks == true) {
            return link_weight(d.target.length)
          } else {
            return 3;
          }
        }

        if (option.treeType == 'radial') {
          return 4;
        }
      });
    //.style("stroke", function(d) { return d.target.color; });

    if (option.treeType == 'linear') {

      node = chart.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", function (d) {
          if (d.children) {
            if (d.depth == 0) {
              return "root-node";
            } else {
              return "inner-node";
            }
          } else {
            return "leaf-node";
          }
          "#1d91c0", "#225ea8", "#EFD5D9", "#EFD5D9"
        })
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        })


      //Appending circle at leaf nodes
      nodeCircle = chart.selectAll('.leaf-node').append("circle")
        .attr("r", function (d) {
          // console.log(d)
          if (option.nodeSize == true) return d.value * 30;
          else
            return 2.5;
        })
        .style("stroke", function (d) {
          return color(d.name);
        })
        .style("stroke-width", "1px")
        .style("fill-opacity", "0.8")
        .style("fill", function (d) {
          return color(d.name);
        });

      var innerNode;

      if (option.subTree == true) {

        chart.selectAll('.inner-node')
          .on("click", getSubTree);

        chart.selectAll('.leaf-node')
          .on("click", reset);
      }

      if (option.collapseTree == true) {

        chart.selectAll('.inner-node')
          .on("click", click);

        chart.selectAll('.leaf-node')
          .on("click", reset);
      }

      if (option.nodeShape == 'rect') {
        innerNode = chart.selectAll('.inner-node').append("rect")
          .attr("width", 3)
          .attr("height", 2);
      }

      if (option.nodeShape == 'circle' || option.subTree == true || option.collapseTree == true) {
        innerNode = chart.selectAll('.inner-node').append("circle")
          .attr("r", 2);
      }

      // Add style to nodeshape
      // Setting fill, stroke, opacity 
      if (option.nodeShape) {

        innerNode
          .style("stroke", function (d) {
            return color(d.name);
          })
          .style("stroke-width", "1px")
          .style("fill-opacity", "0.8")
          .style("fill", function (d) {
            return color(d.name);
          });
      }

      //Adding text to node 
      node.append("text")
        .attr("dx", function (d) {
          return d.children ? -5 : 4;
        })
        .attr("dy", function (d) {
          if (!d.children) {
            if (option.linkValue == true)
              return 8;
          }
        })
        .attr("text-anchor", function (d) {
          return d.children ? "end" : "start";
        })
        .style("font-size", "7px")
        .style("fill", "#000")
        .text(function (d) {
          if (d.children) {
            if (option.linkValue == true)
              return d.length;
            if (option.linkName == true)
              return d.name;
          }
        })


    } //end of linear tree options setting


    // Creating text labels for each leaf node
    // Appending g text lables to chart svg at leaf nodes
    if (!option.labelHide) {
      textNode = chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes.filter(function (d) {
          return !d.children;
        }))
        .enter().append("text")
        .attr("dy", ".35em")
        .attr("transform", function (d) {

          if (option.treeType == 'linear')
            return "translate(" + 257 + "," + (d.x + 3) + ")";

          if (option.treeType == 'radial')
            return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 5) + ",0)" + (d.x < 180 ? "" : "");
        })

        .style("text-anchor", function (d) {
          return "start";
        })
        .style("font-size", "8px")
        .style("fill", function (d) {
          if (option.textColor == false)
            return "#000";
          if (option.textColor == true)
            return color(d.name);
        })
        //.style("fill", "#000")
        .style("font-weight", "bold")
        .text(function (d) {
          return d.name;
        })
        .each(function (d) {
          var bbox = this.getBBox();
          textBox = Math.max(bbox.width, textBox);
        })

      //Creating rectangle box for text background
      // Appending g rect to chart svg at leaf nodes

      if (option.treeType == 'linear') {
        textLabel = chart.append("g")
          .attr("class", "labels-rect")
          .selectAll("rect")
          .data(nodes.filter(function (d) {
            return !d.children;
          }))
          .enter().append("rect")
          .attr("y", -5)
          .attr("width", textBox + 5)
          .attr("height", 15)
          .attr("transform", function (d) {
            return "translate(" + 255 + "," + d.x + ")"
          })
          .style("fill", function (d) {
            return color(d.name);
          })
          .style("opacity", "0.3");
      }
    }
    //Creating box for text background
    // Appending g pie to chart svg at leaf nodes
    if (option.treeType == 'radial') {

      var phylumArc = d3.svg.arc()
        .outerRadius(innerRadius + textBox)
        .innerRadius(innerRadius + 5);

      var phylumSlice = chart.append("g")
        .selectAll("path")
        .data(pieMap(nodes.filter(function (d) {
          return !d.children;
        })))
        .enter().append("path")
        .attr("fill", function (d) {
          return color(d.data.parent.name);
        })
        .style("opacity", "0.8")
        .attr("d", phylumArc)
        .style("opacity", "0.4");

    }

    if (heatData) {

      if (option.treeType == "linear")
        addHeatMap(heatData);

      if (option.treeType == "radial")
        addCHeatMap(heatData);
    }

    if (barData) {
      //console.log(barData)
      for (var i = 0; i < barData.length; i++)
        addBarChart(barData[i]);
    }

    if (stackBarData)
      addStackBar(stackBarData);

    if (domainData)
      addGeneTree(domainData);

    if (geneData)
      addGeneTree(geneData);

    if (addSeq) {
      var seqData = alignData(addSeq);
      addSeqAlign(seqData);
    }

    if (addSun)
      drawSunburst();

    if (pieData)
      addPieChart(pieData);

    if (imageData)
      addImage(imageData);

  } // end of update

  // Function to reset tree 
  // To be used along with getSubTree()
  function reset() {
    updateTree(root)
  }

  // Getting the subtree after click on dendrogram node
  // Function is mainly for linear dendrogram
  function getSubTree(d) {
    updateTree(d);
  }

  function collapseNode(d) {

    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  //Scaling branch length 
  function scaleBranch(n, offset) {

    if (n.length != null) offset += n.length * 115;
    n.y = offset;
    if (n.children)
      n.children.forEach(function (n) {
        scaleBranch(n, offset);
      });
  } // end of scaleBranch 

  // Changing scaling of branch length on selection of input checkbox 
  // Changing transition of linkExtension, link and nodes
  // to scale after applying scaling function scaleBranch()
  function changed() {
    //clearTimeout(timeout);

    var checked = this.checked;

    if (option.treeType == 'linear') {
      // If checked apply branch scaling
      if (checked) scaleBranch(nodes[0], 100);

      //if unchecked rescale nodes using root data
      if (!checked) nodes = cluster.nodes(root);

      d3.transition().duration(750).each(function () {

        linkExtension.transition().attr("d", function (d) {
          return stepLinear(d.target.x, d.target.y, d.target.x, checked ? 250 : d.target.y);
        });
        link.transition().attr("d", function (d) {
          return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
        });
        node.transition().attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        })

        // option.nolinkExtend prevents linkExtend extension
        // Changing textNode and taxtlabel transform to scale text label 
        // and text node to scale according to scaling
        if (option.noLinkExtend == true) {
          linkExtension.transition().attr("d", function (d) {
            return stepLinear(d.target.x, d.target.y, d.target.x, checked ? d.target.y : d.target.y);
          });
          textNode.transition().attr("transform", function (d) {
            return "translate(" + (d.y + 5) + "," + (d.x + 3) + ")"
          })
          textLabel.transition().attr("transform", function (d) {
            return "translate(" + (d.y + 3) + "," + d.x + ")"
          })
          barChart.transition().attr("transform", function (d) {
            return "translate(" + 250 + "," + d.x + ")"
          })
        }
      });
    } //end of linear option

    if (option.treeType == 'radial') {
      console.log("change")
      d3.transition().duration(750).each(function () {
        linkExtension.transition().attr("d", function (d) {
          return stepRadial(d.target.x, checked ? d.target.radius : d.target.y, d.target.x, innerRadius);
        });
        link.transition().attr("d", function (d) {
          return stepRadial(d.source.x, checked ? d.source.radius : d.source.y, d.target.x, checked ? d.target.radius : d.target.y)
        });
      });
    } // end of radial option
  }

  /* Adding images to node
     
     Parameter :
     ===========
     - data : A array of object 
  		Object
  			image_path:"image/example.png"
  			name:"Node1"	//name of node
     
     Returns :
     =========
     - nothing
  */
  function addImage(imagedata) {
    console.log(imagedata)
    var image_data = d3.nest()
      .key(function (d) {
        return d.name;
      })
      .map(imagedata);

    // addimage to node at and of text label
    var imageNode = chart.append("g")
      .attr("class", "labels-image")
      .selectAll("image")
      .data(nodes.filter(function (d) {
        return !d.children;
      }))
      .enter().append("image")
      .attr("xlink:href", function (d, i) {

        if (image_data[d.name][0].image_path)
          return image_data[d.name][0].image_path;
      })
      .attr("x", textBox)
      .attr("y", -7)
      .attr("width", "20px")
      .attr("height", "20px")
      .attr("transform", function (d) {

        if (option.treeType == 'linear')
          return "translate(" + 270 + "," + d.x + ")";

        if (option.treeType == 'radial')
          return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 5) + ",0)";
      });
  }

  /* Adding sunburst to node
     
     Parameter :
     ===========
     - data : 
     
     Returns :
     =========
     - nothing
  */
  function drawSunburst() {

    var w = 25,
      h = 25,
      radius = Math.min(w, h) / 2;

    var x = d3.scale.linear()
      .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
      .range([0, radius]);

    var color = d3.scale.category20();

    var partition = d3.layout.partition()
      .value(function (d) {
        return 1;
      });

    var arc = d3.svg.arc()
      .startAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
      })
      .endAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
      })
      .innerRadius(function (d) {
        return Math.max(0, y(d.y));
      })
      .outerRadius(function (d) {
        return Math.max(0, y(d.y + d.dy));
      });
    //.padAngle(0.02);

    // Reset height and cluster size for adding pie chart
    newHeight = d3.max(levelWidth) * 70; // pixels per line
    cluster = cluster.size([newHeight, width - 350]);

    nodes = cluster.nodes(root);
    links = cluster.links(nodes);

    // Changing trnsition for linkextension, link, node, textNode 
    // and textlabel for new scale of cluster height  
    d3.transition().duration(750).each(function () {
      linkExtension.transition().attr("d", function (d) {
        return stepLinear(d.target.x, d.target.y, d.target.x, d.target.y);
      });
      link.transition().attr("d", function (d) {
        return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
      });
      node.transition().attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      textLabel.transition().attr("transform", function (d) {
        return "translate(" + 265 + "," + (d.x) + ")"
      })
      textNode.transition().attr("transform", function (d) {
        return "translate(" + 267 + "," + (d.x) + ")"
      })

    });


    var sunData = {

      "name": "tree",
      "children": [
        {
          "name": "data",
          "children": [
            {
              "name": "Null",
              "size": 64
            },
            {
              "name": "NullClass",
              "size": 89
            },
            {
              "name": "NullG",
              "size": 109
            },
            {
              "name": "NullGroup",
              "size": 153
            },
            {
              "name": "NullM",
              "size": 174
            }
     			]
    		}]
    };

    //Appending circle at leaf nodes 
    var sunCircle = chart.selectAll('.leaf-node')
      .selectAll("path")
      .data(partition.nodes(sunData))
      .enter().append("path")
      .attr("d", arc)
      .style("opacity", "0.7")
      .style("fill", function (d) {
        return color(d.name)
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", "0.6px");

  } //end of draw sunburst at node

  /* Function to add pie chart on leaf or inner nodes
	   
	   Usage :
	   ========
	   	var dendroChart = dendroGram()
                .pieData(piedata)
				
	   Parameter :
	   ===========
	   - data : Array of object
	   
			Object
			name :"Node1" //same as name of node
			type: "1"	//type is arc data
			value:"22"
	   
	   Returns :
	   =========
	   - nothing
	*/
  function addPieChart(piedata) {

    // Initializing variable and methods for creating pie chart
    // Make arc function to handle zero value of data 
    // in case null data is passed the start and end angles are optimized
    var radius = 10;
    var pieNode;
    var arc = d3.svg.arc()
      .outerRadius(function (d) {
        return radius;
      })
      .startAngle(function (d) {
        return isNaN(d.startAngle) ? 0 : d.startAngle;
      })
      .endAngle(function (d) {
        return isNaN(d.endAngle) ? 0 : d.endAngle;
      });

    var pie_data = d3.nest()
      .key(function (d) {
        return d.name;
      })
      .map(piedata);

    //add the pie at every node
    //add a dynamic data structure

    var nullData = [{
      "value": 0
                }];

    if (option.treeType == 'radial') {

      pieNode = chart.selectAll('g.nodes')
        .data(nodes.filter(function (d) {
          return !d.children;
        }))
        .enter()
        .append('g')
        .attr("transform", function (d) {
          return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + textBox + 10) + ",0)"
        });

    } //end of radial pie

    if (option.treeType == 'linear') {

      // Reset height and cluster size for adding pie chart
      newHeight = d3.max(levelWidth) * 70; // pixels per line
      cluster = cluster.size([newHeight, width - 350]);

      nodes = cluster.nodes(root);
      links = cluster.links(nodes);

      // Changing trnsition for linkextension, link, node, textNode 
      // and textlabel for new scale of cluster height  
      d3.transition().duration(750).each(function () {
        linkExtension.transition().attr("d", function (d) {
          return stepLinear(d.target.x, d.target.y, d.target.x, d.target.y);
        });
        link.transition().attr("d", function (d) {
          return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
        });
        node.transition().attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        })
        textLabel.transition().attr("transform", function (d) {
          return "translate(" + 265 + "," + (d.x) + ")"
        })
        textNode.transition().attr("transform", function (d) {
          return "translate(" + 267 + "," + (d.x) + ")"
        })
        //barChart.transition().attr("transform", function(d) { return "translate(" + 265 + "," + d.x + ")" })
      });

      //Using inner and leaf node for creating pie chart
      //selecting both inner and leaf classes 
      pieNode = chart.selectAll('.root-node, .leaf-node, .inner-node')

    } // end of linear pie

    //add the pie at every node
    pieNode.each(function (d) {

      d3.select(this)
        .selectAll("path")
        .data(function (d) {
          //console.log(pie_data)
          if (pie_data[d.name])
            return pie(pie_data[d.name]);
          else
            return pie(nullData);
        })
        .enter().append("path")
        .attr("d", arc)
        .style("opacity", "0.7")
        .style("fill", function (d, i) {
          return color(i)
        })
        .attr("transform", function (d) {

          //	return "translate(" + (40 + textBox) + ",0)" 
        })
      //.attr("stroke", "#fff");    
    })

    textBox = textBox + 20;
  } //end of addPieChart

  // function to add heatmap to linear dendrogram
  //Using rect svg element to draw the heatmap
  /* Function to add pie chart on leaf or inner node 
	   Usage :
	   ========
	   	var dendroChart = dendroGram()
                .heatData(piedata)
				
	   Parameter :
	   ===========
	   - data : Array of object
	   
			Object
			name:"Gene1"
			sample:"Hesperiidae"
			specificity:"0"
			value:"300"
	   
	   Returns :
	   =========
	   - nothing
	*/
  function addHeatMap(data) {

    var gridWidth = 40,
      gridHeight = 13.5;

    colorScale.domain([0, buckets - 1, d3.max(data, function (d) {
      return d.value;
    })])

    var geneName = [],
      sampleName = [];

    data.forEach(function (d) {
      //console.log(sampleName.indexOf(d.sample) )
      if (sampleName.indexOf(d.sample) == -1)
        sampleName.push(d.sample);

      if (geneName.indexOf(d.name) == -1)
        geneName.push(d.name)
    });

    //Pattern injection
    //Add diagonal hatch to the null data in heatmap 
    //http://bl.ocks.org/hugolpz/98cef20c4d7cb05c7b26
    //http://bl.ocks.org/PBrockmann/635179ff33f17d2d75c2

    var nullPattern = chart.append("defs")
      .append("pattern")
      .attr("id", "nullPattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr('width', 4)
      .attr('height', 4)
      //.attr("patternTransform", "rotate(60)")
      .append("path")
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('stroke', 'grey')
      .attr('stroke-width', 1.5);

    var pattern = chart.append("defs")
      .append("pattern")
      .attr("id", "diagonalHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr('width', 4)
      .attr('height', 4)
      //.attr("transform", "translate(0,0)")
      .append("path")
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('stroke', '#88AAEE')
      .attr('stroke-width', 1.5);

    var termLable = chart.append("g").selectAll(".termlableg")
      .data(sampleName)
      .enter()
      .append("text")
      .text(function (d) {
        return d;
      })
      .attr("x", function (d, i) {
        return i * (gridWidth) + (290 + gridWidth);
      })
      .attr("y", 250)
      .style("text-anchor", "start")
      .style('font-size', '10px')
      .attr("transform", function (d, i) {
        return "rotate(-45," + (i * (gridWidth) + gridWidth) + ",100)"
      })
      .attr("class", "termLabel mono")

    if (option.heatType == "rect") {

      var heatmap = chart.selectAll(".cellg")
        .data(data)
        .enter().append("rect")
        .attr("x", function (d) {

          return textBox + 270 + sampleName.indexOf(d.sample) * (gridWidth + 1)
        })
        .attr("y", function (d, i) {

          return 5 + geneName.indexOf(d.name) * (gridHeight + 3)
        })
        .attr("class", function (d) {
          if (d.specificity == 0) {
            return "cell cell-border cr" + (d.name - 1) + " cc" + (d.sample - 1);
          } else {
            return "cell-specific cell cell-border cr" + (d.name - 1) + " cc" + (d.sample - 1);
          }
        })
        .attr("width", gridWidth)
        .attr("height", gridHeight);

    }

    if (option.heatType == "circle" || option.heatType == "punchCard") {

      var heatmap = chart.selectAll(".cellg")
        .data(data)
        .enter().append("circle")
        .attr("cx", function (d) {
          return textBox + 270 + sampleName.indexOf(d.sample) * (gridWidth + 1)
        })
        .attr("cy", function (d, i) {
          return geneName.indexOf(d.name) * (gridHeight + 3)
        })
        .attr("class", function (d) {
          if (d.specificity == 0) {
            return "cell cell-border cr" + (d.name - 1) + " cc" + (d.sample - 1);
          } else {
            return "cell-specific cell cell-border cr" + (d.name - 1) + " cc" + (d.sample - 1);
          }
        })
        .attr("transform", function (d, i) {
          return "translate(" + ((gridWidth - 25) + ',' + (gridHeight) + ")");
        })
        .attr("r", function (d) {
          if (option.heatType == "punchCard")
            return Math.log2(d.value) + "px";
          else
            return "7px";
        });

    }

    heatmap.transition().duration(500)
      .style("fill", function (d) {

        if (option.heatType == "circle") {
          if (d.value == 0)
            return "url(#nullPattern)";

          if (d.value == 1)
            return "url(#diagonalHatch)";
        }

        if (option.heatType == "punchCard")
          return colorScale(Math.log2(d.value));

        if (option.heatType == "rect")
          return colorScale(Math.log2(d.value));

      });

  } //end of addHeatMap

  //Add heatmap to radial dendrogram
  //Using d3.arc to create heatmap blocks
  function addCHeatMap(heatdata) {

    console.log(textBox)
    var hData = d3.nest()
      .key(function (d) {
        return d.Name;
      })
      .entries(heatdata);

    colorScale.domain([0, buckets - 1, d3.max(heatdata, function (d) {
      return d.value;
    })])

    console.log(textBox)

    var inner = 6,
      outer = 15;
    for (var i = 0; i < 10; i++) {

      var heatMapArc = d3.svg.arc()
        .outerRadius(innerRadius + textBox + outer)
        .innerRadius(innerRadius + textBox + inner)
        .padAngle(0.002);

      var heatMapSlice = chart.append("g")
        .selectAll("path")
        .data(pieMap(nodes.filter(function (d) {
          return !d.children;
        })))
        .enter().append("path")
        .attr("fill", function (d) {
          return colorScale(heatData[i].value / 2);
        })
        .style("opacity", "0.8")
        .attr("d", heatMapArc)
        .style("opacity", "0.4");

      inner = inner + 10;
      outer = outer + 10;

    } //end of for loop

    textBox = textBox + outer
  } //end of radial heatmap

  /* function to get seq alignment object
     
     Parameter :
     ===========
     - data : MSA data (protein or DNA) 
     
     Returns :
     =========
     - Alignment object : containing seq name and sequence
  */
  function alignData(aligndata) {

    var seqObj = [];

    //Get the alignment data as array
    //Split the data at > sign
    var seq = aligndata.split(">")

    // Split the at new line and create an object with 
    // seqname and seq as array
    for (var i = 1; i < seq.length; i++) {

      var seqArr = seq[i].split("\n");

      //ADD MORE LINES USING FORLOOP
      var sequence = seqArr[1].split("");

      seqObj.push({
        "name": seqArr[0],
        "seq": sequence
      });

    }

    /*var data = d3.nest()
    			.key(function(d){
    				return d.name;
    			})
    			.map(seqObj);
    */
    return seqObj;
  } //end of alignData

  /* Function to add alignement sequence alogn with leaf nodes
     Add pan of the alignment svg element
     Parameter :
     ===========
     - data : Sequence alignment object 
     
     Returns :
     =========
     - nothing
  */
  function addSeqAlign(data) {

    var gridBox = 13;

    var rectBlock;

    //http://bl.ocks.org/tjdecke/5558084
    //click on a region highlights area above and below its length
    var seqRect = chart.selectAll(".domain-rect")
      .data(data, function (d) {
        return d.name;
      })
      .enter().append("g")

    seqRect.forEach(function (d) {

      var count;
      rectBlock = seqRect.selectAll("rect")
        .data(function (d) {

          return d.seq;
        })
        .enter()
        .append("rect")
        .attr("x", function (d, i) {

          if (option.colorBox == true)
            return textBox + 280 + (i) * (gridBox)

          if (option.colorBox == false)
            return textBox + 280 + (i) * (gridBox - 3) // for sequence domain no color box
          //return textBox + 280 + (domainName.indexOf(d.domain)) *(domainWidth(d.start));
        })
        .attr("y", function (d, i) {
          if (i == 0 && count == undefined)
            count = 0;

          if (i == 0 && count != undefined)
            count = count + 1;

          return (count - 0.5) * (gridBox + 8);
        })
        .attr("width", gridBox)
        .attr("height", gridBox)
        .style("fill", function (d, i) {

          //if colorbox is true select color for seq except the gap
          if (option.colorBox == true)
            if (d == "-")
              return "none";
            else
              return baseColor(d);

          //if colorbox is true select color grey for seq box 
          if (option.colorBox == false)
            if (d != "-")
              return "grey";
            else
              return "none";
        })
        .style("fill-opcity", "0.3")

      //Change rectangle border if color box is selected or not
      if (option.colorBox == true) {

        rectBlock.attr("rx", 2)
          .attr("ry", 2);
      }

      if (option.colorBox == false) {

        rectBlock.attr("rx", 2)
          .attr("ry", 6);
      }

    })


    var textSvg = chart.selectAll(".domain-text")
      .data(data, function (d) {
        return d.name;
      })
      .enter().append("g");

    textSvg.forEach(function (d) {

      var count;
      textBlock = textSvg.selectAll("text")
        .data(function (d) {
          return d.seq;
        })
        .enter()
        .append("text")
        .attr("x", function (d, i) {

          if (option.colorBox == true)
            return textBox + 283 + (i) * (gridBox);

          if (option.colorBox == false)
            return textBox + 285 + (i) * (gridBox - 3); // for sequence domain no color box
          //return textBox + 280 + (domainName.indexOf(d.domain)) *(domainWidth(d.start));
        })
        .attr("y", function (d, i) {
          if (i == 0 && count == undefined)
            count = 0;

          if (i == 0 && count != undefined)
            count = count + 1;

          return (count) * (gridBox + 8);
        })
        .style("fill", "black")
        .style("font-size", function (d) {

          if (option.colorBox == false)
            return "12px";

          if (option.colorBox == true)
            return "7px";
        })
        .text(function (d) {

          if (option.colorBox == false) // for sequence domain no color box
            if (d == "-")
              return d;

          if (option.colorBox == true) // for sequence domain with color box
            return d;
        });
    })

  } //end of sequence alignment

  //Add rectangle, circular or elipticle domain shape
  // Using gradient or color option for doain fill 
  // Domain of gene structure or protein type
  //Use color js for color selection
  /* Function to add alignement sequence alogn with leaf nodes
     
     Parameter :
     ===========
     - data : Sequence alignment object 
     
     Returns :
     =========
     - nothing
  */
  function addGeneTree(data) {

    //Domain color based on domain name
    var domainColor = d3.scale.ordinal().range(["#8dd3c7", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#b15928", "#e5c494", "#fccde5", "#bc80bd", "#ccebc5", "#ffed6f", "#1f78b4"]);

    var geneName = [],
      domainName = [];

    data.forEach(function (d) {

      if (geneName.indexOf(d.name) == -1)
        geneName.push(d.name)

      if (domainName.indexOf(d.feature) == -1)
        domainName.push(d.feature)

    })

    //
    var domainWidth = d3.scale.linear()
      .domain([0, 200])
      .range([0, 400]);

    var domainHeight = 10;

    // Gradient for solid and 3d svg object
    var gradient = chart.append("defs")
      .selectAll("radialGradient")
      .data(domainName)
      .enter()
      .append("radialGradient")
      .attr("id", function (d) {
        return "gradient-" + d;
      })
      .attr("cx", "35%")
      .attr("cy", "35%")
      .attr("r", "60%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", function (d) {
        return color(d);
      });

    gradient.append("stop")
      .attr("offset", "25%")
      .attr("stop-color", function (d) {
        return color(d);
      });

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", function (d) {
        return color(d.feature);
      });

    var domainLine = chart.selectAll(".domain-line")
      .data(geneName)
      .enter().append("line")
      .attr("x1", textBox + 270)
      .attr("x2", textBox + 470)
      .attr("y1", function (d, i) {
        return 12 + i * (domainHeight + 10)
      })
      .attr("y2", function (d, i) {
        return 12 + i * (domainHeight + 10)
      })
      //.attr("stroke", "url(#gradient)")
      .style("stroke", "lightgrey")
      .attr("fill", "none")
      .style("stroke-width", 1);

    //click on a region highlights area above and below its length
    var domainRect = chart.selectAll(".domain-rect")
      .data(data)
      .enter().append("rect")
      .attr("x", function (d) {
        //return textBox+350 + (d.domain - 1) *(domainWidth(d.start)+ domainWidth(d.end)/2);
        //return textBox + 268  + domainName.indexOf(d.domain) + domainWidth(d.start) ;
        return textBox + 268 + domainWidth(d.start);
      })
      .attr("y", function (d) {
        return 7 + (geneName.indexOf(d.name)) * (domainHeight + 10)
      })
      .attr("width", function (d) {
        return (domainWidth(d.end) - domainWidth(d.start));
        //return d.end- d.start ;   
      })
      .attr("height", domainHeight);

    if (option.domainType == "protein") {
      domainRect.attr("rx", 6)
        .attr("ry", 6)
    }

    if (option.domainType == "gene") {
      domainRect.attr("rx", 2)
        .attr("ry", 2)
    }

    if (option.domainFill == "gradient") {

      domainRect.attr('fill', function (d) {
        return 'url(#gradient-' + d.feature + ')';
      });
    }

    if (option.domainFill == "color") {

      domainRect.style("fill", function (d) {
        return domainColor(d.feature);
      });
    }

  } //end of domain visualization

  /* Function to add bar chart in dendrogram and radial chart
     One or multiple bar chart visualization
     
     Parameter :
     ===========
     - data : array of object
     
     Returns :
     =========
     - nothing
  */
  function addBarChart(bardata) {
    // console.log("bar chart")
    var data = d3.nest()
      .key(function (d) {
        return d.Name;
      })
      .map(bardata);

    barScale.domain([0, d3.max(bardata, function (d, i) {
      return d.value;
    })])

    colorCount = colorCount + 1;

    //creating bar chart for multiple data
    // Two option either have a single file or pass different file via call
    // in second case use a object to store all data as array to store the data
    // use for loop to itaerate the object and draw bar chart

    barChart = chart.append("g")
      .selectAll("rect")
      .data(nodes.filter(function (d) {
        return !d.children;
      }))
      .enter().append('rect')
      //.attr("x", xbarChart)
      .attr("x", textBox)
      .attr("y", -5)
      .attr("width", function (d, i) {
        //console.log(data)
        return barScale(data[d.name][0].value);
        //return ( 200 * d.length);
      })
      .attr("height", 7)
      .attr("transform", function (d) {

        if (option.treeType == 'linear')
          return "translate(" + 270 + "," + d.x + ")";

        if (option.treeType == 'radial')
          return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 5) + ",0)";
      })
      .style("fill", function () {
        return color(colorCount)
      });

    // Dynamically setting textbox for next chart object
    //Fix the numeric value to a dynamic object
    textBox = textBox + 50;

  } //end of addBarChart

  /* Function to add stack bar chart in dendrogram and radial chart
	
     Parameter :
     ===========
     - data : array of object
     
     Returns :
     =========
     - nothing
  */
  function addStackBar(stackdata) {
    console.log(stackdata)

    //var stackBar = chart.selectAll()
  }

  // Like d3.svg.diagonal but with square corners
  function stepLinear(sourceX, sourceY, targetX, targetY) {
    return "M" + sourceY + ',' + sourceX +
      "V" + targetX + "H" + targetY;
  } // end of stepLinear	

  // Like d3.svg.diagonal.radial, but with square corners.
  function stepRadial(startAngle, startRadius, endAngle, endRadius) {
    var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
      s0 = Math.sin(startAngle),
      c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
      s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0 +
      (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1) +
      "L" + endRadius * c1 + "," + endRadius * s1;
  } // end of stepRadial


  // Compute the new height, function counts total children of root node and sets tree height accordingly.
  // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
  var childCount = function (level, n) {

    if (n.branchset && n.branchset.length > 0) {
      if (levelWidth.length <= level + 1) levelWidth.push(0);

      levelWidth[level + 1] += n.branchset.length;
      n.branchset.forEach(function (d) {
        childCount(level + 1, d);
      });
    }
  };

  // Compute the maximum cumulative length of any node in the tree.
  function maxLength(d) {
    return d.length + (d.children ? d3.max(d.children, maxLength) : 0);
  }

  // Set the radius of each node by recursively summing and scaling the distance from the root.
  function setRadius(d, y0, k) {
    d.radius = (y0 += d.length) * k;
    if (d.children) d.children.forEach(function (d) {
      setRadius(d, y0, k);
    });
  }

  function uniqArray(a) {
    return a.filter(function (item, pos, ary) {
      return !pos || item != ary[pos - 1];
    })
  }

  // Function to parse tree data to object
  function parseNewick(a) {
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
      var n = s[t];
      switch (n) {
        case "(":
          var c = {};
          r.branchset = [c], e.push(r), r = c;
          break;
        case ",":
          var c = {};
          e[e.length - 1].branchset.push(c), r = c;
          break;
        case ")":
          r = e.pop();
          break;
        case ":":
          break;
        default:
          var h = s[t - 1];
          ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n))
      }
    }
    return r;
  }


  function pan(domNode, direction) {
    var speed = panSpeed;
    if (panTimer) {
      clearTimeout(panTimer);
      translateCoords = d3.transform(chart.attr("transform"));
      if (direction == 'left' || direction == 'right') {
        translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
        translateY = translateCoords.translate[1];
      } else if (direction == 'up' || direction == 'down') {
        translateX = translateCoords.translate[0];
        translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
      }
      scaleX = translateCoords.scale[0];
      scaleY = translateCoords.scale[1];
      scale = zoomListener.scale();
      chart.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
      d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
      zoomListener.scale(zoomListener.scale());
      zoomListener.translate([translateX, translateY]);
      panTimer = setTimeout(function () {
        pan(domNode, speed, direction);
      }, 50);
    }
  } // end of pan 

  function zoom() {
    chart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  } // end of zoom

  d3.select("#saveDendogram").on("click", exportAsImage);
  d3.select(self.frameElement).style("height", height + "px");

  // Toggle children on click.
  function click(d) {

    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    console.log(root)
    var temp_data = root;

    if (d.parent) {
      temp_data.branchset.forEach(function (element) {

        if (d == element) {
          //console.log(d);
          collapse(element);
        }
      });
    }

    update(temp_data)
  }

  function collapse(d) {

    if (d.branchset) {
      d._children = d.branchset;
      d._children.forEach(collapse);
      d.branchset = null;
    }

  }

  //Saving the svg element as png on save button 
  function exportAsImage() {

    // variable for image name
    var chartName, svg;

    // Getting svg name from this.id, replacing this.id by save
    // save prefix is for button and replacing it with sample to
    // get the svg chart div name 

    svg = document.querySelector('#dendogram svg');

    //
    var svgData = new XMLSerializer().serializeToString(svg);

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    canvas.height = height;
    canvas.width = width;

    var dataUri = '';
    dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);

    var img = document.createElement("img");

    img.onload = function () {
      ctx.drawImage(img, 0, 0);

      // Initiate a download of the image
      var a = document.createElement("a");

      a.download = "Dendogram" + ".png";
      a.href = canvas.toDataURL("image/png");
      document.querySelector("body").appendChild(a);
      a.click();
      document.querySelector("body").removeChild(a);

      // Image preview in case of "save image modal"

      /*var imgPreview = document.createElement("div");
        imgPreview.appendChild(img);
        document.querySelector("body").appendChild(imgPreview);
      */
    };

    img.src = dataUri;
  } //end of exportAsImage

  exports.height = function (_) {
    if (!argument.length) return height;
    height = _;
    return this;
  }

  exports.width = function (_) {
    if (!argument.length) return width;
    width = _;
    return this;
  }

  exports.option = function (_) {
    if (!arguments.length) return option;
    option = _;
    return this;
  }

  exports.imageData = function (_) {
    if (!arguments.length) return imageData;
    imageData = _;
    return this;
  }

  exports.barData = function (_) {
    if (!arguments.length) return barData;
    barData.push(_);
    return this;
  };

  exports.stackBarData = function (_) {
    if (!arguments.length) return stackBarData;
    stackBarData = _;
    return this
  }

  exports.heatData = function (_) {
    if (!arguments.length) return heatData;
    heatData = _;
    return this;
  }

  exports.pieData = function (_) {
    if (!arguments.length) return pieData;
    pieData = _;
    return this;
  }

  exports.domainData = function (_) {
    if (!arguments.length) return domainData;
    domainData = _;
    return this;
  }

  exports.geneData = function (_) {
    if (!arguments.length) return geneData;
    geneData = _;
    return this;
  }

  exports.addSun = function (_) {
    if (!arguments.length) return addSun;
    addSun = _;
    return this;
  }

  exports.addSeq = function (_) {
    if (!arguments.length) return addSeq;
    addSeq = _;
    return this;
  }



  return exports;
} //end of module

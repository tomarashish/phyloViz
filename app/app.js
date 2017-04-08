//parent and current node array for all data
var currentDataNode = [];
//Array for chart div element
var current_breadcrumbs;

function init(){
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 100) {        
            $('#return-to-top').fadeIn(200);    
        } else {
            $('#return-to-top').fadeOut(200);   
        }
    });
    $('#return-to-top').click(function() {     
        $('body,html').animate({
            scrollTop : 0             
        }, 500);
    });


    //Adding charts on created div elements
   // createChartOnDiv();
    
   dendrogram();
   //radialDendrogram();
} //end of init()


function linkWeight(){
    
     d3.text("data/test1.txt", function(error, tree){
          var options = {  
                    weightLinks : true, 
                    linkValue : false, 
                    linkName : false, 
                    nodeSize : false,
                    legend: false,
                    noLinkExtend: false,
                    treeType: 'linear',
                    nodeShape:'',
                    subTree: false,
                    collapseTree: false
                 };
        
        var dendroChart = dendroGram()
                .option(options);
        
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
         
}

function linkValue(){
    
     d3.text("data/test1.txt", function(error, tree){
          var options = {  
                    weightLinks :false, 
                    linkValue : true, 
                    linkName : true, 
                    nodeSize : false,
                    legend: false,
                    noLinkExtend: false,
                    treeType: 'linear',
                    nodeShape:'',
                    subTree: false,
                    collapseTree: false
                 };
        
        var dendroChart = dendroGram()
                .option(options);
        
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
         
}

function nodeSize(){
    
     d3.text("data/test1.txt", function(error, tree){
          var options = {  
                    weightLinks : false, 
                    linkValue : false, 
                    linkName : false, 
                    nodeSize : true,
                    legend: false,
                    noLinkExtend: false,
                    treeType: 'linear',
                    nodeShape:'',
                    subTree: false,
                    collapseTree: false
                 };
        
        var dendroChart = dendroGram()
                .option(options);
        
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
         
}

function subTree(){
    
     d3.text("data/test2.txt", function(error, tree){
          var options = {  
                    weightLinks : false, 
                    linkValue : false, 
                    linkName : false, 
                    nodeSize : false,
                    legend: false,
                    noLinkExtend: false,
                    treeType: 'linear',
                    nodeShape:'',
                    subTree: true,
                    collapseTree: false
                 };
        
        var dendroChart = dendroGram()
                .option(options);
        
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
         
}


function barData(){
    
     d3.text("data/test1.txt", function(error, tree){
        d3.csv("data/bar_data.csv", function(error, data){
			
			var dendroChart = dendroGram()
				.barData(data)
				.barData(data)
				.barData(data)
				.barData(data)	// calling barData multiple time with different data 
									//create seperate bar chart 
				.barData(data);
        
			var chartContainer = d3.select("#dendogram")
            		.datum(tree)
            		.call(dendroChart);
		})
	})
         
}

function stackedBarChart(){
    
     d3.text("data/test1.txt", function(error, tree){
        d3.csv("data/stackbar_data.csv", function(error, data){
			
			var dendroChart = dendroGram()
				.stackBarData(data);
        
			var chartContainer = d3.select("#dendogram")
            		.datum(tree)
            		.call(dendroChart);
		})
	})
         
}


function pieData(){
    
     d3.text("data/test2.txt", function(error, tree){
       //d3.text("/data/life.txt", function(error, tree){ 
		
        d3.csv("data/pie_data1.csv", function(error, piedata){ 
        	var dendroChart = dendroGram()
                //.heatData(heatMapData)
                .pieData(piedata)
            	//.barData(testdata);
        
        
       		var chartContainer = d3.select("#dendogram")
            	.datum(tree)
            	.call(dendroChart);
    	})
    })      
}

function sunCircle(){
    
     d3.text("data/test2.txt", function(error, tree){
		 
        var dendroChart = dendroGram()
            .addSun("true");
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
         
}

function domainChart(){
    
     d3.text("data/test2.txt", function(error, tree){
       d3.csv("data/domain_data.csv", function(error, domaindata){
         
		   var opt = {  
                    treeType: 'linear',
					domainFill : 'gradient',
					domainType: 'protein'
                };
		   
        	var dendroChart = dendroGram()
				.option(opt)
            	.domainData(domaindata);
        
       		var chartContainer = d3.select("#dendogram")
            	.datum(tree)
            	.call(dendroChart);
	 	})
    })
         
}

function geneChart(){
    
     d3.text("data/test2.txt", function(error, tree){
        d3.csv("data/gene_data.csv", function(error, genedata){
			 //var genedata = 
			 /*
				[{domain:1, name:'sample1', start:5, end:13},{domain:2, name:'sample1',  start:15, end:24},{domain:1, name:'sample2', start:30, end:40},{domain:2, name:'sample2',  start:25, end:30},{domain:1, name:'sample3', start:35, end:40},{domain:2, name:'sample3', start:18, end:24}];
			*/
			
			 var opt = { 
				  	treeType: 'linear',
					domainFill : 'color',
					domainType: 'gene'
                };
			
        	var dendroChart = dendroGram()
				//.option(opt)
            	.geneData(genedata);
        
       		var chartContainer = d3.select("#dendogram")
            	.datum(tree)
            	.call(dendroChart);
		 
		})
    })
         
}

function alignmentChart(){
    
     d3.text("data/test3.txt", function(error, tree){
        d3.text("data/alignment.txt", function(error, aligndata){
		
        	var dendroChart = dendroGram()
            	.addSeq(aligndata);
        
		 	var chartContainer = d3.select("#dendogram")
            	.datum(tree)
            	.call(dendroChart);
	 	})
	 })
         
}

function alignment1Chart(){
    
     d3.text("data/test3.txt", function(error, tree){
        d3.text("data/alignment.txt", function(error, aligndata){
		
			 var opt = { 
				  	treeType: 'linear',
				 	colorBox: false
                };
			
        	var dendroChart = dendroGram()
				.option(opt)
            	.addSeq(aligndata);
        
		 	var chartContainer = d3.select("#dendogram")
            	.datum(tree)
            	.call(dendroChart);
	 	})
	 })
         
}

function heatmap(){
    d3.text("data/test2.txt", function(error, tree){
    	//d3.csv("/data/bar_data.csv", function(error, bardata){
    		d3.csv("data/heat_data.csv", function(error, heatMapData){
       
        		var dendroChart = dendroGram()
				 	//.barData(bardata)
				  	.heatData(heatMapData);
        
        
       			var chartContainer = d3.select("#dendogram")
            		.datum(tree)
            		.call(dendroChart);
				
    		})// end of heatmap data
		//})//end of bar data
	})// end of tree data
}

function showImage(){
    d3.text("data/test2.txt", function(error, tree){
    	d3.csv("data/bar_data.csv", function(error, bardata){
    		d3.csv("data/image_data.csv", function(error, imageData){
       
				var opt = {
						labelHide: true,
						treeType: 'linear'
						};
				
        		var dendroChart = dendroGram()
					.option(opt)
					//.barData(bardata)
				  	.imageData(imageData);
        
        
       			var chartContainer = d3.select("#dendogram")
            		.datum(tree)
            		.call(dendroChart);
				
    		})// end of heatmap data
		})//end of bar data
	})// end of tree data
}

function heatmapWC(){
    d3.text("data/test2.txt", function(error, tree){
	
		var heatMapData = 
			[ {name:'gene1', sample:'place1', specificity:0, value:1},{name:'gene1', sample:'place2', specificity:0, value:1},{name:'gene1', sample:'place3', specificity:0, value:0},{name:'gene1', sample:'place4', specificity:0, value:1},{name:'gene1', sample:'place5', specificity:0, value:1},{name:'gene2', sample:'place1', specificity:0, value:1},{name:'gene2', sample:'place2', specificity:0, value:0},{name:'gene2', sample:'place3', specificity:0, value:1},{name:'gene2', sample:'place4', specificity:0, value:1},{name:'gene2', sample:'place5', specificity:0, value:0},{name:'gene3', sample:'place1', specificity:0, value:1},{name:'gene3', sample:'place2', specificity:0, value:0},{name:'gene3', sample:'place3', specificity:0, value:0},{name:'gene3', sample:'place4', specificity:0, value:0},{name:'gene3', sample:'place5', specificity:0, value:1},{name:'gene4', sample:'place1', specificity:0, value:1},{name:'gene4', sample:'place2', specificity:0, value:1},{name:'gene4', sample:'place3', specificity:0, value:0},{name:'gene4', sample:'place4', specificity:0, value:1},{name:'gene4', sample:'place5', specificity:0, value:1},{name:'gene5', sample:'place1', specificity:0, value:1},{name:'gene5', sample:'place2', specificity:0, value:0},{name:'gene5', sample:'place3', specificity:0, value:1},{name:'gene5', sample:'place4', specificity:0, value:1},{name:'gene5', sample:'place5', specificity:0, value:0},
			{name:'gene6', sample:'place1', specificity:0, value:1},{name:'gene6', sample:'place2', specificity:0, value:1},{name:'gene6', sample:'place3', specificity:0, value:0},{name:'gene6', sample:'place4', specificity:0, value:1},{name:'gene6', sample:'place5', specificity:0, value:1},{name:'gene7', sample:'place1', specificity:0, value:1},{name:'gene7', sample:'place2', specificity:0, value:0},{name:'gene7', sample:'place3', specificity:0, value:1},{name:'gene7', sample:'place4', specificity:0, value:1},{name:'gene7', sample:'place5', specificity:0, value:0},{name:'gene8', sample:'place1', specificity:0, value:1},{name:'gene8', sample:'place2', specificity:0, value:1},{name:'gene8', sample:'place3', specificity:0, value:0},{name:'gene8', sample:'place4', specificity:0, value:1},{name:'gene8', sample:'place5', specificity:0, value:1},{name:'gene9', sample:'place1', specificity:0, value:1},{name:'gene9', sample:'place2', specificity:0, value:0},{name:'gene9', sample:'place3', specificity:0, value:1},{name:'gene9', sample:'place4', specificity:0, value:1},{name:'gene9', sample:'place5', specificity:0, value:0},{name:'gene10', sample:'place1', specificity:0, value:1},{name:'gene10', sample:'place2', specificity:0, value:0},{name:'gene10', sample:'place3', specificity:0, value:0},{name:'gene10', sample:'place4', specificity:0, value:0},{name:'gene10', sample:'place5', specificity:0, value:1},{name:'gene11', sample:'place1', specificity:0, value:1},{name:'gene11', sample:'place2', specificity:0, value:1},{name:'gene11', sample:'place3', specificity:0, value:0},{name:'gene11', sample:'place4', specificity:0, value:1},{name:'gene11', sample:'place5', specificity:0, value:1},{name:'gene12', sample:'place1', specificity:0, value:1},{name:'gene12', sample:'place2', specificity:0, value:0},{name:'gene12', sample:'place3', specificity:0, value:1},{name:'gene12', sample:'place4', specificity:0, value:1},{name:'gene12', sample:'place5', specificity:0, value:0}
		];
		
		 var options = {  
                    treeType: 'linear',
                  	heatType : 'circle'
                 };
        
		
        var dendroChart = dendroGram()
				  .option(options)
				  .heatData(heatMapData);
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
	})
}

function punchCard(){
    d3.text("data/test2.txt", function(error, tree){
	
		var heatMapData = 
			[ {name:'gene1', sample:'place1', specificity:0, value:100},{name:'gene1', sample:'place2', specificity:0, value:50},{name:'gene1', sample:'place3', specificity:0, value:120},{name:'gene1', sample:'place4', specificity:0, value:181},{name:'gene1', sample:'place5', specificity:0, value:117},{name:'gene2', sample:'place1', specificity:0, value:151},{name:'gene2', sample:'place2', specificity:0, value:110},{name:'gene2', sample:'place3', specificity:0, value:123},{name:'gene2', sample:'place4', specificity:0, value:132},{name:'gene2', sample:'place5', specificity:0, value:120},{name:'gene3', sample:'place1', specificity:0, value:160},{name:'gene3', sample:'place2', specificity:0, value:43},{name:'gene3', sample:'place3', specificity:0, value:220},{name:'gene3', sample:'place4', specificity:0, value:236},{name:'gene3', sample:'place5', specificity:0, value:54},{name:'gene4', sample:'place1', specificity:0, value:250},{name:'gene4', sample:'place2', specificity:0, value:231},{name:'gene4', sample:'place3', specificity:0, value:20},{name:'gene4', sample:'place4', specificity:0, value:33},{name:'gene4', sample:'place5', specificity:0, value:31},{name:'gene5', sample:'place1', specificity:0, value:30},{name:'gene5', sample:'place2', specificity:0, value:240},{name:'gene5', sample:'place3', specificity:0, value:16},{name:'gene5', sample:'place4', specificity:0, value:200},{name:'gene5', sample:'place5', specificity:0, value:206},  {name:'gene6', sample:'place1', specificity:0, value:100},{name:'gene6', sample:'place2', specificity:0, value:50},{name:'gene6', sample:'place3', specificity:0, value:120},{name:'gene6', sample:'place4', specificity:0, value:181},{name:'gene6', sample:'place5', specificity:0, value:117},{name:'gene7', sample:'place1', specificity:0, value:151},{name:'gene7', sample:'place2', specificity:0, value:110},{name:'gene7', sample:'place3', specificity:0, value:123},{name:'gene7', sample:'place4', specificity:0, value:132},{name:'gene7', sample:'place5', specificity:0, value:120},{name:'gene8', sample:'place1', specificity:0, value:160},{name:'gene8', sample:'place2', specificity:0, value:43},{name:'gene8', sample:'place3', specificity:0, value:220},{name:'gene8', sample:'place4', specificity:0, value:236},{name:'gene8', sample:'place5', specificity:0, value:54},{name:'gene9', sample:'place1', specificity:0, value:250},{name:'gene9', sample:'place2', specificity:0, value:231},{name:'gene9', sample:'place3', specificity:0, value:20},{name:'gene9', sample:'place4', specificity:0, value:33},{name:'gene9', sample:'place5', specificity:0, value:31},{name:'gene10', sample:'place1', specificity:0, value:100},{name:'gene10', sample:'place2', specificity:0, value:50},{name:'gene10', sample:'place3', specificity:0, value:120},{name:'gene10', sample:'place4', specificity:0, value:181},{name:'gene10', sample:'place5', specificity:0, value:117},{name:'gene11', sample:'place1', specificity:0, value:100},{name:'gene11', sample:'place2', specificity:0, value:50},{name:'gene11', sample:'place3', specificity:0, value:120},{name:'gene11', sample:'place4', specificity:0, value:181},{name:'gene11', sample:'place5', specificity:0, value:117},{name:'gene12', sample:'place1', specificity:0, value:100},{name:'gene12', sample:'place2', specificity:0, value:50},{name:'gene12', sample:'place3', specificity:0, value:120},{name:'gene12', sample:'place4', specificity:0, value:181},{name:'gene12', sample:'place5', specificity:0, value:117},];
		
		 var options = {  
                    treeType: 'linear',
                  	heatType : 'punchCard'
                 };
        
		
        var dendroChart = dendroGram()
				  .option(options)
				  .heatData(heatMapData);
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
	})
}

function dendrogram(){
    
  	d3.text("data/coleoptera.txt", function(error, tree){
	// branch scaling issue with redering life.txt
   //d3.text("/data/life.txt", function(error, tree){
       
        var options = {  
                    weightLinks : false, 
                    linkValue : true, 
                    linkName : false, 
                    nodeSize : true,
                    legend: false,
                    noLinkExtend: false,
                    treeType: 'linear',
                    nodeShape:'',
                    subTree: false,
                    collapseTree: false,
					textColor : false
                 };
        
        
        var dendroChart = dendroGram();
            
        
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
}

function radialTree(){
	
	d3.text("data/life.txt", function(error, tree){
		d3.csv("/data/pie_data1.csv", function(error, piedata){
		d3.csv("/data/bar_data.csv", function(error, bardata){
				var opt = {treeType: 'radial'};
		
				var dendroChart = dendroGram()
						.option(opt)
						.pieData(piedata)
						.barData(bardata)
						.heatData(bardata)
				
				var chartContainer = d3.select("#dendogram")
							.datum(tree)
							.call(dendroChart);
			})
		})
	})
}

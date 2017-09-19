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

function tryExample(){

  d3.select("#loadFile").style("display","none");
   d3.select("#pasteUrl").style("display","none");
  d3.select("#exampleData").style("display", "block");
  
}

function loadData(){
  
   d3.select("#pasteUrl").style("display","none");
  d3.select("#exampleData").style("display", "none");
  d3.select("#loadFile").style("display","block");
  
}

function pasteUrl(){

  d3.select("#loadFile").style("display","none");
  d3.select("#exampleData").style("display", "none");
  d3.select("#pasteUrl").style("display", "block");
  
}

//Input file name display
$("input[id='upload_tree']").change(function (e) {
    var $this = $(this);
    $this.next().html($this.val().split('\\').pop());
});

//Input file name display
$("input[id='upload_metadata']").change(function (e) {
    var $this = $(this);
    $this.next().html($this.val().split('\\').pop());
});

//file upload 
var raw_data;
var readerTree = new FileReader();
var readerMetadata = new FileReader();


d3.select("#submit_file").on("click",function() {
    console.log(d3.select("#upload_tree")[0][0].files[0])
    console.log(d3.select("#upload_metadata")[0][0].files[0])
    readerTree.readAsText(d3.select("#upload_tree")[0][0].files[0]);
  readerMetadata.readAsText(d3.select("#upload_metadata")[0][0].files[0]);
  
  var tree_data, meta_data;
  
  readerTree.onload = function(event) {
	tree_data = event.target.result;
    
    readerMetadata.onload = function(event) {
	 meta_data = event.target.result;
      console.log(tree_data, meta_data)
      //var collection = tsvJSON(raw_data)
	//init(collection)
  }
  }
  pieData();
});

function linkWeight(){
    
     d3.text("./assets/data/test1.txt", function(error, tree){
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
    
     d3.text("./assets/data/test2.txt", function(error, tree){
       //d3.text("/data/life.txt", function(error, tree){ 
		
        d3.csv("./assets/data/pie_data1.csv", function(error, piedata){ 
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
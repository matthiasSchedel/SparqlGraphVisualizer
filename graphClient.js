/*
* @Author Matthias Schedel
*/ 

var graphClient = {
    graph:null,
    debug:false,
    showNodeLabel:true,
    showLinkLabel:true,
    nodeRadius:15,
    nodeDistance:50,
    selectionNode:"",
    selectionNodeObj:null,
    selectionNodeColor:"",
    selectionColor:"purple",
    nodeColors:{
        "sensor":"green",
        "product":"red",
        "machine":"blue",
        "sensordata":"yellow"
    }
};

graphClient.addNodeColors = function() 
{
    for (var i = 0; i < this.graph.sensors.length; i++) 
    {
        this.graph.sensors[i].color = this.nodeColors[this.graph.sensors[i].kind];
    }
};

graphClient.updateGraph = function(graph)
{
    graphClient.graph = graph;
    console.log(graphClient.graph.sensors);
    this.addNodeColors();   
    nodes = nodes.concat(graphClient.graph.sensors);// ,graph.products,graph.machines);
    simulation.nodes(nodes);
    simulation.force("link")
        .links(graphClient.graph.links);
    simulation.on("tick", update);
    update();
};

var canvas = d3.select("#network"),
    ctx = canvas.node().getContext("2d"),
    width = canvas.attr("width"),
    height = canvas.attr("height"),
    r = graphClient.nodeRadius,
    nodes = [],
    //color = d3.scaleOrdinal(d3.schemeCategory20),
    simulation = d3.forceSimulation()
        .force("x", d3.forceX(width/2))
        .force("y", d3.forceY(height/2))
        .force("collide", d3.forceCollide(graphClient.nodeDistance))
        .force("charge", d3.forceManyBody().strength(+20))
        .force("link", d3.forceLink().id(function(d) {
            return d.name;
        }));


/*
nodes = nodes.concat(graphClient.graph.sensors);// ,graph.products,graph.machines);
simulation.nodes(nodes);
simulation.force("link")
    .links(graphClient.graph.links);
simulation.on("tick", update);
*/
canvas
    .call(d3.drag()
        .container(canvas.node())
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));


function update() {
    //generateList(graphClient.graph.sensors);
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = "#aaa";// grey
    graphClient.graph.links.forEach(function(item) {
        if (document.getElementById("show_" + item.source.kind).checked && document.getElementById("show_" + item.target.kind).checked) {
            drawLink(item);
        }
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.globalAlpha = 1.0;
    if (document.getElementById("show_sensor").checked) {
        graphClient.graph.sensors.forEach(function(item) {
            if (item.kind == "sensor")
            {
                drawNode(item, item.color);
            } 
        });
    }
    if (document.getElementById("show_machine").checked) {
        graphClient.graph.sensors.forEach(function(item) {
            if (item.kind == "machine")
            {
                drawNode(item, item.color);
            } 
        });
    }
    if (document.getElementById("show_product").checked) {
        graphClient.graph.sensors.forEach(function(item) {
            if (item.kind == "product")
            {
                drawNode(item, item.color);
            } 
        });
    }
    if (document.getElementById("show_sensordata").checked) {
        graphClient.graph.sensors.forEach(function(item) {
            if (item.kind == "sensordata")
            {
                drawNode(item, item.color);
            } 
        });
    }
}

function dragsubject() {
    return simulation.find(d3.event.x, d3.event.y);
}
function drawNode(d, color) {
    // color = (typeof color === "undefined") ? "blue" : color;
    
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(d.x, d.y);
    ctx.arc(d.x, d.y, r, 0, 2*Math.PI);
    ctx.fill();
    if (document.getElementById("show_nodes").checked)
    {
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(d.name.split("#")[1],d.x - 23,d.y + 5);
    }
}
function drawLink(l) {
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    if (document.getElementById("show_links").checked)
    {
        var midX = (l.source.x + l.target.x)/2;
        var midY = (l.source.y + l.target.y)/2;
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(l.text,midX - 23,midY + 5);
    }

}
var selectNode = function(subject)
{
    document.getElementById("node_name").innerHTML = " " + subject.name;
    document.getElementById("node_type").innerHTML = " " + subject.type;
    if (graphClient.selectionNode != "") {
        graphClient.selectionNodeObj.color = graphClient.selectionNodeColor;
    } 
    graphClient.selectionNodeColor = subject.color;
    graphClient.selectionNodeObj = subject;
    graphClient.selectionNode = subject.name;
    subject.color = graphClient.selectionColor;
};

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    var subject = d3.event.subject; 
    subject.fx = subject.x;
    subject.fy = subject.y;
    if (subject.elemType == "node" && graphClient.selectionNode != subject.name) {
        selectNode(subject);
    }
}

function dragged() {
    if (graphClient.debug) { console.log("dragged"); }
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (graphClient.debug) { console.log("dragended"); }
    d3.event.subject.color = d3.event.subject.color;
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}

document.onchange = function() {
    update();
};

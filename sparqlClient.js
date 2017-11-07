/*
* @Author Matthias Schedel
*/ 

var sparqlClient = 
{
    debug:false,
    graph:null,
    shopfloorTypes:{
        "sensor":2,
        "machine":1,
        "product":3,
        "sensordata":4
    }
};

sparqlClient.doSparqlQuery = function(endpoint, query,callback,callback2) 
{       
    var url = endpoint + "?query=" + encodeURIComponent(query);
    if (sparqlClient.debug) { console.log(url); } 
    var mime = "application/sparql-results+json";
    d3.request(url)
        .mimeType(mime)
        .response(function(xhr) {callback(xhr.responseText); })
        .get(callback2);
};

var numberOfInstances = function(array, instance) 
{
    var numOfTrue = 0;
    for(var i=0;i<array.length;i++){
        if(array[i] == instance)
            numOfTrue++;
    }
    return numOfTrue;
};

sparqlClient.transformToGraph = function(jsonld)
{
    jsonld = JSON.parse(jsonld).results.bindings;
    if (sparqlClient.debug) { console.log("Graph to transform:", jsonld)}
    sparqlClient.graph = {
        uris:[],
        sensors:[],
        links:[]
    };
    
    for(var i = 0; i < jsonld.length; i++)
    {
        var obj = jsonld[i];
        var uri = obj[Object.keys(obj)[0]].value;
        if(sparqlClient.debug) {console.log("Object.keys(obj)[0]",Object.keys(obj)[0]);}
        var node = {
            id:obj[Object.keys(obj)[1]].value,
            name: uri,
            type:1,
            kind:Object.keys(obj)[0].toString(),
            color:"blue",
            elemType:"node"
        };
        var link = null
        sparqlClient.graph.uris[i] = uri;
        sparqlClient.graph.sensors[uri] = obj;
        sparqlClient.graph.sensors[i] = node;
        if(sparqlClient.debug) {console.log("Object.keys(obj)",Object.keys(obj)); }
       
        for (var j = 1; j < Object.keys(obj).length; j++)
        {
            if (obj[Object.keys(obj)[j]].type == "uri")
            {
                link = {
                    source:obj[Object.keys(obj)[0]].value.toString(),
                    text:Object.keys(obj)[j].toString(),
                    target:obj[Object.keys(obj)[j]].value.toString(),
                    elemType:"link"
                }; 
                sparqlClient.graph.links.push(link)
            }
        }
    }
    console.log("Graph.links:", sparqlClient.graph.links);
    if (sparqlClient.debug) 
    {
    console.log("Graph.sensors");
    console.log("Graph.nodes:", sparqlClient.graph.sensors);
    }
    
    graphClient.updateGraph(sparqlClient.graph);
}

sparqlClient.start = function() 
{
    var sparqlQuery = `PREFIX shopfloor: <http://localhost/shopfloor#>
    
    SELECT *
    WHERE { 
     { 
      ?sensor a shopfloor:sensor.
      ?sensor shopfloor:id ?sensor_id.
      ?sensor shopfloor:line_number ?line_number.
      ?sensor shopfloor:produces_data ?produces_data
      }
      UNION
      {
        ?sensordata a shopfloor:sensordata.
        ?sensordata shopfloor:id ?sensordata_id.
        ?sensordata shopfloor:data_unit ?data_unit.
        ?sensordata shopfloor:data_value ?data_value
      }
      UNION
      {
        ?product a shopfloor:product.
        ?product shopfloor:id ?product_id.
        ?product shopfloor:line_number ?product_line_number.
        ?product shopfloor:version ?product_version
    
      }
      UNION
      {
        ?machine a shopfloor:machine.
        ?machine shopfloor:id ?machine_id.
        ?machine shopfloor:line_number ?machine_line_number.
        ?machine shopfloor:version ?machine_version
      }
    } `;
    var endpoint = "http://0.0.0.0:3030/shopfloor/";
    var caller = function(result) {

        if (sparqlClient.debug) { console.log("Caller 2 called")}  
    };
    
    sparqlClient.doSparqlQuery(endpoint,sparqlQuery,sparqlClient.transformToGraph,caller);
};
sparqlClient.start();
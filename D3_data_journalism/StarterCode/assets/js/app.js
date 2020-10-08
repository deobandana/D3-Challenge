// @TODO: YOUR CODE HERE!
//create svg area
var svgWidth = 960;
var svgHeight = 500;

//create svg margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

//create a width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
//select id scatter for insert the scatter plot
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
//g specific class for D3 svg groups
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
//make what you want to show initially
//this calls from the key in the csv data set
var chosenYAxis = "healthcare";
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(state_data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(state_data, d => d[chosenXAxis]) * 0.8,
      d3.max(state_data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(state_data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(state_data, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis, newYScale, yAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  var leftAxis = d3.axisLeft(newYScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return xAxis, yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var x_label1 = "Poverty Rate:";
    var y_label1 = "Healthcare:"
  }
  if (chosenXAxis === "age") {
    var x_label1 = "Smokers:";
    var y_label1 = "Age:"
  }
  else {
    var x_label1 = "Smokers:";
    var y_label1 = "Age:"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return(`${d.abbr}<br>${x_label1} ${d[chosenXAxis]}<br>${y_label1} ${d[chosenYAxis]}<br>`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(state_data) {
  //if (err) throw err;

  // parse data as numeric data value by multiplying by 1
  state_data.forEach(function(data) {
    data.poverty = data.poverty * 1;
    data.healthcare = data.healthcare * 1;
    data.smokes = data.smokes * 1;
    data.age = data.age * 1;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(state_data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(state_data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(state_data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //this y axis with change if we add more
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty Rate");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age Range");

  // append y axis
  var healthcareLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Healthcare Rate");

  var smokersLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left/1.25)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokers")
    .classed("inactive", true)
    .text("Smokers Rate");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis || value !== chosenYAxis) {

        // replaces chosenXAxis or chosenYAxis with values
        if (["age", "poverty"].includes(value)){
          chosenXAxis = value;
        }
        else {
          chosenYAxis = value;
        }
        //console.log(chosenXAxis)

        // functions here found above csv import
        // updates x and y scale for new data
        xLinearScale = xScale(state_data, chosenXAxis);
        yLinearScale = yScale(state_data, chosenYAxis);

        // updates x and y axis with transition
        xAxis, yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokersLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokersLabel
            .classed("active", true)
            .classed("inactive", false);
        }else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});

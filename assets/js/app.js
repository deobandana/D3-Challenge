d3.select(window).on("resize", handleResize);

// When the browser loads, loadChart() is called
loadChart();

function handleResize() {
  var svgArea = d3.select("svg");

  // If there is already an svg container on the page, remove it and reload the chart
  if (!svgArea.empty()) {
    svgArea.remove();
    loadChart();
  }
}

function loadChart() {

// SVG wrapper dimensions are determined by the current width
// and height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;
  // var svgWidth = 960;
  // var svgHeight = 660;

  // Define the chart's margins as an object
  var margin = {
      top: 2,
      right: 10,
      bottom: 100,
      left: 80
  };

  //calculate chart area minus margins
  var width = svgWidth - margin.right - margin.left;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // function used for updating x-scale var upon click on axis label
  function xScale(inputData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(inputData, d => d[chosenXAxis]) * 0.8,
        d3.max(inputData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;

  }
 
  // function used for updating xAxis var upon click on axis label
  function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  } 

  // function used for updating y-scale var upon click on axis label
  function yScale(inputData, chosenYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(inputData, d => d[chosenYAxis]) * 0.8,
            d3.max(inputData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
  }

  // function used for updating yAxis var upon click on axis label
  function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles for change in x axis or y axis
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  //function used for updating state labels with a transition to new 
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    // x label
    //poverty percentage
    if (chosenXAxis === "poverty") {
      var xLabel = "Poverty:";
    }
    //age 
    else if (chosenXAxis === "age") {
      var xLabel = "Median Age:";
    }
    //household income 
    else {
      var xLabel = "Median Income:";
    }

    // y label
    // lacks healthcare percentage
    if (chosenYAxis === "healthcare") {
      var yLabel = "Lack Healthcare:";
    }
    //smokes percentage
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes:";
    }
    // obese percentage
    else {
        var yLabel = "Obese:";
    }
    
    //create tooltip
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([-8, 0])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}%`);
      });

    circlesGroup.call(toolTip);

    // add event
    circlesGroup
    // onmouseover event
      .on("mouseover", function(d, index) {
        toolTip.show(d);
      })
    // onmouseout event
      .on("mouseout", function(d, index) {
        toolTip.hide(d);
      });

    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv", function(err, inputData) {
    if (err) throw err;

    console.log(inputData);

    // parse data
    inputData.forEach(function(d) {
      d.obesity = +d.obesity;
      d.income = +d.income;
      d.smokes = +d.smokes;
      d.age = +d.age;
      d.healthcare = +d.healthcare;
      d.poverty = +d.poverty;

      console.log(d.obesity);
      console.log(d.income);
      console.log(d.smokes);
      console.log(d.age);
      console.log(d.healthcare);
      console.log(d.poverty);
    });

    // xLinearScale and yLinearScale functions above csv import
    var xLinearScale = xScale(inputData, chosenXAxis);
    var yLinearScale = yScale(inputData, chosenYAxis);

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
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(inputData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)
      .attr("fill", "blue")
      .attr("opacity", ".5");

    //append initial text
    var textGroup = chartGroup
      .selectAll(".stateText")
      .data(inputData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("dy", 3)
      .attr("font-size", "10px")
      .text(function(d){return d.abbr});
      
    // Create group for 3 x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    //create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0 - 20)
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text") 
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0 - 40)
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")   
      .attr("x", 0)
      .attr("y", 0 - 60)
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");
      
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(inputData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxesX(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update text with new x values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
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
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    //y axis labels event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value != chosenYAxis) {

          //replace chosenYAxis with value
          chosenYAxis = value;

          console.log(chosenYAxis)

          // functions here found above csv import
          //update y scale for new data
          yLinearScale = yScale(inputData, chosenYAxis);

          //update y axis with transition
          yAxis = renderAxesY(yLinearScale, yAxis);

          //update circles with new y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update text with new y values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

          //update tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          //change classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);  
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);          
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
              }
          else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);  
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);          
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
              }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);  
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);          
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });
}
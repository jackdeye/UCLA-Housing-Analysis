// scatter.js - Interactive scatter plot for UCLA Housing Analysis
// Usage: import and call renderScatterPlot(containerId, data)

export function renderScatterPlot(containerId, data) {
    const margin = { top: 40, right: 150, bottom: 60, left: 70 };
    const width = 800;
    const height = 500;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Variable labels
    const labels = {
        distance: "Distance to Campus (m)",
        density: "Avg. People per Room",
        hours_to_80: "Hours to 80% Full",
        building_age: "Building Age (years)",
        built_year: "Year Built"
    };

    // Clear container and create SVG
    const container = d3.select(`#${containerId}`);
    container.html('');

    const svg = container
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Initialize scales
    const xScale = d3.scaleLinear().range([0, chartWidth]);
    const yScale = d3.scaleLinear().range([chartHeight, 0]);
    const colorScale = d3.scaleSequential(d3.interpolateCool)
        .domain(d3.extent(data, d => d.hours_to_80).reverse());

    // Create axes groups
    const xAxisG = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`);

    const yAxisG = g.append('g')
        .attr('class', 'y-axis');

    // Create axis labels
    const xLabel = g.append('text')
        .attr('class', 'x-label')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .attr('fill', '#333');

    const yLabel = g.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -chartHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .attr('fill', '#333');

    // Create regression line
    const regressionLine = g.append('path')
        .attr('class', 'regression-line')
        .style('stroke', '#333')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5')
        .style('fill', 'none')
        .style('opacity', 0);

    // Create regression info text
    const regressionText = g.append('text')
        .attr('class', 'regression-text')
        .attr('x', 10)
        .attr('y', 20)
        .style('font-size', '11px')
        .style('fill', '#333')
        .style('opacity', 0);

    // Create tooltip
    const tooltip = d3.select('body').selectAll('.scatter-tooltip')
        .data([0])
        .join('div')
        .attr('class', 'scatter-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('max-width', '250px');

    // Add legend
    addLegend(g, chartWidth, colorScale);

    // Calculate regression
    function calculateRegression(xKey, yKey) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        data.forEach(d => {
            const x = d[xKey];
            const y = d[yKey];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });

        const denominator = (n * sumXX - sumX * sumX);
        if (denominator === 0) return null;

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R²
        const meanY = sumY / n;
        let ssTotal = 0, ssResidual = 0;

        data.forEach(d => {
            const x = d[xKey];
            const y = d[yKey];
            const yPred = slope * x + intercept;
            ssTotal += (y - meanY) ** 2;
            ssResidual += (y - yPred) ** 2;
        });

        const r2 = 1 - (ssResidual / ssTotal);
        return { slope, intercept, r2 };
    }

    // Update chart based on selected variables
    function updateChart() {
        const xVar = d3.select("#scatter-x").property("value");
        const yVar = d3.select("#scatter-y").property("value");

        // Update scales
        xScale.domain(d3.extent(data, d => d[xVar])).nice();
        yScale.domain(d3.extent(data, d => d[yVar])).nice();

        // Update axes
        xAxisG.transition().duration(750)
            .call(d3.axisBottom(xScale));

        yAxisG.transition().duration(750)
            .call(d3.axisLeft(yScale));

        // Update labels
        xLabel.text(labels[xVar] || xVar);
        yLabel.text(labels[yVar] || yVar);

        // Update circles
        const circles = g.selectAll('.dot')
            .data(data, d => d.location);

        circles.exit()
            .transition().duration(750)
            .attr('r', 0)
            .remove();

        const circlesEnter = circles.enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', 0)
            .attr('fill', d => colorScale(d.hours_to_80))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');

        circles.merge(circlesEnter)
            .transition().duration(750)
            .attr('cx', d => xScale(d[xVar]))
            .attr('cy', d => yScale(d[yVar]))
            .attr('r', 7);

        // Add interactivity
        g.selectAll('.dot')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition().duration(200)
                    .attr('r', 10)
                    .attr('stroke-width', 3);

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);

                tooltip.html(`
                    <strong>${d.location}</strong><br/>
                    ${labels[xVar] || xVar}: ${typeof d[xVar] === 'number' ? d[xVar].toFixed(1) : d[xVar]}<br/>
                    ${labels[yVar] || yVar}: ${typeof d[yVar] === 'number' ? d[yVar].toFixed(1) : d[yVar]}<br/>
                    Time to 80%: ${d.hours_to_80.toFixed(1)} hours
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition().duration(200)
                    .attr('r', 7)
                    .attr('stroke-width', 2);

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            });

        // Calculate and draw regression line
        const regression = calculateRegression(xVar, yVar);

        if (regression) {
            const xDomain = xScale.domain();
            const x1 = xDomain[0];
            const x2 = xDomain[1];
            const y1 = regression.slope * x1 + regression.intercept;
            const y2 = regression.slope * x2 + regression.intercept;

            const lineGenerator = d3.line()
                .x(d => xScale(d.x))
                .y(d => yScale(d.y));

            regressionLine
                .datum([{ x: x1, y: y1 }, { x: x2, y: y2 }])
                .transition().duration(750)
                .attr('d', lineGenerator)
                .style('opacity', 0.7);

            // Update regression text
            const r2 = regression.r2.toFixed(3);
            regressionText
                .text(`R² = ${r2}`)
                .transition().duration(750)
                .style('opacity', 1);
        } else {
            regressionLine.style('opacity', 0);
            regressionText.style('opacity', 0);
        }
    }

    // Add event listeners to dropdowns
    d3.select("#scatter-x").on("change", updateChart);
    d3.select("#scatter-y").on("change", updateChart);

    // Initial render
    updateChart();
}

// Helper function to add color legend
function addLegend(g, chartWidth, colorScale) {
    const legendWidth = 100;
    const legendHeight = 15;
    const legendX = chartWidth + 20;
    const legendY = 0;

    const legend = g.append('g')
        .attr('class', 'color-legend')
        .attr('transform', `translate(${legendX},${legendY})`);

    // Legend title
    legend.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .style('font-size', '11px')
        .style('font-weight', '600')
        .text('Hours to 80% Fill');

    // Create gradient
    const gradient = g.append('defs')
        .append('linearGradient')
        .attr('id', 'color-gradient-scatter')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

    const domain = colorScale.domain();
    const numStops = 10;

    for (let i = 0; i <= numStops; i++) {
        const offset = (i / numStops) * 100;
        const value = domain[0] + (domain[1] - domain[0]) * (i / numStops);
        gradient.append('stop')
            .attr('offset', `${offset}%`)
            .attr('stop-color', colorScale(value));
    }

    // Draw legend rectangle
    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#color-gradient-scatter)')
        .style('stroke', '#ccc')
        .style('stroke-width', 1);

    // Add legend axis
    const legendScale = d3.scaleLinear()
        .domain(domain)
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(3)
        .tickFormat(d => d.toFixed(0) + 'h');

    legend.append('g')
        .attr('transform', `translate(0,${legendHeight})`)
        .call(legendAxis)
        .style('font-size', '9px');
}

// Helper function to populate dropdowns with available variables
export function setupScatterControls(data) {
    // Get numeric variables from data
    const numericKeys = Object.keys(data[0]).filter(key => {
        const value = data[0][key];
        return typeof value === 'number';
    });

    // Variable labels for display
    const labels = {
        distance: "Distance to Campus (m)",
        density: "Avg. People per Room",
        hours_to_80: "Hours to 80% Full",
        building_age: "Building Age (years)",
        built_year: "Year Built"
    };

    // Setup dropdowns
    const xSelect = d3.select("#scatter-x");
    const ySelect = d3.select("#scatter-y");

    // Populate x-axis dropdown
    xSelect.selectAll("option").remove();
    numericKeys.forEach(key => {
        xSelect.append("option")
            .attr("value", key)
            .text(labels[key] || key.replace(/_/g, ' '))
            .property("selected", key === "distance");
    });

    // Populate y-axis dropdown
    ySelect.selectAll("option").remove();
    numericKeys.forEach(key => {
        ySelect.append("option")
            .attr("value", key)
            .text(labels[key] || key.replace(/_/g, ' '))
            .property("selected", key === "density");
    });
}

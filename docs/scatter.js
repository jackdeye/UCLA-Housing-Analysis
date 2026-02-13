// Interactive scatter plot for density vs distance
import { margin } from './config.js';

export class ScatterPlot {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.width = 700;
        this.height = 500;
        this.margin = { top: 40, right: 40, bottom: 60, left: 80 };
    }

    render() {
        const container = d3.select(`#${this.containerId}`);
        container.html('');

        const svg = container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;

        // Scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.distance))
            .nice()
            .range([0, chartWidth]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.density))
            .nice()
            .range([chartHeight, 0]);

        // Color scale based on hours to 80% (faster = cooler color, slower = warmer)
        const colorScale = d3.scaleSequential(d3.interpolateCool)
            .domain(d3.extent(this.data, d => d.hours_to_80).reverse());

        // Tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'scatter-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '12px')
            .style('border-radius', '4px')
            .style('font-size', '13px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('max-width', '250px');

        // Grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale)
                .tickSize(-chartHeight)
                .tickFormat('')
            )
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3);

        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-chartWidth)
                .tickFormat('')
            )
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3);

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', chartWidth / 2)
            .attr('y', 45)
            .attr('fill', '#333')
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text('Distance to Campus Centroid (meters)');

        g.append('g')
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -chartHeight / 2)
            .attr('fill', '#333')
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text('Average People per Room');

        // Data points
        const dots = g.selectAll('.dot')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.distance))
            .attr('cy', d => yScale(d.density))
            .attr('r', 8)
            .attr('fill', d => colorScale(d.hours_to_80))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('r', 12)
                    .attr('stroke-width', 3);

                const amenities = [];
                if (d.parking) amenities.push('Parking');
                if (d.ac) amenities.push('AC');
                if (d.exercise_room) amenities.push('Exercise Room');
                if (d.fireplace) amenities.push('Fireplace');
                const amenitiesStr = amenities.length > 0 ? amenities.join(', ') : 'None';

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);

                tooltip.html(`
                    <strong>${d.location}</strong><br/>
                    Distance: ${d.distance.toFixed(0)} m<br/>
                    Density: ${d.density.toFixed(2)} people/room<br/>
                    Time to 80%: ${d.hours_to_80.toFixed(1)} hours<br/>
                    Built: ${d.built_year} (Age: ${d.building_age} years)<br/>
                    Amenities: ${amenitiesStr}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('r', 8)
                    .attr('stroke-width', 2);

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            });

        // Legend for color scale
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = chartWidth - legendWidth - 10;
        const legendY = 10;

        const legend = g.append('g')
            .attr('transform', `translate(${legendX},${legendY})`);

        const legendScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.hours_to_80).reverse())
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d => d.toFixed(0) + 'h');

        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'colorGradient')
            .attr('x1', '0%')
            .attr('x2', '100%');

        const minHours = d3.min(this.data, d => d.hours_to_80);
        const maxHours = d3.max(this.data, d => d.hours_to_80);
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
            const offset = (i / numStops) * 100;
            const value = maxHours - (maxHours - minHours) * (i / numStops);
            gradient.append('stop')
                .attr('offset', `${offset}%`)
                .attr('stop-color', colorScale(value));
        }

        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#colorGradient)');

        legend.append('g')
            .attr('transform', `translate(0,${legendHeight})`)
            .call(legendAxis)
            .style('font-size', '11px');

        legend.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -5)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .text('Time to 80% Fill');
    }
}


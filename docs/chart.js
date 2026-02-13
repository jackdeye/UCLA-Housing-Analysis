// Chart rendering and interaction module
import { colors, margin, width, height } from './config.js';

export class ChartRenderer {
    constructor(housingData) {
        this.housingData = housingData;
        this.currentMode = 'normalized';
        this.selectedCombos = [];
    }

    setMode(mode) {
        this.currentMode = mode;
    }

    addCombo(combo) {
        if (!this.selectedCombos.includes(combo)) {
            this.selectedCombos.push(combo);
            return true;
        }
        return false;
    }

    removeCombo(combo) {
        this.selectedCombos = this.selectedCombos.filter(c => c !== combo);
    }

    getSelectedCombos() {
        return this.selectedCombos;
    }

    updateChart() {
        d3.select('#chart').html('');

        if (this.selectedCombos.length === 0) return;

        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Clipping definition
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        const parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S');

        const allData = this.selectedCombos.map(combo => {
            const dataSubset = this.housingData[this.currentMode][combo];
            if (!dataSubset) return [];
            return dataSubset.map(d => ({
                date: parseDate(d.date),
                value: d.value,
                combo: combo
            }));
        });

        const validData = allData.filter(d => d.length > 0);
        if (validData.length === 0) return;

        // Scales
        const xDomainOriginal = [
            d3.min(validData, d => d3.min(d, p => p.date)),
            d3.max(validData, d => d3.max(d, p => p.date))
        ];

        const x = d3.scaleTime()
            .domain(xDomainOriginal)
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(validData, d => d3.max(d, p => p.value))])
            .nice()
            .range([height, 0]);

        // Smart time formatter
        const smartTimeFormat = (domain) => {
            const domainRange = domain[1] - domain[0];
            const oneDay = 24 * 60 * 60 * 1000;

            if (domainRange < 2 * oneDay) {
                return d3.timeFormat('%b %d %I:%M %p');
            } else {
                return d3.timeFormat('%b %d');
            }
        };

        // Axes
        const xAxis = svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .ticks(8)
                .tickFormat(smartTimeFormat(x.domain())));

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat('')
            );

        // Axis labels
        const yLabelText = this.currentMode === 'normalized' ? 'Percentage Left (%)' : 'Available Bed Spaces';

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .text('Date');

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .text(yLabelText);

        // Line generator
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value));

        // Chart body for zooming
        const chartBody = svg.append("g")
            .attr("clip-path", "url(#clip)");

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 20])
            .extent([[0, 0], [width, height]])
            .on("zoom", (event) => this.zoomed(event, x, xDomainOriginal, xAxis, smartTimeFormat, chartBody, y))
            .filter(function(event) {
                if (event.type === "wheel") return true;
                if (event.type === "mousedown") return true;
                if (event.type === "mousemove") return event.buttons > 0;
                return false;
            });

        const zoomRect = svg.insert("rect", "g")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .style("cursor", "grab")
            .call(zoom);

        // Draw lines
        const lines = chartBody.selectAll('.line')
            .data(validData)
            .enter()
            .append('path')
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke', (d, i) => colors[i % colors.length]);

        // Store lines and zoom for zooming function
        this.lines = lines;
        this.zoom = zoom;
        this.zoomRect = zoomRect;

        // Draw dots with hover
        this.drawDots(chartBody, validData, x, y);

        // Legend
        this.drawLegend(svg);
    }

    drawDots(chartBody, validData, x, y) {
        const dotsGroups = chartBody.selectAll('.dots-group')
            .data(validData)
            .enter()
            .append('g')
            .attr('class', 'dots-group');

        // Hit areas
        dotsGroups.selectAll('circle.hit-area')
            .data((d, i) => d.map(point => ({ ...point, colorIndex: i })))
            .enter()
            .append('circle')
            .attr('class', 'hit-area')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
            .attr('r', 8)
            .attr('fill', 'transparent')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mousemove', (event) => this.moveTooltip(event))
            .on('mouseout', (event, d) => this.hideTooltip(event, d));

        // Visible dots
        dotsGroups.selectAll('circle.visible-dot')
            .data((d, i) => d.map(point => ({ ...point, colorIndex: i })))
            .enter()
            .append('circle')
            .attr('class', 'visible-dot')
            .attr('data-index', d => d.colorIndex)
            .attr('data-point', d => `${d.combo}_${d.date.getTime()}`)
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
            .attr('r', 3)
            .attr('fill', d => colors[d.colorIndex % colors.length])
            .style('opacity', 0)
            .style('pointer-events', 'none');
    }

    showTooltip(event, d) {
        event.stopPropagation();
        const visibleDot = d3.select(event.currentTarget.parentNode)
            .select(`circle.visible-dot[data-index="${d.colorIndex}"][data-point="${d.combo}_${d.date.getTime()}"]`);
        visibleDot.style('opacity', 1);

        const tooltip = d3.select('#tooltip');
        const unit = this.currentMode === 'normalized' ? '%' : ' beds';

        tooltip.style('opacity', 1)
            .html(`<strong>${d.combo.split('_').join(' - ')}</strong><br/>
                   Date: ${d3.timeFormat('%b %d, %Y %I:%M %p')(d.date)}<br/>
                   ${this.currentMode === 'normalized' ? 'Remaining' : 'Available'}: ${d.value.toFixed(1)}${unit}`);
    }

    moveTooltip(event) {
        event.stopPropagation();
        d3.select('#tooltip')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    hideTooltip(event, d) {
        event.stopPropagation();
        const visibleDot = d3.select(event.currentTarget.parentNode)
            .select(`circle.visible-dot[data-index="${d.colorIndex}"][data-point="${d.combo}_${d.date.getTime()}"]`);
        visibleDot.style('opacity', 0);
        d3.select('#tooltip').style('opacity', 0);
    }

    zoomed(event, x, xDomainOriginal, xAxis, smartTimeFormat, chartBody, y) {
        let newX = event.transform.rescaleX(x);
        let newDomain = newX.domain();

        const domainWidth = newDomain[1] - newDomain[0];
        const originalWidth = xDomainOriginal[1] - xDomainOriginal[0];
        const scale = event.transform.k;
        let constrainedTransform = event.transform;

        if (domainWidth >= originalWidth) {
            constrainedTransform = d3.zoomIdentity;
            newX = x;
            newDomain = xDomainOriginal;
        } else {
            const minTranslateX = -x(xDomainOriginal[0]) * scale;
            const maxTranslateX = width - x(xDomainOriginal[1]) * scale;
            let translateX = Math.max(minTranslateX, Math.min(maxTranslateX, event.transform.x));

            if (translateX !== event.transform.x) {
                constrainedTransform = d3.zoomIdentity
                    .scale(scale)
                    .translate(translateX, event.transform.y);
                newX = constrainedTransform.rescaleX(x);
                newDomain = newX.domain();
            }
        }

        if (constrainedTransform !== event.transform &&
            (Math.abs(constrainedTransform.x - event.transform.x) > 0.1 ||
                Math.abs(constrainedTransform.k - event.transform.k) > 0.001)) {
            this.zoom.on("zoom", null);
            this.zoomRect.call(this.zoom.transform, constrainedTransform);
            this.zoom.on("zoom", (e) => this.zoomed(e, x, xDomainOriginal, xAxis, smartTimeFormat, chartBody, y));
        }

        xAxis.call(d3.axisBottom(newX).ticks(8).tickFormat(smartTimeFormat(newDomain)));

        this.lines.attr("d", d3.line()
            .x(d => newX(d.date))
            .y(d => y(d.value))
        );

        chartBody.selectAll('circle.visible-dot').attr('cx', d => newX(d.date));
        chartBody.selectAll('circle.hit-area').attr('cx', d => newX(d.date));
    }

    drawLegend(svg) {
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + 20}, 0)`);

        this.selectedCombos.forEach((combo, i) => {
            const parts = combo.split('_');
            const displayName = `${parts[0]}\n${parts[1]}\n${parts.slice(2).join(' ')}`;

            const legendItem = legend.append('g')
                .attr('class', 'legend-item')
                .attr('transform', `translate(0, ${i * 70})`);

            legendItem.append('line')
                .attr('x1', 0)
                .attr('x2', 20)
                .attr('y1', 0)
                .attr('y2', 0)
                .style('stroke', colors[i % colors.length])
                .style('stroke-width', 3);

            const text = legendItem.append('text')
                .attr('x', 25)
                .attr('y', 0)
                .style('font-size', '11px');

            displayName.split('\n').forEach((line, j) => {
                text.append('tspan')
                    .attr('x', 25)
                    .attr('dy', j === 0 ? 0 : '1.1em')
                    .text(line);
            });
        });
    }
}


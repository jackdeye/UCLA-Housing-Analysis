// Main application orchestration
import { colors } from './config.js';
import { FilterManager } from './filters.js';
import { ChartRenderer } from './chart.js';

let housingData = {};
let filterManager;
let chartRenderer;

// Load data and initialize
d3.json('housing_data.json').then(data => {
    housingData = data;

    // Initialize modules
    chartRenderer = new ChartRenderer(housingData);
    filterManager = new FilterManager(housingData, () => {
        populateDropdown();
    });

    filterManager.initialize();
    populateDropdown();
    setupEventListeners();
});

function setupEventListeners() {
    // View mode toggle
    d3.selectAll('input[name="viewMode"]').on('change', function() {
        chartRenderer.setMode(this.value);
        chartRenderer.updateChart();
    });

    // Combo selection
    d3.select('#combo-select').on('change', function() {
        const selected = this.value;
        if (selected && chartRenderer.addCombo(selected)) {
            updateSelectedItems();
            chartRenderer.updateChart();
        }
        this.value = '';
    });
}

function populateDropdown() {
    const select = d3.select('#combo-select');
    select.selectAll('option:not(:first-child)').remove();

    const keys = filterManager.getFilteredKeys();

    keys.forEach(key => {
        const parts = key.split('_');
        const building = parts[0];
        const gender = parts[1];
        const roomType = parts.slice(2).join(' ');
        const displayName = `${building} - ${gender} - ${roomType}`;

        select.append('option')
            .attr('value', key)
            .text(displayName);
    });
}

function updateSelectedItems() {
    const container = d3.select('#selected-items');
    container.html('');

    const selectedCombos = chartRenderer.getSelectedCombos();

    selectedCombos.forEach((combo, i) => {
        const parts = combo.split('_');
        const displayName = `${parts[0]} - ${parts[1]} - ${parts.slice(2).join(' ')}`;

        const item = container.append('div')
            .attr('class', 'selected-item')
            .style('background', colors[i % colors.length]);

        item.append('span').text(displayName);

        item.append('button')
            .attr('class', 'remove-btn')
            .text('×')
            .on('click', () => {
                chartRenderer.removeCombo(combo);
                updateSelectedItems();
                chartRenderer.updateChart();
            });
    });
}

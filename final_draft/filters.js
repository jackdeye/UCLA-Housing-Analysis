// Filter management for housing data
import { genderMap, getHousingType } from './config.js';

export class FilterManager {
    constructor(housingData, onFilterChange) {
        this.housingData = housingData;
        this.onFilterChange = onFilterChange;
        this.selectedGenders = [];
        this.selectedBuilding = '';
        this.selectedHousingTypes = ['On-Campus', 'University Apartments'];
    }

    initialize() {
        const keys = Object.keys(this.housingData['absolute'] || {});

        const genders = new Set();
        const buildings = new Set();

        keys.forEach(key => {
            const parts = key.split('_');
            if (parts.length >= 2) {
                buildings.add(parts[0]);
                genders.add(parts[1]);
            }
        });

        this.createHousingTypeFilters();
        this.createGenderFilters(Array.from(genders));
        this.setupBuildingSelect();
        this.updateBuildingDropdown();
    }

    createHousingTypeFilters() {
        const housingTypeFilters = d3.select('#housing-type-filters');
        housingTypeFilters.html('');

        ['On-Campus', 'University Apartments'].forEach(housingType => {
            housingTypeFilters.append('button')
                .attr('class', 'pill-button')
                .attr('data-housing-type', housingType)
                .text(housingType)
                .classed('active', this.selectedHousingTypes.includes(housingType))
                .on('click', (event) => {
                    const btn = event.currentTarget;
                    const housingTypeValue = btn.getAttribute('data-housing-type');
                    const isActive = d3.select(btn).classed('active');

                    if (isActive) {
                        this.selectedHousingTypes = this.selectedHousingTypes.filter(t => t !== housingTypeValue);
                        d3.select(btn).classed('active', false);
                    } else {
                        this.selectedHousingTypes.push(housingTypeValue);
                        d3.select(btn).classed('active', true);
                    }

                    this.updateBuildingDropdown();
                    this.onFilterChange();
                });
        });
    }

    createGenderFilters(genders) {
        const genderFilters = d3.select('#gender-filters');
        genderFilters.html('');

        genders.sort().forEach(gender => {
            const displayName = genderMap[gender] || gender;
            genderFilters.append('button')
                .attr('class', 'pill-button')
                .attr('data-gender', gender)
                .text(displayName)
                .on('click', (event) => {
                    const btn = event.currentTarget;
                    const genderValue = btn.getAttribute('data-gender');
                    const isActive = d3.select(btn).classed('active');

                    if (isActive) {
                        this.selectedGenders = this.selectedGenders.filter(g => g !== genderValue);
                        d3.select(btn).classed('active', false);
                    } else {
                        this.selectedGenders.push(genderValue);
                        d3.select(btn).classed('active', true);
                    }

                    this.onFilterChange();
                });
        });
    }

    setupBuildingSelect() {
        const buildingSelect = d3.select('#building-select');
        buildingSelect.on('change.building', () => {
            this.selectedBuilding = buildingSelect.property('value');
            this.onFilterChange();
        });
    }

    updateBuildingDropdown() {
        const keys = Object.keys(this.housingData['absolute'] || {});
        const buildings = new Set();

        keys.forEach(key => {
            const parts = key.split('_');
            if (parts.length >= 2) {
                buildings.add(parts[0]);
            }
        });

        let filteredBuildings = Array.from(buildings);
        if (this.selectedHousingTypes.length > 0) {
            filteredBuildings = filteredBuildings.filter(building => {
                const housingType = getHousingType(building);
                return housingType && this.selectedHousingTypes.includes(housingType);
            });
        }

        const buildingSelect = d3.select('#building-select');
        buildingSelect.selectAll('option:not(:first-child)').remove();

        filteredBuildings.sort().forEach(building => {
            buildingSelect.append('option')
                .attr('value', building)
                .text(building);
        });

        if (this.selectedBuilding && !filteredBuildings.includes(this.selectedBuilding)) {
            this.selectedBuilding = '';
            buildingSelect.property('value', '');
        }
    }

    getFilteredKeys() {
        let keys = Object.keys(this.housingData['absolute'] || {}).sort();

        if (this.selectedHousingTypes.length > 0) {
            keys = keys.filter(key => {
                const parts = key.split('_');
                if (parts.length < 1) return false;
                const building = parts[0];
                const housingType = getHousingType(building);
                return housingType && this.selectedHousingTypes.includes(housingType);
            });
        }

        if (this.selectedGenders.length > 0) {
            keys = keys.filter(key => {
                const parts = key.split('_');
                return parts.length >= 2 && this.selectedGenders.includes(parts[1]);
            });
        }

        if (this.selectedBuilding) {
            keys = keys.filter(key => {
                const parts = key.split('_');
                return parts.length >= 1 && parts[0] === this.selectedBuilding;
            });
        }

        return keys;
    }
}

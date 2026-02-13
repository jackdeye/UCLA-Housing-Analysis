// Configuration and constants for the housing visualization

export const colors = [
    '#2774AE', '#FFD100', '#FF6B35', '#004E89', '#8B1A1A',
    '#00A84F', '#9B59B6', '#E67E22', '#1ABC9C', '#34495E'
];

export const margin = { top: 20, right: 120, bottom: 60, left: 60 };
export const width = 460; // Chart area width - fits within 800px container with padding (460 + 60 + 120 = 640px, well within 760px content area)
export const height = 500 - margin.top - margin.bottom;

export const genderMap = {
    'Female': 'Female',
    'Male': 'Male',
    'Gender Inclusive': 'Inclusive',
    'Non-Binary': 'NB',
    'Other': 'Other'
};

export const onCampusBuildings = [
    'De Neve Plaza',
    'De Neve Residence Hall',
    'Dykstra Hall',
    'Hedrick Hall',
    'Hitch Suites',
    'Olympic / Centennial',
    'Rieber Hall',
    'Rieber Terrace',
    'Rieber Vista',
    'Saxon Suites',
    'Sproul Landing / Cove',
    'Hedrick Summit',
    'Sproul Hall',
    'Sunset Village'
];

export const universityApartments = [
    'Gayley Court Apartments',
    'Gayley Heights',
    'Glenrock Apartments',
    'Glenrock West Apartments',
    'Laurel',
    'Landfair Apartments',
    'Levering Terrace Apartments',
    'Landfair Vista Apartments',
    'Palo Verde',
    'Tipuana',
    'Westwood Chateau Apartments',
    'Westwood Palms Apartments'
];

export function getHousingType(building) {
    if (onCampusBuildings.includes(building)) {
        return 'On-Campus';
    } else if (universityApartments.includes(building)) {
        return 'University Apartments';
    }
    return null;
}

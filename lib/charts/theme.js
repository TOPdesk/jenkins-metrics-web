// FlatUI colors by http://flatuicolors.com
const TURQOISE = '#1abc9c';
const GREEN_SEA = '#16a085';
const EMERALD = '#2ecc71';
const NEPHRITIS = '#27ae60';
const PETER_RIVER = '#3498db';
const BELIZE_HOLE = '#2980b9';
const AMETHYST = '#9b59b6';
const WISTERIA = '#8e44ad';
const WET_ASPHALT = '#34495e';
const MIDNIGHT_BLUE = '#2c3e50';
const SUN_FLOWER = '#f1c40f';
const ORANGE = '#f39c12';
const CARROT = '#e67e22';
const PUMPKIN = '#d35400';
const ALIZARIN = '#e74c3c';
const POMEGRANATE = '#c0392b';
const CLOUDS = '#ecf0f1';
const SILVER = '#bdc3c7';
const CONCRETE = '#95a5a6';
const ASBESTOS = '#7f8c8d';

function buildResultToBackgroundColor(result) {
  switch (result) {
    case 'FAILURE':
      return POMEGRANATE;
    case 'SUCCESS':
      return NEPHRITIS;
    case 'UNSTABLE':
      return ORANGE;
    case 'ABORTED':
    default:
      return ASBESTOS;
  }
}

function buildResultToHoverBackgroundColor(result) {
  switch (result) {
    case 'FAILURE':
      return ALIZARIN;
    case 'SUCCESS':
      return EMERALD;
    case 'UNSTABLE':
      return SUN_FLOWER;
    case 'ABORTED':
    default:
      return CONCRETE;
  }
}

module.exports = {
  buildResultToBackgroundColor,
  buildResultToHoverBackgroundColor
};

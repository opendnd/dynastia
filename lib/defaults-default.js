/* eslint-disable */

const epithets = ['Accursed', 'Bad', 'Bald', 'Beautiful', 'Black', 'Blind', 'Bold', 'Brave', 'Chaste', 'Conqueror', 'Cruel', 'Evil', 'Fair', 'Fat', 'Fearless', 'Fortunate', 'Generous', 'Good', 'Great', 'Grim', 'Hairy', 'Handsome', 'Hermit', 'Holy', 'Just', 'Lame', 'Learned', 'Lion', 'Monk', 'Little', 'Lucky', 'Mad', 'Magnanimous', 'Magnificent', 'Merciful', 'Mighty', 'Mild', 'Navigator', 'Old', 'Peaceful', 'Pious', 'Proud', 'Prudent', 'Rash', 'Red', 'Rich', 'Short', 'Silent', 'Simple', 'Small', 'Stammerer', 'Steadfast', 'Stout', 'Strict', 'Strong', 'Tall', 'Terrible', 'Unfortunate', 'Valiant', 'White', 'Wild', 'Wise', 'Young'];
const inheritances = ['patrilineality', 'matrilineality', 'ambilineality'];

// these are the dice rolls for how many kids are in each generation
const fertility = {
  'Dragonborn' : 'd8',
  'Dwarf'      : 'd6',
  'Elf'        : 'd2',
  'Gnome'      : 'd6',
  'Half-Elf'   : 'd6',
  'Halfling'   : 'd8',
  'Half-Orc'   : 'd4',
  'Human'      : 'd8',
  'Tiefling'   : 'd2',
};

// these are the fertile ages for females
const fertilityAgeRange = {
  'Dragonborn' : '20-40',   // 20/40/60/80
  'Dwarf'      : '20-120',  // 20/60/260/360
  'Elf'        : '100-500', // 100/200/400/700
  'Gnome'      : '20-400',  // 20/100/300/500
  'Half-Elf'   : '20-80',   // 20/60/120/180
  'Halfling'   : '20-80',   // 20/40/100/160
  'Half-Orc'   : '12-30',   // 12/24/48/72
  'Human'      : '16-35',   // 16/32/64/96
  'Tiefling'   : '12-48',   // 12/48/84/120
};

// weight distribution for marriage
const marriageAgeGroupWeights = {
  //       : child / young / middle / old
  'male'   : [0.050, 0.785, 0.150 ,0.015], 
  'female' : [0.390, 0.605, 0.004, 0.001],
};

// lifelong age weights
const lifeAgeGroupWeights = {
  //       : child / young / middle / old
  'male'   : [0.01, 0.04, 0.35, 0.6],
  'female' : [0.01, 0.04, 0.15, 0.8],
};

// conception dice are used to determine how likely it is that a family will conceive that year
const conception = {
  'Dragonborn' : 'd4',
  'Dwarf'      : 'd12',
  'Elf'        : 'd100',
  'Gnome'      : 'd20',
  'Half-Elf'   : 'd12',
  'Halfling'   : 'd12',
  'Half-Orc'   : 'd6',
  'Human'      : 'd4',
  'Tiefling'   : 'd20',
};

const defaults = {
  epithets,
  inheritances,
  fertility,
  fertilityAgeRange,
  conception,
  marriageAgeGroupWeights,
  lifeAgeGroupWeights,
};

module.exports = defaults;

const colors = require('colors/safe');

const hr = '---------------------------------------------';

class Renderer {
  // render gender
  static gender(gender) {
    if (gender === 'female') return '♀';
    return '♂';
  }

  // render name
  static name(person) {
    const { name, DNA, birthYear, deathYear } = person;
    const { gender } = DNA;

    let birth = '';
    let death = '';

    if (birthYear) birth = Renderer.year(birthYear);
    if (deathYear) death = Renderer.year(deathYear);

    return `${name} ${Renderer.gender(gender)} (${birth} - ${death})`;
  }

  // render year
  static year(year = 0, yearFormat = 'BCE/CE') {
    const yearParts = yearFormat.split('/');
    const yearPre = yearParts[0];
    const yearPost = yearParts[1];

    if (year >= 0) return `${year} ${yearPost}`;
    return `${Math.abs(year)} ${yearPre}`;
  }

  static outputGeneration(generation, dynasty) {
    const { persons } = dynasty;
    let regnant;
    let consort;
    let output = '';

    if (generation.regnant) regnant = persons[generation.regnant];
    if (generation.consort) consort = persons[generation.consort];
    if (regnant && consort) {
      output += `\n${hr}\n`;
      output += `     Regnant : ${colors.cyan.bold.underline(Renderer.name(regnant))}\n`;
      output += `     Consort : ${colors.magenta(Renderer.name(consort))}\n`;
      if (regnant.marriageYear) output += `     Married : ${Renderer.year(regnant.marriageYear)}\n`;

      // output issue
      if (regnant.issue.length > 0) {
        output += '       Issue :\n';
        regnant.issue.forEach((childID) => {
          const child = persons[childID];
          const prepend = '             ';

          // output differently for heir
          if (child.isHeir) {
            output += colors.yellow.bold(`${prepend}* ${Renderer.name(child)}\n`);
          } else {
            output += `${prepend}- ${Renderer.name(child)}\n`;
          }
        });
      }
    }
    if (generation.heir) output += Renderer.outputGeneration(generation.heir, dynasty);

    return output;
  }

  static output(dynasty) {
    const {
      version,
      theme,
      race,
      inheritance,
      startingYear,
      name,
      generations,
      persons,
    } = dynasty;
    let output = `\n\n${hr}\nDynasty generated with Dynastia v${version}\n${hr}\n`;

    output += `  House Name : ${colors.bold(name)}\n`;
    output += `        Race : ${colors.bold(race)}\n`;
    output += `     Culture : ${colors.bold(theme)}\n`;
    output += ` Inheritance : ${colors.bold(inheritance)}\n`;
    output += `     Founded : ${colors.bold(startingYear)}\n`;
    output += ` No. Members : ${colors.bold(Object.keys(persons).length)}\n`;

    output += Renderer.outputGeneration(generations, dynasty);
    output += '\n';

    process.stdout.write(colors.white(output));
  }
}

module.exports = Renderer;

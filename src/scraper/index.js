const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/projects.json', 'utf-8'));
const fileName = './README.md';
const start_comment = '<!--categories:start-->';
const end_comment = '<!--categories:end-->';
const pattern = new RegExp(`${start_comment}[\\s\\S]*${end_comment}`, 'gm');

const groupBy = (list, key) => {
  return list.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const sortBy = (a, b) => {
  const levelOrder = ['basic', 'intermediate', 'advanced'];

  const aIndex = levelOrder.indexOf(a);
  const bIndex = levelOrder.indexOf(b);
  return aIndex - bIndex;
};

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const categories = groupBy(data, 'category');

const writeToFile = (text) => {
  var fs = require('fs')
  fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
          return console.log(err);
      }
      const replacement = `${start_comment}\n${text}\n${end_comment}`;
      var result = data.replace(pattern, replacement);

      fs.writeFile(fileName, result, 'utf8', function (err) {
          if (err) return console.log(err);
      });
  });
};

let  categoriesText = '';
Object.keys(categories).sort().forEach((c) => {
  const list = categories[c];
  const levels = groupBy(list, 'level');
  const sorted = Object.keys(levels).sort((a, b) => sortBy(a, b));
  const fileName = c.toUpperCase().replace(/ /, '_');
  const mapped = sorted.map((s) => {
    return `[${capitalize(s)}](./docs/${fileName}_${s.toUpperCase()}.md)`;
  });
  categoriesText += `- ${c}\n    - ${mapped.join('\n    - ')}\n`;
  sorted.forEach((l) => {
    const project = levels[l]
      .map((p) => {
        return (
          `  - [${p.display}](https://github.com/${p.author}/${p.name}) - ` +
          `[@${p.author}](https://github.com/${p.author})`
        );
      })
      .join('\n');
    const level = `${capitalize(l)}`;
    const current = `# ${c} - ${level}\n${project}`;
    fs.writeFileSync(
      `./docs/${fileName}_${l.toUpperCase()}.md`,
      current,
      'utf-8'
    );
  });
});

writeToFile(categoriesText);
const fs = require('fs');

const CLASSIFIEDS = 'test_classifieds.raw.json';
var dataClassifieds = fs.readFileSync(CLASSIFIEDS);
var classifieds = JSON.parse(dataClassifieds);

const expe = classifieds.filter((c) => c.eval.eval_types.includes("url_match"));

console.log(expe.length);

const expe2 = expe.filter((c) => c.image == null);

console.log(expe2.map((c) => [c.intent, c.task_id]));

const fs = require('fs');

const CLASSIFIEDS = 'test_classifieds.raw.json';
var dataClassifieds = fs.readFileSync(CLASSIFIEDS);
var classifieds = JSON.parse(dataClassifieds);

console.log(classifieds.length);

const EVAL_TYPE = "program_html";
//const EVAL_TYPE = "url_match";
expe = classifieds.filter((c) => c.eval.eval_types.includes(EVAL_TYPE));
console.log(expe.length);

const IMAGE = null;
expe = expe.filter((c) => c.image == IMAGE);
console.log(expe.length);

const LOGIN = true;
expe = expe.filter((c) => c.require_login == LOGIN);


console.log(expe.length);

console.log(expe.map((c) => [c.intent, c.task_id]));

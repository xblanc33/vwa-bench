//read JSON file
const fs = require('fs');
const http = require('http');
const server = http.createServer();



server.on('request', (req, res) => {

    const CLASSIFIEDS_VWA = './test_classifieds.raw.json';
    var dataTasks = fs.readFileSync(CLASSIFIEDS_VWA);
    var tasks = JSON.parse(dataTasks);

    const ACTION_VALIDATION = './action_validation.json';
    var dataValidations = fs.readFileSync(ACTION_VALIDATION);
    var validations = JSON.parse(dataValidations);

    if (req.url.startsWith('/tasks')) {
        let actionValidation = (req.url.split('=')[1] === 'true') || false;
        let html = `<html>
        <body>
        <h1>Tasks</h1>
        ${actionValidation ? `<a href="/tasks?actionValidation=false">All Tasks</a>` : `<a href="/tasks?actionValidation=true">Unvalidated Tasks</a>`}
        <form action="/task" method="get">
            <select name="task_id">`;
            tasks.forEach((task) => {
                if (!actionValidation || !validations.find((v) => v.task_id == task.task_id)) {
                    html += `<option value="${task.task_id}">${task.intent}</option>`;
                }
            });
            html += `</select>
            <button type="submit">Submit</button>
        </form>
        </body>
        </html>`;
        res.end(html);
    } else if (req.url.startsWith('/task')) {
        let task_id = req.url.split('=')[1];
        let task = tasks.find((task) => task.task_id == task_id);
        let html = `<html>
        <body>
        <h1>Task</h1>
        <p>Task ID: ${task.task_id}</p>
        <p>Intent: ${task.intent}</p>
        <p>Eval: ${JSON.stringify(task.eval)}</p>
        <p>Overall Difficulty: ${task.overall_difficulty}</p>
        <p><a href="/validation?task_id=${task.task_id}">Validation="${validations.find((v) => v.task_id == task.task_id)?'True':'False'}"</a></p>
        </body>
        </html>`;
        res.end(html);
    } else if (req.url.startsWith('/validation') && req.method === 'GET') {
        let task_id = req.url.split('=')[1];
        let task = tasks.find((task) => task.task_id == task_id);
        let validationsForTask = validations.filter((v) => v.task_id == task_id);
        let html = `<html>
        <body>
        <h1>Validations</h1>
        <p>Task ID: ${task.task_id}</p>
        <p>Intent: ${task.intent}</p>
        <p>Overall Difficulty: ${task.overall_difficulty}</p>
        <h2>Existing Path</h2>`;
        validationsForTask.forEach((validationForTask) => {
            validationForTask.paths.forEach((path, i) => {
                html += `<h3>Path - ${i + 1} <a href='/remove-path?task-id=${task.task_id}&path-number=${i}'>remove</a></h3>`;
                html += `<ul>`;
                path.forEach((step) => {
                    html += `<li>${step.kind} : ${step.target} (${step.value})</li>`;
                });
                html += `</ul>`;
            });
        });
        html += `<h2>Create a new Path</h2>`;
        html += `<form action="/validation" method="post">
            <div id="steps">
                <p>
                    <select>
                        <option value="click">Click</option>
                        <option value="fill">Fill</option>
                        <option value="fill">Scroll</option>
                    </select>
                    <input type="text" placeholder="Target">
                    <input type="text" placeholder="Value">
                </p>
            </div>
            <p><button id="addStep">Add New Step</button></p>
            <p><button id="submit-path" type="submit">Submit Path</button></p>
            </form>
        <script>
            document.getElementById('addStep').addEventListener('click', (e) => {
                e.preventDefault();
                let div = document.querySelector('#steps');
                let p = document.createElement('p');
                let sel = document.createElement('select');
                let option1 = document.createElement('option');
                option1.value = 'click';
                option1.text = 'Click';
                let option2 = document.createElement('option');
                option2.value = 'fill';
                option2.text = 'Fill';
                sel.appendChild(option1);
                sel.appendChild(option2);
                let input1 = document.createElement('input');
                input1.type = 'text';
                input1.placeholder = 'Target';
                let input2 = document.createElement('input');
                input2.type = 'text';
                input2.placeholder = 'Value';
                p.appendChild(sel);
                p.appendChild(input1);
                p.appendChild(input2);
                div.appendChild(p);
            });

            document.querySelector('form').addEventListener('submit', (e) => {
                e.preventDefault();
                let steps = document.querySelectorAll('#steps p');
                let path = [];
                steps.forEach((step) => {
                    let kind = step.querySelector('select').value;
                    let target = step.querySelector('input[type="text"]').value;
                    let value = step.querySelectorAll('input[type="text"]')[1].value;
                    path.push({ kind, target, value });
                });
                let task_id = ${task_id};
                fetch('/validation?task_id=${task_id}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ task_id, path })
                }).then(() => {
                    window.location.href = '/validation?task_id=${task_id}';
                });
            });
            
        </script>
        </body>
        </html>`;
        res.end(html);
    } else if (req.url.startsWith('/validation') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let { task_id, path } = JSON.parse(body);
            let validation = validations.find((v) => v.task_id == task_id);
            if (!validation) {
                validation = { task_id, paths: [] };
                validations.push(validation);
            }
            validation.paths.push(path);
            fs.writeFileSync(ACTION_VALIDATION, JSON.stringify(validations, null, 2));
            res.end();
        });
    } else if (req.url.startsWith('/remove-path')) {
        let task_id = req.url.split('&')[0].split('=')[1];
        let path_number = req.url.split('&')[1].split('=')[1];
        let validation = validations.find((v) => v.task_id == task_id);
        validation.paths.splice(path_number, 1);
        fs.writeFileSync(ACTION_VALIDATION, JSON.stringify(validations, null, 2));
        res.statusCode = 302;
        res.setHeader('Location', `/validation?task_id=${task_id}`);
        res.end();
    }
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
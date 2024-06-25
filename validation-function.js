module.exports = evaluateAll;

async function evaluateAll(evaluation, page, URL) {
    let evaluation_result = false;
    for (let i = 0; i < evaluation.eval_types.length; i++) {
        switch (evaluation.eval_types[i]) {
            case "url_match": evaluation_result = url_match(evaluation["reference_url"], page);
                break;
            case "program_html" : evaluation_result = await program_html(evaluation[eval_type], page);
                break;
            case "string_match" : evaluation_result = string_match(evaluation["reference_answers"], page);
                break;
            case "page_image_query" : evaluation_result = page_image_query(evaluation[eval_type], page);
                break;
            default: console.log("Invalid evaluation type" + evaluation.eval_types[i]);
                evaluation_result = false;
        }
        if (evaluation_result == false) {
            break;
        }
    }
    return evaluation_result;
} 

function url_match(reference_url, page) {
    const url = new URL(page.url());
    const href = url.href;
    console.log(href);
    const ref = reference_url.replace("__CLASSIFIEDS__", url.origin);
    console.log(ref);
    return href.trim() == ref.trim();
}

async function program_html(program_html, page) {
    if (program_html.length && program_html.length > 0) {
        const url = new URL(page.url());
        let evaluation_result = false;
        for (let i = 0; i < program_html.length; i++) {
            const program_element = program_html[i];
            const program_url = program_element.url.replace("__CLASSIFIEDS__", url.origin);
            if (program_url != page.url()) {
                evaluation_result = false;
                break;
            }
            let program_locator = program_element.locator;
            if (program_locator == "") {
                program_locator = "body";
            } else {
                const regex = /'(.*?)'/g;
                const matches = program_locator.match(regex);
                if (matches) {
                    program_locator = matches[0].replace(/"/g, "");
                } else {
                    program_locator = "body";
                }
            }
            const innerText = await page.locator(program_locator).allInnerTexts();
            console.log(program_element[i].required_contents);
            if (program_element[i].required_contents.must_include) {
                evaluation_result = innerText.includes(program_element[i].required_contents.must_include);
            } else {
                evaluation_result = !innerText.includes(program_element[i].required_contents.must_exlude);
            }
        }
    } else {
        return true;
    }
}

function string_match(çreference_answers, page) {
    return true;
}

function page_image_query(page_image_query, page) {
    return true;
}

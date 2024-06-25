module.exports = evaluateAll;

function evaluateAll(evaluation, page, URL) {
    let evaluation_result = false;
    for (let i = 0; i < evaluation.eval_types.length; i++) {
        switch (evaluation.eval_types[i]) {
            case "url_match": evaluation_result = url_match(evaluation["reference_url"], page);
                break;
            case "program_html" : evaluation_result = program_html(evaluation[eval_type], page);
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
    const url = new URL(page.url())
    const href = url.href;
    console.log(href);
    const ref = reference_url.replace("__CLASSIFIEDS__", url.origin);
    console.log(ref);
    return href.trim() == ref.trim();
}

async function program_html(program_html, page) {
    return true;
}

async function string_match(çreference_answers, page) {
    return true;
}

async function page_image_query(page_image_query, page) {
    return true;
}

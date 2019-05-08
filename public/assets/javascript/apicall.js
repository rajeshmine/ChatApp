// API Call
async function API_call(url, method, formdata, callback) {
    NProgress.start();
    await fetch(url, {
        method: method,
        body: formdata,
        redirect: "follow",
        referrer: "no-referrer"
    }).catch(err => {
        NProgress.done();
        return console.log(err);
    }).then(res => res.json()).then(data => {
        callback(data);
        return NProgress.done();
    });
}
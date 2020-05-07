var pjson = {};
var logoalts = {};

function change_logo(key, x) {
    x = parseInt(x);
    for (var i = 1; i < 10; i++) {
        let obj = document.getElementById('logo_%s_%u'.format(key, i));
        if (obj) {
            if (x == i) {
                obj.style.display = 'block';
                let img = document.getElementById('default_%s'.format(key));
                ext = logoalts[key][x-1];
                if (ext == 'default') {
                    img.src = 'res/%s/default.png'.format(key, key, ext);
                }
                else {
                    img.src = 'res/%s/%s%s.png'.format(key, key, ext);
                }

            } else {
                obj.style.display = 'none';
            }
        }
    }

}

function make_div(key, project) {
    let div = new HTML('div', { class: 'project_rect'});
    let pname = 'Apache %s'.format(project.name);
    if (project.podling) {
        pname += " (incubating)";
    }
    let title = new HTML('h4', pname);
    let idiv = new HTML('div', {class: 'project_logo'});
    let img = new HTML('img', {id: 'default_%s'.format(key), src: 'res/%s/default.png'.format(key), style: {maxWidth: '320px', maxHeight: '160px'}});
    if (project.has_default) {

    } else {
        img = new HTML('img', {src: 'res/%s'.format(project.images[0].filename), style: {maxWidth: '320px', maxHeight: '160px'}});
    }
    div.inject(title);
    idiv.inject(img);
    div.inject(idiv);

    if (project.description && project.description.length > 0) {
        pd = project.description;
        if (pd.length > 150) { pd = pd.substring(0,150) + "..."}
        div.inject(new HTML('p', [
                                  pd + ' - ',
                                  new HTML('a', {href: project.website}, project.website)
                                 ]));


    }

    originals = {};
    links = new HTML('p', {style: {textAlign: 'left'}});
    let il = {};
    for (var i in project.images) {
        let img = project.images[i];
        if (img.format) {
            if (il[img.filename]) continue;
            il[img.filename] = true;
            originals[img.original] = originals[img.original] || [];
            originals[img.original].push(img);
        }
    }
    let x = 0;
    logoalts[key] = [];
    let originals_sorted = [];
    for (var k in originals) originals_sorted.push(k);
    originals_sorted.sort();
    let sel = new HTML('select', {onchange: 'change_logo("%s", this.value)'.format(key)});
    div.inject(sel);
    for (var z = 0; z < originals_sorted.length; z++) {
        let original = originals_sorted[z];
        x++;
        let ext = 'default';
        let m = original.match(/(-\S+)$/);
        if (m) { ext = m[1]; }
        logoalts[key].push(ext);
        let odiv = new HTML('div', {id: 'logo_%s_%u'.format(key, x)});
        let opt = new HTML('option', { value: '%u'.format(x)}, "Version %u".format(x));
        sel.inject(opt);
        let imgs = originals[original];
        for (var i = 0; i < imgs.length; i++) {
            let img = imgs[i];
            let arr = [
                new HTML('img', {src:'images/%s.png'.format(img.format), style: {maxWidth: '24px', maxHeight: '24px'}}),
                new HTML('br'),
                ];
            let ltxt = "PNG raster";
            if (img.format == 'pdf') {
                ltxt = "PDF document";
            }
            arr.push(ltxt);
            if (img.width && img.height) {
                arr.push(new HTML('br'));
                arr.push("(%s x %s)".format(img.width, img.height));
            }

            let link = new HTML('a', {href: 'res/' + img.filename},
                                new HTML('div', {class: 'img_download'},
                                         arr
                                )
                               );
            odiv.inject(link);
        }

        // original:
        let img =imgs[0];
        img.opath = img.opath || 'undef.svg';
        let allowedExtensions = ['eps', 'svg', 'ai', 'pdf'];
        let imgExt = img.opath.split('.').pop();
        let oext = allowedExtensions.includes(imgExt) ? imgExt : 'svg';
        let arr = [
                new HTML('img', {src:'images/%s.png'.format(oext), style: {maxWidth: '24px', maxHeight: '24px'}}),
                new HTML('br'),
                "Original"
                ];
        let link = new HTML('a', {href: 'https://svn.apache.org/repos/asf/comdev/project-logos/originals/' + img.opath},
                            new HTML('div', {class: 'img_download'},
                                     arr
                            )
                           );
        odiv.inject(link);

        if (x > 1) {
            odiv.style.display = "none";
        }
        div.inject(odiv);
    }
    if (x == 1) {
        sel.style.display = "none";
    }

    return div;
}

function find_project(name) {
    name = name.toLowerCase();
    let wrapper = document.getElementById('wrapper');
    let obj = new HTML('div');
    wrapper.innerHTML = "";
    let num = 0;
    let keys = [];
    for (var key in pjson) { keys.push(key); }
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let project = pjson[key];
        if (!project) continue;
        let pname = project.name.toLowerCase();
        if (project.podling) pname += " (incubating)";
        if (name == 'tlp' && project.podling) continue; // shortcut for all TLPs
        if (pname.match(name) || key.toLowerCase().match(name) || name == 'tlp') {
            if (project.has_default || project.images.length > 0) {
                num++;
                let div = make_div(key, project);
                obj.inject(div);
            }
        }
    }
    let res = new HTML('h3', "Found %u project%s".format(num, num == 1 ? '' : 's'));
    wrapper.inject(res);
    wrapper.inject(obj);
    location.hash = name;
}

function render_projects(state, json) {
    pjson = json;
    let hash = location.hash.substr(1);
    if (hash && hash.length > 0) {
        document.getElementById('pkey').value = hash;
        find_project(hash);
        return;
    }
    let wrapper = document.getElementById('wrapper');
    let obj = new HTML('div');
    wrapper.innerHTML = "";
    let keys = [];
    let num = 0;
    for (var key in json) { keys.push(key); }
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        project = json[key];
        if (!project) continue;
        if (project.has_default || project.images.length > 0) {
            num++;
            let div = make_div(key, project);
            obj.inject(div);
        }
    }
    let res = new HTML('h3', "Found %u projects".format(num));
    wrapper.inject(res);
    wrapper.inject(obj);
}

function init_projects() {
    GET('res/logos.json?' + Math.random(), render_projects);
}

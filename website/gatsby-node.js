const redirects = require("./redirects.json");
const path = require('path');
const { exists, writeFile, ensureDir } = require('fs-extra');

exports.createPages = ({ actions }) => {
    const { createRedirect } = actions;

    redirects.forEach((redirect) => {
        const title = redirect.title;
        const fromPath = redirect.fromPath;
        const toPath = redirect.toPath;
        console.log(`Redirecting from \`${fromPath}\` to \`${toPath}\``);
        createRedirect({
            title,
            fromPath,
            toPath,
            isPermanent: true
        })
    })
}

const getMetaRedirect = (title, toPath) => {
    let url = toPath.trim();

    const hasProtocol = url.includes('://');
    if (!hasProtocol) {
        const hasLeadingSlash = url.startsWith('/');
        if (!hasLeadingSlash) {
            url = `/${url}`;
        }

        const resemblesFile = url.includes('.');
        if (!resemblesFile) {
            url = `${url}/`.replace(/\/\/+/g, '/');
        }
    }

    const script = `(function() {
    const i = setInterval(() => {
      if (!umami) { return; }
      clearInterval(i);
      umami.track('Browser redirected', { title: '${title}', url: '${url}' });
      window.location.href='${url}';
    }, 200);
  }())`;

    return `<!DOCTYPE HTML>
  <html lang="en-US">
      <head>
          <meta charset="UTF-8">
          <meta id="metaTag">
          <title>${title}</title>
          <script async="" defer="" src="https://stats.zachfox.photography/script.js" data-website-id="b07f1c64-41a0-4f6c-8518-838d1a79f919" data-auto-track="true" data-do-not-track="true" data-cache="false" data-domains=""></script>
          <script>${script}</script>
      </head>
      <body>
          You will be redirected to <a href='${url}'>${url}</a> momentarily.
      </body>
  </html>`;
};

const writeRedirectsFile = async (redirects, folder, pathPrefix) => {
    if (!redirects.length) return;

    for (const redirect of redirects) {
        const { title, fromPath, toPath } = redirect;

        const FILE_PATH = path.join(
            folder,
            fromPath.replace(pathPrefix, ''),
            'index.html'
        );

        const fileExists = await exists(FILE_PATH);
        if (!fileExists) {
            try {
                await ensureDir(path.dirname(FILE_PATH));
            } catch (err) {
                // ignore if the directory already exists;
            }
        }

        const data = getMetaRedirect(title, toPath);
        await writeFile(FILE_PATH, data);
    }
}

exports.onPostBuild = ({ store }) => {
    const { redirects, program, config } = store.getState();

    let pathPrefix = '';
    if (program.prefixPaths) {
        pathPrefix = config.pathPrefix;
    }

    const folder = path.join(program.directory, 'public');
    return writeRedirectsFile(redirects, folder, pathPrefix);
};

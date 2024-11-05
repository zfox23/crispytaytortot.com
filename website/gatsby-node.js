const redirects = require("./redirects.json")

exports.createPages = ({ actions }) => {
    const { createRedirect } = actions;

    redirects.forEach(redirect =>
        createRedirect({
            fromPath: redirect.fromPath,
            toPath: redirect.toPath,
            isPermanent: true 
        })
    )
}
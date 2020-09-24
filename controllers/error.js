exports.get404Page = (req, res) => {
    // res.status(404).sendFile(path.join(rootDir, './views/404.html'));
    res.status(404).render('404', {
        docTitle: '404',
        path: ''
    })
}

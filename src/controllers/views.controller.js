

const viewsController = () => ({
    create: (req, res) => {
        res.render('create');
    },
    delete: (req, res) => {
        res.render('delete');
    },
    list: (req, res) => {
        res.render('list');
    },
    query: (req, res) => {
        res.render('sentence');
    },
    update: (req, res) => {
        res.render('update');
    },
    main: (req, res) => {
        res.render('index');
    }
});

module.exports = viewsController;
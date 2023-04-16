
const viewsController = ({logger}) => ({
  create: (req, res) => {
    logger.info('Rendering create view');
    res.render('create');
  },
  delete: (req, res) => {
    logger.info('Rendering delete view');
    res.render('delete');
  },
  list: (req, res) => {
    logger.info('Rendering list view');
    res.render('list');
  },
  query: (req, res) => {
    logger.info('Rendering query view');
    res.render('sentence');
  },
  update: (req, res) => {
    logger.info('Rendering update view');
    res.render('update');
  },
  main: (req, res) => {
    logger.info('Rendering main view');
    res.render('index');
  },
});

module.exports = viewsController;

const swig = require('swig');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const MenuItem = require(app_dir + '/server/models/MenuItem');

const get = function (req, res) {
  const menu_items = MenuItem.loadAll();
  const menu_items_active = menu_items.filter(i => i.active);
  const menu_items_inactive = menu_items.filter(i => !i.active);

  const active_categories = {
    soup: {
      title: 'Soups',
      items: menu_items_active.filter(i => i.category === 'soup'),
    },
    starter: {
      title: 'Starters',
      items: menu_items_active.filter(i => i.category === 'starter'),
    },
    main: {
      title: 'Main Courses',
      items: menu_items_active.filter(i => i.category === 'main'),
    },
    dessert: {
      title: 'Desserts',
      items: menu_items_active.filter(i => i.category === 'dessert'),
    },
    drink: {
      title: 'Drinks',
      items: menu_items_active.filter(i => i.category === 'drink'),
    },
  };

  const inactive_categories = {
    soup: {
      title: 'Soups',
      items: menu_items_inactive.filter(i => i.category === 'soup'),
    },
    starter: {
      title: 'Starters',
      items: menu_items_inactive.filter(i => i.category === 'starter'),
    },
    main: {
      title: 'Main Courses',
      items: menu_items_inactive.filter(i => i.category === 'main'),
    },
    dessert: {
      title: 'Desserts',
      items: menu_items_inactive.filter(i => i.category === 'dessert'),
    },
    drink: {
      title: 'Drinks',
      items: menu_items_inactive.filter(i => i.category === 'drink'),
    },
  };

  const markup = swig.renderFile(app_dir + '/client/templates/menu.tpl.html', {
    page_title: 'Menu',
    page_h1: 'Restaurant Menu',
    current_path: '/menu',
    active_categories: active_categories,
    inactive_categories: inactive_categories,
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

const post = function (req, res) {
  MenuItem.create(req.body.category, req.body.name, req.body.price, (req.body.active === 'on')).save();
  res.redirect(req.body.redirect);
};

const update = function (req, res) {
  const item = MenuItem.load(req.body.uuid);

  item.active = !item.active;
  item.save();

  res.redirect(req.body.redirect);
};

module.exports = {get, post, update};
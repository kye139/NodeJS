const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Content = require('./content')(sequelize, Sequelize);
db.Tag = require('./tag')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Notice = require('./notice')(sequelize, Sequelize);
db.Link = require('./link')(sequelize, Sequelize);
db.Maincategory = require('./maincategory')(sequelize, Sequelize);
db.Subcategory = require('./subcategory')(sequelize, Sequelize);

db.Maincategory.hasMany(db.Content, { onDelete: 'restrict'});
db.Content.belongsTo(db.Maincategory);

db.Maincategory.hasMany(db.Subcategory, {onDelete: 'restrict'});
db.Subcategory.belongsTo(db.Maincategory);

db.Subcategory.hasMany(db.Content, { onDelete: 'restrict'});
db.Content.belongsTo(db.Subcategory);

db.Content.belongsToMany(db.Tag, { through: 'ContentTag' });
db.Tag.belongsToMany(db.Content, { through: 'ContentTag'});

db.Content.hasMany(db.Comment, { onDelete: 'cascade'});
db.Comment.belongsTo(db.Content);

db.Comment.hasMany(db.Comment, { onDelete: 'restrict' });
db.Comment.belongsTo(db.Comment, { as: 'parent'});

module.exports = db;
module.exports = (sequelize, DataTypes) => (
    sequelize.define('tag', {
        title: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        timestamps: true
    })
);
function Author(sequelize, DataTypes){
  return sequelize.define('author', {
    name: DataTypes.STRING
  });
};

module.exports = Author;
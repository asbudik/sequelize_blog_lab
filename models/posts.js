function Posts(sequelize, DataTypes){
  return sequelize.define('posts', {
    name: DataTypes.STRING
  });
};



module.exports = Posts;
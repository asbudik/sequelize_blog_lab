function Post(sequelize, DataTypes){
  return sequelize.define('post', {
    name: DataTypes.STRING
  });
};



module.exports = Post;
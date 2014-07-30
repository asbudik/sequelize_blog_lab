function Post(sequelize, DataTypes){
  /* sequelize.define(modelName, attributes, options); */

  var Post = sequelize.define('post', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT
  },
    {
      classMethods: {
        associate: function(db) {
          Post.belongsTo(db.author);
        }
      }
    });
  return Post;
};



module.exports = Post;
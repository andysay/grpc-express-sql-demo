"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "Users",
    {
      userId: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: false,
        type: DataTypes.UUID,
        validate: {
          isUUID: 4
        },
        get() {
          return this.getDataValue("userId").toLowerCase();
        }
      },
      email: {
        primaryKey: true,

        type: DataTypes.STRING,
        primaryKey: false,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.ENUM,
        values: ["user", "admin", "moder"]
      }
    },
    {
      tableName: "users"
    }
  );
  User.associate = models => {
    // associations can be defined here
  };
  // DROP TABLE IF EXT and re-create
  User.sync({ force: false });

  return User;
};

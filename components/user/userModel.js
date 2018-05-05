module.exports = (sequelize, DataTypes) => {
  const userInfoTb = sequelize.define('userInfoTb',
    {
      userIdx: {
        type: DataTypes.INTEGER,
        field: 'user_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      userEmail: {
        type: DataTypes.STRING(100),
        field: 'user_email',
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      userName: {
        type: DataTypes.STRING,
        field: 'user_name',
        allowNull: true,
      },
    }, {
      timestamps: true,
      tableName: 'USER_TB',
      underscored: true,
      comment: '전체 회원 테이블',
    },
  );
  return userInfoTb;
};

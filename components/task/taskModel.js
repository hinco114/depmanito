const { DataTypes } = require('sequelize');

module.exports = {
  type: 'rdb',
  schemaName: 'taskTb',
  schema: {
    taskIdx: {
      type: DataTypes.INTEGER,
      field: 'task_idx',
      autoIncrement: true,
      primaryKey: true,
    },
    taskName: {
      type: DataTypes.STRING,
      field: 'task_name',
      allowNull: false,
    },
    taskContent: {
      type: DataTypes.STRING,
      field: 'task_content',
      allowNull: false,
    },
  },
  schemaOptions: {
    timestamps: true,
    tableName: 'TASK_TB',
    underscored: true,
    comment: '전체 할일 목록',
  },
};

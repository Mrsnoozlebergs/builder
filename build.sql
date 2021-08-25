/*
 Navicat MySQL Data Transfer

 Source Server         : build
 Source Server Type    : MySQL
 Source Server Version : 50733
 Source Host           : 159.75.89.4:3306
 Source Schema         : build

 Target Server Type    : MySQL
 Target Server Version : 50733
 File Encoding         : 65001

 Date: 25/08/2021 17:43:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Page
-- ----------------------------
DROP TABLE IF EXISTS `Page`;
CREATE TABLE `Page` (
  `page_id` int(4) NOT NULL AUTO_INCREMENT COMMENT '页面ID',
  `page_user_id` varchar(255) NOT NULL COMMENT '页面绑定的发布者ID',
  `page_name` varchar(255) NOT NULL COMMENT '页面名称',
  `page_schema` longtext NOT NULL COMMENT '页面的schema配置',
  `page_setting_id` int(4) NOT NULL,
  `page_current_version` varchar(255) NOT NULL,
  `page_max_version` varchar(255) NOT NULL,
  `page_authority` tinyint(4) NOT NULL DEFAULT '0' COMMENT '页面的权限设置 0 public 1 private',
  `page_enter_id` varchar(255) NOT NULL COMMENT '页面的enterId',
  `page_delete` tinyint(4) NOT NULL DEFAULT '1' COMMENT '页面是否被删除 0 删除 1 未删除',
  `page_create_time` datetime(6) NOT NULL COMMENT '页面创建时间',
  `page_update_time` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '页面修改时间',
  PRIMARY KEY (`page_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for Schema
-- ----------------------------
DROP TABLE IF EXISTS `Schema`;
CREATE TABLE `Schema` (
  `schema_id` int(4) NOT NULL,
  `schema_page_id` int(4) NOT NULL,
  `schema_content` longtext NOT NULL,
  `schema_version` varchar(255) NOT NULL,
  `schema_delete` tinyint(4) DEFAULT NULL,
  `schema_create_time` datetime(6) NOT NULL COMMENT '页面创建时间',
  `schema_update_time` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '页面修改时间',
  PRIMARY KEY (`schema_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for Setting
-- ----------------------------
DROP TABLE IF EXISTS `Setting`;
CREATE TABLE `Setting` (
  `setting_id` int(4) NOT NULL AUTO_INCREMENT,
  `setting_page_id` int(4) NOT NULL,
  `setting_grayscale` int(4) NOT NULL DEFAULT '1',
  `setting_page_version` varchar(255) NOT NULL,
  `setting_delete` tinyint(4) NOT NULL DEFAULT '1',
  `setting_create_time` datetime(6) NOT NULL COMMENT '配置创建时间',
  `setting_update_time` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '配置修改时间',
  PRIMARY KEY (`setting_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'uid',
  `user_id` varchar(255) NOT NULL COMMENT '用户id',
  `user_hash` int(10) NOT NULL COMMENT '哈希',
  `user_name` varchar(255) NOT NULL COMMENT '用户名称',
  `user_phone` varchar(255) NOT NULL COMMENT '用户手机号码',
  `user_password` varchar(255) NOT NULL COMMENT '用户密码',
  `user_authority` tinyint(4) NOT NULL DEFAULT '2' COMMENT '用户权限 0 管理员 1 普通用户 2 游客',
  `user_delete` tinyint(4) NOT NULL DEFAULT '1' COMMENT '用户是否删除 0删除 1未删除',
  `user_create_time` datetime(6) DEFAULT NULL COMMENT '用户创建时间',
  `user_update_time` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '用户修改时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

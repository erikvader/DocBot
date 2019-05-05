CREATE DATABASE IF NOT EXISTS docbot;
USE docbot;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Entity;
DROP TABLE IF EXISTS EntityValue;
DROP TABLE IF EXISTS EntitySynonym;
DROP TABLE IF EXISTS Node;
DROP TABLE IF EXISTS QuestionWording;
DROP TABLE IF EXISTS ConditionEntityValue;
DROP TABLE IF EXISTS NodeOrder;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Answer;
DROP TABLE IF EXISTS Intent;
DROP TABLE IF EXISTS IntentExample;
DROP TABLE IF EXISTS ConditionIntent;


CREATE TABLE IF NOT EXISTS Entity (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS EntityValue (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(32) NOT NULL,
	entity_id int UNSIGNED NOT NULL,
	FOREIGN KEY (entity_id) REFERENCES Entity (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS EntitySynonym (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	value varchar(32) NOT NULL,
	entity_value_id int UNSIGNED NOT NULL,
	FOREIGN KEY (entity_value_id) REFERENCES EntityValue (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Node (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(32) NOT NULL,
	last_changed datetime DEFAULT current_timestamp ON UPDATE current_timestamp,
	sibling_order int NOT NULL DEFAULT 0,
	catch_node_id varchar(64),
	external_id varchar(64) NOT NULL,
	root_id int UNSIGNED,
	FOREIGN KEY (root_id) REFERENCES Node (id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS QuestionWording (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	value text NOT NULL,
	node_id int UNSIGNED NOT NULL,
	FOREIGN KEY (node_id) REFERENCES Node (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ConditionEntityValue (
	entity_value_id int UNSIGNED NOT NULL,
	node_id int UNSIGNED NOT NULL,
	terminates boolean NOT NULL DEFAULT false,
	save boolean NOT NULL DEFAULT false,
	FOREIGN KEY (entity_value_id) REFERENCES EntityValue (id) ON DELETE CASCADE,
	FOREIGN KEY (node_id) REFERENCES Node (id) ON DELETE CASCADE,
	PRIMARY KEY(entity_value_id, node_id)
);

CREATE TABLE IF NOT EXISTS NodeOrder (
	previous_id int UNSIGNED NOT NULL,
	next_id int UNSIGNED NOT NULL,
	value varchar(64),
	comparator varchar(16),
	FOREIGN KEY (previous_id) REFERENCES Node (id) ON DELETE CASCADE,
	FOREIGN KEY (next_id) REFERENCES Node (id) ON DELETE CASCADE,
	PRIMARY KEY (previous_id, next_id)
);

CREATE TABLE IF NOT EXISTS User (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(64) NOT NULL,
	email varchar(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Answer (
	entity_value_id int UNSIGNED NOT NULL,
	user_id int UNSIGNED NOT NULL,
	node_id int UNSIGNED NOT NULL,
	root_node_id int UNSIGNED NOT NULL,
	value text NOT NULL,
	last_changed datetime DEFAULT current_timestamp ON UPDATE current_timestamp,
	FOREIGN KEY (entity_value_id) REFERENCES EntityValue (id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
	FOREIGN KEY (node_id) REFERENCES Node (id) ON DELETE CASCADE,
	FOREIGN KEY (root_node_id) REFERENCES Node (id) ON DELETE CASCADE,
	PRIMARY KEY (node_id, user_id)
);

CREATE TABLE IF NOT EXISTS Intent (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS IntentExample (
	id int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	intent_id int UNSIGNED NOT NULL,
	value varchar(128) NOT NULL,
	FOREIGN KEY (intent_id) REFERENCES Intent (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ConditionIntent (
	node_id int UNSIGNED NOT NULL,
	intent_id int UNSIGNED NOT NULL,
	FOREIGN KEY (node_id) REFERENCES Node (id) ON DELETE CASCADE,
	FOREIGN KEY (intent_id) REFERENCES Intent (id) ON DELETE CASCADE,
	PRIMARY KEY (node_id, intent_id)
);

SET FOREIGN_KEY_CHECKS = 1;



DROP USER IF EXISTS 'docbot_admin'@'localhost';
CREATE USER 'docbot_admin'@'localhost' IDENTIFIED BY '123';
# if "ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server" error:
ALTER USER 'docbot_admin'@'localhost' IDENTIFIED WITH mysql_native_password BY '123';

GRANT ALL PRIVILEGES ON docbot.* TO 'docbot_admin'@'localhost';

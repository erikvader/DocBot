#FRÅGA LARSSON
USE docbot;


#Entity
INSERT INTO Entity (name) VALUES ("person");
INSERT INTO Entity (name) VALUES ("vehicle");
INSERT INTO Entity (name) VALUES ("yes/no");

#EntityValue
INSERT INTO EntityValue (name, entity_id) VALUES ("partner", 1);
INSERT INTO EntityValue (name, entity_id) VALUES ("offspring", 1);
INSERT INTO EntityValue (name, entity_id) VALUES ("car", 2);
INSERT INTO EntityValue (name, entity_id) VALUES ("bicycle", 2);
INSERT INTO EntityValue (name, entity_id) VALUES ("yes", 3);
INSERT INTO EntityValue (name, entity_id) VALUES ("no", 3);


#EntitySynonym
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("girlfriend", 1);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("boyfriend", 1);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("son", 2);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("volvo", 3);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("saab", 3);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("bike", 4);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("hoj", 4);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("jajamensan", 5);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("ofc", 5);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("nope", 6);
INSERT INTO EntitySynonym (value, entity_value_id) VALUES ("aldrig", 6);

#Node
INSERT INTO Node (name, sibling_order, catch_node_id, root_id) VALUES ("Samboavtal", 0, 123, null);
INSERT INTO Node (name, sibling_order, catch_node_id, root_id) VALUES ("Hur många?", 0, 124, 1);
INSERT INTO Node (name, sibling_order, catch_node_id, root_id) VALUES ("Nej", 1, 124, 1);
INSERT INTO Node (name, sibling_order, catch_node_id, root_id) VALUES ("Bil", 0, 125, 1);

#QuestionWording
INSERT INTO QuestionWording (value, node_id) VALUES ("Har du barn?", 1);
INSERT INTO QuestionWording (value, node_id) VALUES ("Hur många barn?", 2);
INSERT INTO QuestionWording (value, node_id) VALUES ("Varför hatar du barn?", 3);
INSERT INTO QuestionWording (value, node_id) VALUES ("Vad har du för bil?", 4);

#ConditionEntitiValue
INSERT INTO ConditionEntityValue (entity_value_id, node_id) VALUES (1, 1);
INSERT INTO ConditionEntityValue (entity_value_id, node_id) VALUES (5, 2);
INSERT INTO ConditionEntityValue (entity_value_id, node_id) VALUES (6, 3);
INSERT INTO ConditionEntityValue (entity_value_id, node_id) VALUES (3, 4);

#NodeOrder
#INSERT INTO NodeOrder (previous_id, next_id) VALUES (null, 1);
INSERT INTO NodeOrder (previous_id, next_id) VALUES (1, 2);
INSERT INTO NodeOrder (previous_id, next_id) VALUES (1, 3);
INSERT INTO NodeOrder (previous_id, next_id) VALUES (2, 4);
INSERT INTO NodeOrder (previous_id, next_id) VALUES (3, 4);

#User
INSERT INTO User (name, email) VALUES ("Kurt", "kurt@kurtsvattenpumpar.se");
INSERT INTO User (name, email) VALUES ("Ruben", "ruben@rubisk.kub");

#Answer
INSERT INTO Answer (entity_value_id, user_id, node_id, root_node_id, value) VALUES (2, 1, 1, 1, "Jag har barn!");

#Intent
INSERT INTO Intent (name) VALUES ("move_in");

#IntentExample
INSERT INTO IntentExample (intent_id, value) VALUES (1, "Jag och min partner ska flytta ihop");
INSERT INTO IntentExample (intent_id, value) VALUES (1, "Vi har köpt ett hus tillsammans");
INSERT INTO IntentExample (intent_id, value) VALUES (1, "Min pojkvän ska flytta in");

#ConditionIntent
INSERT INTO ConditionIntent (node_id, intent_id) VALUES (1, 1);

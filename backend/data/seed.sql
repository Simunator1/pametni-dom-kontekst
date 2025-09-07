DROP TABLE IF EXISTS counters CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS quick_actions CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;

DROP TYPE IF EXISTS device_type;

CREATE TABLE counters (
    id INT PRIMARY KEY DEFAULT 1,
    device_id_counter INT NOT NULL,
    room_id_counter INT NOT NULL,
    routine_id_counter INT NOT NULL,
    quick_action_id_counter INT NOT NULL,
    preference_id_counter INT NOT NULL
);

INSERT INTO counters (device_id_counter, room_id_counter, routine_id_counter, quick_action_id_counter, preference_id_counter)
VALUES (30, 5, 6, 10, 15);

CREATE TYPE device_type AS ENUM ('LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'SMART_BLIND', 'AIR_CONDITIONER', 'SENSOR');

CREATE TABLE devices (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type device_type NOT NULL,
    room_id VARCHAR(255) NOT NULL,
    state JSONB,
    supported_actions TEXT[]
);

INSERT INTO devices (id, name, type, room_id, state, supported_actions) VALUES
('device-007', 'Living Room Blinds', 'SMART_BLIND', 'room-001', '{"position": 0}', '{"SET_POSITION", "OPEN", "CLOSE"}'),
('device-008', 'Living Room Main Light', 'LIGHT', 'room-001', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-009', 'Living Room TV Light', 'LIGHT', 'room-001', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-010', 'Living Room A/C', 'AIR_CONDITIONER', 'room-001', '{"isOn": false, "mode": "OFF", "roomState": "OFF", "prevMode": "COOL", "targetTemp": 24, "temperature": 27.9}', '{"TOGGLE_ON_OFF", "SET_TEMPERATURE", "SET_MODE"}'),
('device-013', 'Entertainment System', 'SMART_OUTLET', 'room-001', '{"isOn": false, "roomState": "OFF", "powerUsage": 0}', '{"TOGGLE_ON_OFF", "READ_POWER_USAGE"}'),
('device-014', 'Kitchen Main Light', 'LIGHT', 'room-002', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-015', 'Kitchen Desk Lights', 'LIGHT', 'room-002', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-016', 'Coffee Machine', 'SMART_OUTLET', 'room-002', '{"isOn": false, "roomState": "OFF", "powerUsage": 0}', '{"TOGGLE_ON_OFF", "READ_POWER_USAGE"}'),
('device-017', 'Kitchen Sensor', 'SENSOR', 'room-002', '{"humidity": 68, "temperature": 28}', '{"READ"}'),
('device-018', 'Bathroom Main Light', 'LIGHT', 'room-004', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-019', 'Bathroom Mirror Light', 'LIGHT', 'room-004', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-020', 'Bathroom Wall Heather', 'SMART_OUTLET', 'room-004', '{"isOn": false, "roomState": "OFF", "powerUsage": 0}', '{"TOGGLE_ON_OFF", "READ_POWER_USAGE"}'),
('device-021', 'Bathroom Sensor', 'SENSOR', 'room-004', '{"humidity": 49, "temperature": 28}', '{"READ"}'),
('device-022', 'Bathroom Floor Heating', 'THERMOSTAT', 'room-004', '{"isOn": false, "mode": "OFF", "roomState": "OFF", "prevMode": "HEAT", "targetTemp": 22, "temperature": 27.9}', '{"TOGGLE_ON_OFF", "SET_TEMPERATURE", "SET_MODE"}'),
('device-023', 'Balcony Lights', 'LIGHT', 'room-005', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-024', 'Balcony Blinds', 'SMART_BLIND', 'room-005', '{"position": 0}', '{"SET_POSITION", "OPEN", "CLOSE"}'),
('device-025', 'Balcony Sensor', 'SENSOR', 'room-005', '{"humidity": 40, "temperature": 28}', '{"READ"}'),
('device-026', 'Bedroom A/C', 'AIR_CONDITIONER', 'room-003', '{"isOn": false, "mode": "OFF", "roomState": "OFF", "prevMode": "COOL", "targetTemp": 24, "temperature": 28}', '{"TOGGLE_ON_OFF", "SET_TEMPERATURE", "SET_MODE"}'),
('device-027', 'Bedroom Light', 'LIGHT', 'room-003', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}'),
('device-028', 'Bedroom Blinds', 'SMART_BLIND', 'room-003', '{"position": 0}', '{"SET_POSITION", "OPEN", "CLOSE"}'),
('device-029', 'Bedroom Night Light', 'LIGHT', 'room-003', '{"isOn": false, "roomState": "OFF", "brightness": 0}', '{"TOGGLE_ON_OFF", "SET_BRIGHTNESS"}');

CREATE TABLE rooms (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_on BOOLEAN DEFAULT TRUE
);

INSERT INTO rooms (id, name, is_on) VALUES
('room-001', 'Living Room', TRUE),
('room-002', 'Kitchen', TRUE),
('room-003', 'Bedroom', TRUE),
('room-004', 'Bathroom', TRUE),
('room-005', 'Balcony', TRUE);

ALTER TABLE devices
ADD CONSTRAINT fk_room
FOREIGN KEY (room_id)
REFERENCES rooms(id)
ON DELETE CASCADE;

CREATE TABLE routines (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    included_devices TEXT[],
    included_rooms TEXT[],
    triggers JSONB NOT NULL,
    conditions JSONB,
    actions JSONB NOT NULL
);

INSERT INTO routines (id, name, description, icon, is_enabled, included_devices, included_rooms, triggers, conditions, actions) VALUES
('routine-001', 'Buđenje', 'Ujutro otvara sve rolete u kući, uključi klimu u dnevnom boravku, termostat u WC-u te mašinu za kavu.', 'bi bi-sunrise', TRUE, 
'{"device-007", "device-024", "device-028", "device-010", "device-016", "device-022"}', 
'{"room-001", "room-005", "room-003", "room-002", "room-004"}', 
'{"logicalOperator": "OR", "list": [{"type": "TIME_OF_DAY_CHANGE", "value": "MORNING"}]}', 
'{"logicalOperator": "AND", "list": [{"type": "USER_PRESENCE", "value": true}]}', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-007", "actionType": "OPEN", "payload": {}}, {"type": "DEVICE_ACTION", "deviceId": "device-024", "actionType": "OPEN", "payload": {}}, {"type": "DEVICE_ACTION", "deviceId": "device-028", "actionType": "OPEN", "payload": {}}, {"type": "DEVICE_ACTION", "deviceId": "device-010", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}, {"type": "DEVICE_ACTION", "deviceId": "device-016", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}, {"type": "DEVICE_ACTION", "deviceId": "device-022", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}]'),

('routine-003', 'Dobrodošao kući', 'Prilikom ulaska u kuću, ako je mrak, upale se dva najveća svijetla.', 'bi bi-house-door', TRUE, 
'{"device-008", "device-014"}', 
'{"room-001", "room-002"}', 
'{"logicalOperator": "OR", "list": [{"type": "USER_PRESENCE_CHANGE", "value": true}]}', 
'{"logicalOperator": "OR", "list": [{"type": "TIME_OF_DAY", "value": "EVENING"}, {"type": "TIME_OF_DAY", "value": "NIGHT"}]}', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-008", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}, {"type": "DEVICE_ACTION", "deviceId": "device-014", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}]'),

('routine-004', 'Spavanje', 'Kad je vrijeme za spavanje, u spavaćoj sobi zatvore se rolete, upali se klima, ugasi glavno svijetlo i upali noćno svijetlo.', 'bi bi-moon-stars', TRUE, 
'{"device-028", "device-027", "device-029", "device-026"}', 
'{"room-003"}', 
'{"logicalOperator": "OR", "list": [{"type": "TIME_OF_DAY_CHANGE", "value": "NIGHT"}]}', 
'{"logicalOperator": "AND", "list": [{"type": "USER_PRESENCE", "value": true}]}', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-028", "actionType": "CLOSE", "payload": {}}, {"type": "DEVICE_ACTION", "deviceId": "device-027", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-029", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}, {"type": "DEVICE_ACTION", "deviceId": "device-026", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}]'),

('routine-006', 'Ugasi sve', 'Prilikom izlaska iz kuće, sve se ugasi.', 'bi bi-power', TRUE, 
'{"device-008", "device-009", "device-014", "device-015", "device-018", "device-019", "device-023", "device-027", "device-029", "device-013", "device-016", "device-020", "device-022", "device-010", "device-026"}', 
'{"room-001", "room-002", "room-004", "room-005", "room-003"}', 
'{"logicalOperator": "OR", "list": [{"type": "USER_PRESENCE_CHANGE", "value": false}]}', 
'{"logicalOperator": "AND", "list": []}', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-008", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-009", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-014", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-015", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-018", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-019", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-023", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-027", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-029", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-013", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-016", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-020", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-022", "actionType": "SET_MODE", "payload": {"mode": "OFF"}}, {"type": "DEVICE_ACTION", "deviceId": "device-010", "actionType": "SET_MODE", "payload": {"mode": "OFF"}}, {"type": "DEVICE_ACTION", "deviceId": "device-026", "actionType": "SET_MODE", "payload": {"mode": "OFF"}}]');

CREATE TABLE quick_actions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    included_devices TEXT[],
    included_rooms TEXT[],
    icon VARCHAR(255),
    actions JSONB NOT NULL
);

INSERT INTO quick_actions (id, name, description, included_devices, included_rooms, icon, actions) VALUES
('quickaction-001', 'Movie', 'Movie time', 
'{"device-007", "device-008", "device-009", "device-013"}', 
'{"room-001"}', 'bi bi-film', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-007", "actionType": "CLOSE", "payload": {}}, {"type": "DEVICE_ACTION", "deviceId": "device-008", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-009", "actionType": "SET_BRIGHTNESS", "payload": {"brightness": 10}}, {"type": "DEVICE_ACTION", "deviceId": "device-013", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}]'),

('quickaction-002', 'LightsOut', 'Eppy time', 
'{"device-008", "device-009", "device-014", "device-015", "device-018", "device-019", "device-027", "device-029"}', 
'{"room-001", "room-002", "room-004", "room-003"}', 'bi bi-lightbulb', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-008", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-009", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-014", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-015", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-018", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-019", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-027", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-029", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}, {"type": "DEVICE_ACTION", "deviceId": "device-023", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}]'),

('quickaction-003', 'HeatMax', 'VERY HOT', 
'{"device-010", "device-020", "device-022", "device-026"}', 
'{"room-001", "room-004", "room-003"}', 'bi bi-thermometer', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-010", "actionType": "SET_MODE", "payload": {"mode": "HEAT"}}, {"type": "DEVICE_ACTION", "deviceId": "device-010", "actionType": "SET_TEMPERATURE", "payload": {"targetTemp": 30}}, {"type": "DEVICE_ACTION", "deviceId": "device-020", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}, {"type": "DEVICE_ACTION", "deviceId": "device-022", "actionType": "SET_TEMPERATURE", "payload": {"targetTemp": 30}}, {"type": "DEVICE_ACTION", "deviceId": "device-022", "actionType": "SET_MODE", "payload": {"mode": "HEAT"}}, {"type": "DEVICE_ACTION", "deviceId": "device-026", "actionType": "SET_TEMPERATURE", "payload": {"targetTemp": 30}}, {"type": "DEVICE_ACTION", "deviceId": "device-026", "actionType": "SET_MODE", "payload": {"mode": "HEAT"}}]'),

('quickaction-004', 'CoolMax', 'Very Cold', 
'{"device-010", "device-026", "device-022", "device-020"}', 
'{"room-001", "room-003", "room-004"}', 'bi bi-snow2', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-010", "actionType": "SET_TEMPERATURE", "payload": {"targetTemp": 16}}, {"type": "DEVICE_ACTION", "deviceId": "device-010", "actionType": "SET_MODE", "payload": {"mode": "COOL"}}, {"type": "DEVICE_ACTION", "deviceId": "device-026", "actionType": "SET_TEMPERATURE", "payload": {"targetTemp": 16}}, {"type": "DEVICE_ACTION", "deviceId": "device-026", "actionType": "SET_MODE", "payload": {"mode": "COOL"}}, {"type": "DEVICE_ACTION", "deviceId": "device-022", "actionType": "SET_MODE", "payload": {"mode": "OFF"}}, {"type": "DEVICE_ACTION", "deviceId": "device-020", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": false}}]'),

('quickaction-005', 'Coffee', 'Maketh the Coffee', 
'{"device-016"}', 
'{"room-002"}', 'bi bi-droplet-fill', 
'[{"type": "DEVICE_ACTION", "deviceId": "device-016", "actionType": "TOGGLE_ON_OFF", "payload": {"isOn": true}}]');

CREATE TABLE preferences (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    room_id VARCHAR(255) NOT NULL,
    conditions JSONB,
    actions JSONB NOT NULL,
    CONSTRAINT fk_room_preference FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

INSERT INTO preferences (id, name, description, icon, room_id, conditions, actions) VALUES
('pref-010', 'Svjetlina', 'Svjetlina podešena na 60%', 'bi bi-lightbulb', 'room-001', '{"logicalOperator": "AND", "list": []}', '[{"deviceType": "LIGHT", "state": {"brightness": 60}}]'),
('pref-011', 'Grijanje', 'Ako je vanjska temperatura ispod 20 stupnjeva, upali grijanje na 24 stupnja.', 'bi bi-thermometer', 'room-001', '{"logicalOperator": "AND", "list": [{"type": "OUTSIDE_TEMPERATURE", "operator": "<", "value": 20}]}', '[{"deviceType": "AIR_CONDITIONER", "state": {"targetTemp": 24, "mode": "HEAT"}}]'),
('pref-012', 'Hlađenje', 'Ako je vanjska temperatura iznad 30 stupnjeva, postavi hlađenje na 24 stupnja.', 'bi bi-wind', 'room-001', '{"logicalOperator": "AND", "list": [{"type": "OUTSIDE_TEMPERATURE", "operator": ">", "value": 30}]}', '[{"deviceType": "AIR_CONDITIONER", "state": {"targetTemp": 24, "mode": "COOL"}}]'),
('pref-009', 'Svjetlina', 'Svjetlina podešena na 90%', 'bi bi-lightbulb', 'room-002', '{"logicalOperator": "AND", "list": []}', '[{"deviceType": "LIGHT", "state": {"brightness": 90}}]'),
('pref-006', 'Hlađenje', 'Ako je vanjska temperatura iznad 30 upali hlađenje na 26 stupnjeva.', 'bi bi-wind', 'room-003', '{"logicalOperator": "AND", "list": [{"type": "OUTSIDE_TEMPERATURE", "operator": ">", "value": 28}]}', '[{"deviceType": "AIR_CONDITIONER", "state": {"targetTemp": 26, "mode": "COOL"}}]'),
('pref-007', 'Grijanje', 'Ako je vanjska temperatura niža od 20 stupnjeva grijanje postavljeno na 25.', 'bi bi-thermometer', 'room-003', '{"logicalOperator": "AND", "list": [{"type": "OUTSIDE_TEMPERATURE", "operator": "<", "value": 20}]}', '[{"deviceType": "AIR_CONDITIONER", "state": {"targetTemp": 25, "mode": "HEAT"}}]'),
('pref-008', 'Svjetlina', 'Svjetlina podešena na 30%', 'bi bi-lightbulb', 'room-003', '{"logicalOperator": "AND", "list": []}', '[{"deviceType": "LIGHT", "state": {"brightness": 30}}]'),
('pref-004', 'Grijanje', 'Grijanje na 25 stupnjeva ako je vanjska temperatura ispod 20.', 'bi bi-sunrise', 'room-004', '{"logicalOperator": "AND", "list": [{"type": "OUTSIDE_TEMPERATURE", "operator": "<", "value": 20}]}', '[{"deviceType": "THERMOSTAT", "state": {"targetTemp": 25, "mode": "HEAT"}}]'),
('pref-005', 'Svjetlina', 'Svjetlina podešena na 85%', 'bi bi-lightbulb', 'room-004', '{"logicalOperator": "AND", "list": []}', '[{"deviceType": "LIGHT", "state": {"brightness": 85}}]'),
('pref-003', 'Svjetlina', 'Svjetlina podeđena na 70%', 'bi bi-lightbulb', 'room-005', '{"logicalOperator": "AND", "list": []}', '[{"deviceType": "LIGHT", "state": {"brightness": 70}}]');

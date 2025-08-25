const DEVICE_TYPES = ['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'SMART_BLIND', 'AIR_CONDITIONER', 'SENSOR'];

const TIMES_OF_DAY = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

const TRIGGER_TYPES = ['TIME_OF_DAY_CHANGE', 'USER_PRESENCE_CHANGE'];

const LOGICAL_OPERATORS = ['AND', 'OR'];

const ICONS = [
    'bi bi-sunrise',
    'bi bi-moon-stars',
    'bi bi-house-door',
    'bi bi-gear',
    'bi bi-lightbulb',
    'bi bi-thermometer',
    'bi bi-plug',
    'bi bi-check-circle',
    'bi bi-x-circle',
    'bi bi-exclamation-triangle',
    'bi bi-info-circle',
    'bi bi-question-circle',
    'bi bi-film',
    'bi bi-fire',
    'bi bi-bell-slash',
    'bi bi-brightness-high',
    'bi bi-cake',
    'bi bi-fork-knife',
    'bi bi-wind',
    'bi bi-droplet-fill',
    'bi bi-camera-video',
    'bi bi-lock',
    'bi bi-unlock',
    'bi bi-volume-up',
    'bi bi-tv',
    'bi bi-router',
    'bi bi-shield-lock',
    'bi bi-calendar-event',
    'bi bi-clock-history',
    'bi bi-power',
    'bi bi-snow2'
];


const CONDITION_TYPES = {
    'USER_PRESENCE': {
        modes: [true, false]
    },
    'OUTSIDE_TEMPERATURE': {
        operators: ['<', '>'],
        valueRange: [-15, 45],
    },
    'TIME_OF_DAY': {
        modes: TIMES_OF_DAY
    }
};

const availableActions = {
    'LIGHT': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'Toggle ON/OFF',
            payloads: ['ON', 'OFF']
        },
        {
            actionType: 'SET_BRIGHTNESS',
            label: 'Set Brightness',
            payloads: [
                {
                    name: 'brightness',
                    label: 'Brightness (%)',
                    type: 'number',
                    min: 0,
                    max: 100
                }
            ]
        }
    ],
    'THERMOSTAT': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'ON/OFF',
            payloads: ['ON', 'OFF']
        },
        {
            actionType: 'SET_TEMPERATURE',
            label: 'Set temperature',
            payloads: [
                {
                    name: 'targetTemp',
                    label: 'Target Temperature (°C)',
                    type: 'number',
                    min: 10,
                    max: 30
                }
            ]
        },
        {
            actionType: 'SET_MODE',
            label: 'Set mode',
            payloads: [
                {
                    name: 'mode',
                    label: 'Work mode',
                    type: 'select',
                    options: ['HEAT', 'COOL', 'OFF']
                }
            ]
        }
    ],
    'AIR_CONDITIONER': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'ON/OFF',
            payloads: ['ON', 'OFF']
        },
        {
            actionType: 'SET_TEMPERATURE',
            label: 'Set temperature',
            payloads: [
                {
                    name: 'targetTemp',
                    label: 'Target temperature (°C)',
                    type: 'number',
                    min: 16,
                    max: 30
                }
            ]
        },
        {
            actionType: 'SET_MODE',
            label: 'Set mode',
            payloads: [
                {
                    name: 'mode',
                    label: 'Work mode',
                    type: 'select',
                    options: ['HEAT', 'COOL', 'OFF']
                }
            ]
        }
    ],
    'SMART_OUTLET': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'Toggle ON/OFF',
            payloads: ['ON', 'OFF']
        }
    ],
    'SMART_BLIND': [
        {
            actionType: 'SET_POSITION',
            label: 'Set position',
            payloads: [
                {
                    name: 'position',
                    label: 'Position (%)',
                    type: 'number',
                    min: 0,
                    max: 100
                }
            ]
        },
        {
            actionType: 'OPEN',
            label: 'Fully open',
            payloads: []
        },
        {
            actionType: 'CLOSE',
            label: 'Fully close',
            payloads: []
        }
    ]
};

const ROUTINE_FORM_TEMPLATE = {
    DEVICE_TYPES,
    TIMES_OF_DAY,
    TRIGGER_TYPES,
    LOGICAL_OPERATORS,
    CONDITION_TYPES,
    ICONS,
    availableActions
}

let currentTimeOfDay = TIMES_OF_DAY[0];

let userPresence = true;

let outsideTemperature = 28;

let simulationIntervalId = null;

let simulationIntervalDuration = 5000;

let deviceIdCounter = 30;

let roomIdCounter = 5;

let routineIdCounter = 6;

let QuickActionIdCounter = 10;

let preferenceIdCounter = 15;

let devices = [
    {
        "id": "device-007",
        "name": "Living Room Blinds",
        "type": "SMART_BLIND",
        "roomId": "room-001",
        "state": {
            "position": 0
        },
        "supportedActions": [
            "SET_POSITION",
            "OPEN",
            "CLOSE"
        ]
    },
    {
        "id": "device-008",
        "name": "Living Room Main Light",
        "type": "LIGHT",
        "roomId": "room-001",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-009",
        "name": "Living Room TV Light",
        "type": "LIGHT",
        "roomId": "room-001",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-010",
        "name": "Living Room A/C",
        "type": "AIR_CONDITIONER",
        "roomId": "room-001",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "temperature": 27.9,
            "targetTemp": 24,
            "mode": "OFF",
            "prevMode": "COOL"
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_TEMPERATURE",
            "SET_MODE"
        ]
    },
    {
        "id": "device-013",
        "name": "Entertainment System",
        "type": "SMART_OUTLET",
        "roomId": "room-001",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "powerUsage": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "READ_POWER_USAGE"
        ]
    },
    {
        "id": "device-014",
        "name": "Kitchen Main Light",
        "type": "LIGHT",
        "roomId": "room-002",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-015",
        "name": "Kitchen Desk Lights",
        "type": "LIGHT",
        "roomId": "room-002",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-016",
        "name": "Coffee Machine",
        "type": "SMART_OUTLET",
        "roomId": "room-002",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "powerUsage": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "READ_POWER_USAGE"
        ]
    },
    {
        "id": "device-017",
        "name": "Kitchen Sensor",
        "type": "SENSOR",
        "roomId": "room-002",
        "state": {
            "temperature": 28,
            "humidity": 68
        },
        "supportedActions": [
            "READ"
        ]
    },
    {
        "id": "device-018",
        "name": "Bathroom Main Light",
        "type": "LIGHT",
        "roomId": "room-004",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-019",
        "name": "Bathroom Mirror Light",
        "type": "LIGHT",
        "roomId": "room-004",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-020",
        "name": "Bathroom Wall Heather",
        "type": "SMART_OUTLET",
        "roomId": "room-004",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "powerUsage": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "READ_POWER_USAGE"
        ]
    },
    {
        "id": "device-021",
        "name": "Bathroom Sensor",
        "type": "SENSOR",
        "roomId": "room-004",
        "state": {
            "temperature": 28,
            "humidity": 49
        },
        "supportedActions": [
            "READ"
        ]
    },
    {
        "id": "device-022",
        "name": "Bathroom Floor Heating",
        "type": "THERMOSTAT",
        "roomId": "room-004",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "temperature": 27.9,
            "targetTemp": 22,
            "mode": "OFF",
            "prevMode": "HEAT"
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_TEMPERATURE",
            "SET_MODE"
        ]
    },
    {
        "id": "device-023",
        "name": "Balcony Lights",
        "type": "LIGHT",
        "roomId": "room-005",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-024",
        "name": "Balcony Blinds",
        "type": "SMART_BLIND",
        "roomId": "room-005",
        "state": {
            "position": 0
        },
        "supportedActions": [
            "SET_POSITION",
            "OPEN",
            "CLOSE"
        ]
    },
    {
        "id": "device-025",
        "name": "Balcony Sensor",
        "type": "SENSOR",
        "roomId": "room-005",
        "state": {
            "temperature": 28,
            "humidity": 40
        },
        "supportedActions": [
            "READ"
        ]
    },
    {
        "id": "device-026",
        "name": "Bedroom A/C",
        "type": "AIR_CONDITIONER",
        "roomId": "room-003",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "temperature": 28,
            "targetTemp": 24,
            "mode": "OFF",
            "prevMode": "COOL"
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_TEMPERATURE",
            "SET_MODE"
        ]
    },
    {
        "id": "device-027",
        "name": "Bedroom Light",
        "type": "LIGHT",
        "roomId": "room-003",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    },
    {
        "id": "device-028",
        "name": "Bedroom Blinds",
        "type": "SMART_BLIND",
        "roomId": "room-003",
        "state": {
            "position": 0
        },
        "supportedActions": [
            "SET_POSITION",
            "OPEN",
            "CLOSE"
        ]
    },
    {
        "id": "device-029",
        "name": "Bedroom Night Light",
        "type": "LIGHT",
        "roomId": "room-003",
        "state": {
            "roomState": "OFF",
            "isOn": false,
            "brightness": 0
        },
        "supportedActions": [
            "TOGGLE_ON_OFF",
            "SET_BRIGHTNESS"
        ]
    }
];

let Rooms = [
    {
        id: 'room-001',
        name: 'Living Room',
        isOn: true
    },
    {
        id: 'room-002',
        name: 'Kitchen',
        isOn: true
    },
    {
        id: 'room-003',
        name: 'Bedroom',
        isOn: true
    },
    {
        id: 'room-004',
        name: 'Bathroom',
        isOn: true
    },
    {
        id: 'room-005',
        name: 'Balcony',
        isOn: true
    }
];

let routines = [
    {
        "id": "routine-001",
        "name": "Buđenje",
        "description": "Ujutro otvara sve rolete u kući, uključi klimu u dnevnom boravku, termostat u WC-u te mašinu za kavu.",
        "icon": "bi bi-sunrise",
        "isEnabled": true,
        "includedDevices": [
            "device-007",
            "device-024",
            "device-028",
            "device-010",
            "device-016",
            "device-022"
        ],
        "includedRooms": [
            "room-001",
            "room-005",
            "room-003",
            "room-002",
            "room-004"
        ],
        "triggers": {
            "logicalOperator": "OR",
            "list": [
                {
                    "type": "TIME_OF_DAY_CHANGE",
                    "value": "MORNING"
                }
            ]
        },
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "USER_PRESENCE",
                    "value": true
                }
            ]
        },
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-007",
                "actionType": "OPEN",
                "payload": {}
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-024",
                "actionType": "OPEN",
                "payload": {}
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-028",
                "actionType": "OPEN",
                "payload": {}
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-010",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-016",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-022",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            }
        ],
        "routineId": "routine-001"
    },
    {
        "id": "routine-003",
        "name": "Dobrodošao kući",
        "description": "Prilikom ulaska u kuću, ako je mrak, upale se dva najveća svijetla.",
        "icon": "bi bi-house-door",
        "isEnabled": true,
        "includedDevices": [
            "device-008",
            "device-014"
        ],
        "includedRooms": [
            "room-001",
            "room-002"
        ],
        "triggers": {
            "logicalOperator": "OR",
            "list": [
                {
                    "type": "USER_PRESENCE_CHANGE",
                    "value": true
                }
            ]
        },
        "conditions": {
            "logicalOperator": "OR",
            "list": [
                {
                    "type": "TIME_OF_DAY",
                    "value": "EVENING"
                },
                {
                    "type": "TIME_OF_DAY",
                    "value": "NIGHT"
                }
            ]
        },
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-008",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-014",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            }
        ],
        "routineId": "routine-003"
    },
    {
        "id": "routine-004",
        "name": "Spavanje",
        "description": "Kad je vrijeme za spavanje, u spavaćoj sobi zatvore se rolete, upali se klima, ugasi glavno svijetlo i upali noćno svijetlo.",
        "icon": "bi bi-moon-stars",
        "isEnabled": true,
        "includedDevices": [
            "device-028",
            "device-027",
            "device-029"
        ],
        "includedRooms": [
            "room-003"
        ],
        "triggers": {
            "logicalOperator": "OR",
            "list": [
                {
                    "type": "TIME_OF_DAY_CHANGE",
                    "value": "NIGHT"
                }
            ]
        },
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "USER_PRESENCE",
                    "value": true
                }
            ]
        },
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-028",
                "actionType": "CLOSE",
                "payload": {}
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-027",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-029",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            }
        ],
        "routineId": "routine-004"
    },
    {
        "id": "routine-006",
        "name": "Ugasi sve",
        "description": "Prilikom izlaska iz kuće, sve se ugasi.",
        "icon": "bi bi-power",
        "isEnabled": true,
        "includedDevices": [
            "device-008",
            "device-009",
            "device-014",
            "device-015",
            "device-018",
            "device-019",
            "device-023",
            "device-027",
            "device-029",
            "device-013",
            "device-016",
            "device-020",
            "device-022",
            "device-010",
            "device-026"
        ],
        "includedRooms": [
            "room-001",
            "room-002",
            "room-004",
            "room-005",
            "room-003"
        ],
        "triggers": {
            "logicalOperator": "OR",
            "list": [
                {
                    "type": "USER_PRESENCE_CHANGE",
                    "value": false
                }
            ]
        },
        "conditions": {
            "logicalOperator": "AND",
            "list": []
        },
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-008",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-009",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-014",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-015",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-018",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-019",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-023",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-027",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-029",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-013",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-016",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-020",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-022",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "OFF"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-010",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "OFF"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-026",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "OFF"
                }
            }
        ]
    }
];

let QuickAction = [
    {
        "id": "quickaction-001",
        "name": "Movie",
        "description": "Movie time",
        "includedDevices": [
            "device-007",
            "device-008",
            "device-009",
            "device-013"
        ],
        "includedRooms": [
            "room-001"
        ],
        "icon": "bi bi-film",
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-007",
                "actionType": "CLOSE",
                "payload": {}
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-008",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-009",
                "actionType": "SET_BRIGHTNESS",
                "payload": {
                    "brightness": 10
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-013",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            }
        ]
    },
    {
        "id": "quickaction-002",
        "name": "LightsOut",
        "description": "Eppy time",
        "includedDevices": [
            "device-008",
            "device-009",
            "device-014",
            "device-015",
            "device-018",
            "device-019",
            "device-027",
            "device-029"
        ],
        "includedRooms": [
            "room-001",
            "room-002",
            "room-004",
            "room-003"
        ],
        "icon": "bi bi-lightbulb",
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-008",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-009",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-014",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-015",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-018",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-019",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-027",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-029",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-023",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            }
        ]
    },
    {
        "id": "quickaction-003",
        "name": "HeatMax",
        "description": "VERY HOT",
        "includedDevices": [
            "device-010",
            "device-020",
            "device-022",
            "device-026"
        ],
        "includedRooms": [
            "room-001",
            "room-004",
            "room-003"
        ],
        "icon": "bi bi-thermometer",
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-010",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "HEAT"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-010",
                "actionType": "SET_TEMPERATURE",
                "payload": {
                    "targetTemp": 30
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-020",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-022",
                "actionType": "SET_TEMPERATURE",
                "payload": {
                    "targetTemp": 30
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-022",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "HEAT"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-026",
                "actionType": "SET_TEMPERATURE",
                "payload": {
                    "targetTemp": 30
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-026",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "HEAT"
                }
            }
        ]
    },
    {
        "id": "quickaction-004",
        "name": "CoolMax",
        "description": "Very Cold",
        "includedDevices": [
            "device-010",
            "device-026",
            "device-022",
            "device-020"
        ],
        "includedRooms": [
            "room-001",
            "room-003",
            "room-004"
        ],
        "icon": "bi bi-snow2",
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-010",
                "actionType": "SET_TEMPERATURE",
                "payload": {
                    "targetTemp": 16
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-010",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "COOL"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-026",
                "actionType": "SET_TEMPERATURE",
                "payload": {
                    "targetTemp": 16
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-026",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "COOL"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-022",
                "actionType": "SET_MODE",
                "payload": {
                    "mode": "OFF"
                }
            },
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-020",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": false
                }
            }
        ]
    },
    {
        "id": "quickaction-005",
        "name": "Coffee",
        "description": "Maketh the Coffee",
        "includedDevices": [
            "device-016"
        ],
        "includedRooms": [
            "room-002"
        ],
        "icon": "bi bi-droplet-fill",
        "actions": [
            {
                "type": "DEVICE_ACTION",
                "deviceId": "device-016",
                "actionType": "TOGGLE_ON_OFF",
                "payload": {
                    "isOn": true
                }
            }
        ]
    }
];

let preferences = [
    {
        "id": "pref-010",
        "name": "Svjetlina",
        "description": "Svjetlina podešena na 60%",
        "icon": "bi bi-lightbulb",
        "roomId": "room-001",
        "conditions": {
            "logicalOperator": "AND",
            "list": []
        },
        "actions": [
            {
                "deviceType": "LIGHT",
                "state": {
                    "brightness": 60
                }
            }
        ]
    },
    {
        "id": "pref-011",
        "name": "Grijanje",
        "description": "Ako je vanjska temperatura ispod 20 stupnjeva, upali grijanje na 24 stupnja.",
        "icon": "bi bi-thermometer",
        "roomId": "room-001",
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "OUTSIDE_TEMPERATURE",
                    "operator": "<",
                    "value": 20
                }
            ]
        },
        "actions": [
            {
                "deviceType": "AIR_CONDITIONER",
                "state": {
                    "targetTemp": 24,
                    "mode": "HEAT"
                }
            }
        ]
    },
    {
        "id": "pref-012",
        "name": "Hlađenje",
        "description": "Ako je vanjska temperatura iznad 30 stupnjeva, postavi hlađenje na 24 stupnja.",
        "icon": "bi bi-wind",
        "roomId": "room-001",
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "OUTSIDE_TEMPERATURE",
                    "operator": ">",
                    "value": 30
                }
            ]
        },
        "actions": [
            {
                "deviceType": "AIR_CONDITIONER",
                "state": {
                    "targetTemp": 24,
                    "mode": "COOL"
                }
            }
        ]
    },
    {
        "id": "pref-009",
        "name": "Svjetlina",
        "description": "Svjetlina podešena na 90%",
        "icon": "bi bi-lightbulb",
        "roomId": "room-002",
        "conditions": {
            "logicalOperator": "AND",
            "list": []
        },
        "actions": [
            {
                "deviceType": "LIGHT",
                "state": {
                    "brightness": 90
                }
            }
        ]
    },
    {
        "id": "pref-006",
        "name": "Hlađenje",
        "description": "Ako je vanjska temperatura iznad 30 upali hlađenje na 26 stupnjeva.",
        "icon": "bi bi-wind",
        "roomId": "room-003",
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "OUTSIDE_TEMPERATURE",
                    "operator": ">",
                    "value": 28
                }
            ]
        },
        "actions": [
            {
                "deviceType": "AIR_CONDITIONER",
                "state": {
                    "targetTemp": 26,
                    "mode": "COOL"
                }
            }
        ]
    },
    {
        "id": "pref-007",
        "name": "Grijanje",
        "description": "Ako je vanjska temperatura niža od 20 stupnjeva grijanje postavljeno na 25.",
        "icon": "bi bi-thermometer",
        "roomId": "room-003",
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "OUTSIDE_TEMPERATURE",
                    "operator": "<",
                    "value": 20
                }
            ]
        },
        "actions": [
            {
                "deviceType": "AIR_CONDITIONER",
                "state": {
                    "targetTemp": 25,
                    "mode": "HEAT"
                }
            }
        ]
    },
    {
        "id": "pref-008",
        "name": "Svjetlina",
        "description": "Svjetlina podešena na 30%",
        "icon": "bi bi-lightbulb",
        "roomId": "room-003",
        "conditions": {
            "logicalOperator": "AND",
            "list": []
        },
        "actions": [
            {
                "deviceType": "LIGHT",
                "state": {
                    "brightness": 30
                }
            }
        ]
    },
    {
        "id": "pref-004",
        "name": "Grijanje",
        "description": "Grijanje na 25 stupnjeva ako je vanjska temperatura ispod 20.",
        "icon": "bi bi-sunrise",
        "roomId": "room-004",
        "conditions": {
            "logicalOperator": "AND",
            "list": [
                {
                    "type": "OUTSIDE_TEMPERATURE",
                    "operator": "<",
                    "value": 20
                }
            ]
        },
        "actions": [
            {
                "deviceType": "THERMOSTAT",
                "state": {
                    "targetTemp": 25,
                    "mode": "HEAT"
                }
            }
        ]
    },
    {
        "id": "pref-005",
        "name": "Svjetlina",
        "description": "Svjetlina podešena na 85%",
        "icon": "bi bi-lightbulb",
        "roomId": "room-004",
        "conditions": {
            "logicalOperator": "AND",
            "list": []
        },
        "actions": [
            {
                "deviceType": "LIGHT",
                "state": {
                    "brightness": 85
                }
            }
        ]
    },
    {
        "id": "pref-003",
        "name": "Svjetlina",
        "description": "Svjetlina podeđena na 70%",
        "icon": "bi bi-lightbulb",
        "roomId": "room-005",
        "conditions": {
            "logicalOperator": "AND",
            "list": []
        },
        "actions": [
            {
                "deviceType": "LIGHT",
                "state": {
                    "brightness": 70
                }
            }
        ]
    }
];

function checkPreferences(device) {
    const roomPreferences = preferences.filter(p => p.roomId === device.roomId);
    if (roomPreferences.length === 0) return null;

    let finalPreferredState = null;

    for (const pref of roomPreferences) {
        const evaluateCondition = (cond) => {
            switch (cond.type) {
                case 'TIME_OF_DAY':
                    return currentTimeOfDay === cond.value;
                case 'USER_PRESENCE':
                    return userPresence === cond.value;
                case 'OUTSIDE_TEMPERATURE':
                    if (cond.operator === '<') return outsideTemperature < cond.value;
                    if (cond.operator === '>') return outsideTemperature > cond.value;
                    return false;
                default:
                    return false;
            }
        };

        let conditionsMet = false;
        const conditions = pref.conditions;

        if (!conditions || !conditions.list || conditions.list.length === 0) {
            conditionsMet = true;
        } else if (conditions.logicalOperator === 'AND') {
            conditionsMet = conditions.list.every(evaluateCondition);
        } else if (conditions.logicalOperator === 'OR') {
            conditionsMet = conditions.list.some(evaluateCondition);
        }

        if (conditionsMet) {
            const actionForDevice = pref.actions.find(act => act.deviceType === device.type);
            if (actionForDevice) {
                finalPreferredState = actionForDevice.state;
                console.log(`Pronađena aktivna preferencija: "${pref.name}"`);
                break;
            }
        }
    }
    return finalPreferredState;
}

// Funkcije za upravljanje rutinama
function routineManager(trigger) {
    console.log(`Motor za rutine pokrenut, okidač: ${trigger.type}, vrijednost: ${trigger.value}`);

    const checkConditions = (conditions) => {
        if (!conditions || conditions.list.length === 0) {
            return true;
        }

        const evaluate = (condition) => {
            if (condition.type === 'USER_PRESENCE') {
                return userPresence === condition.value;
            }
            if (condition.type === 'OUTSIDE_TEMPERATURE') {
                if (condition.operator === '<') return outsideTemperature < condition.value;
                if (condition.operator === '>') return outsideTemperature > condition.value;
            }
            if (condition.type === 'TIME_OF_DAY') {
                return currentTimeOfDay === condition.value;
            }
            return false;
        };

        if (conditions.logicalOperator === 'AND') {
            return conditions.list.every(evaluate);
        }
        if (conditions.logicalOperator === 'OR') {
            return conditions.list.some(evaluate);
        }
        return false;
    };

    const checkTriggers = (routineTrigger) => {
        return routineTrigger.list.some(
            t => t.type === trigger.type && t.value === trigger.value
        );
    };

    let updatedDevices = [];

    for (const routine of routines) {
        let updatedDevicesInIteration = [];
        if (!routine.isEnabled) {
            continue;
        }

        if (checkTriggers(routine.triggers) && checkConditions(routine.conditions)) {
            console.log(`Rutina "${routine.name}" aktivirana. Izvršavam akcije.`);

            routine.actions.forEach(action => {
                if (action.type === 'DEVICE_ACTION') {
                    updatedDevicesInIteration.push(executeDeviceAction(action.deviceId, action.actionType, action.payload));
                }
            });
        }

        updatedDevicesInIteration.forEach(device => {
            if (device && !updatedDevices.includes(device)) {
                updatedDevices.push(device);
            } else if (device && updatedDevices.includes(device)) {
                updatedDevices.splice(updatedDevices.indexOf(device), 1);
                updatedDevices.push(device);
            }
        });
    }
    return updatedDevices;
}

// Funkcija za dodavanje rutine
function addRoutine({ name, description, icon, triggers, conditions, actions }) {
    const includedDevices = [];
    const includedRooms = new Set();

    actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION') {
            if (!includedDevices.includes(action.deviceId)) {
                includedDevices.push(action.deviceId);
            }
        }
    });

    includedDevices.forEach(deviceId => {
        const device = getDeviceById(deviceId);
        if (device) {
            includedRooms.add(device.roomId);
        }
    });

    const newRoutine = {
        id: `routine-${String(++routineIdCounter).padStart(3, '0')}`, // Malo skraćeno
        name,
        description,
        icon: icon || 'bi bi-gear',
        isEnabled: true,
        includedDevices,
        includedRooms: [...includedRooms],
        triggers,
        conditions,
        actions
    };

    routines.push(newRoutine);
    console.log(`Rutina "${name}" dodana.`);
    return newRoutine;
}

function editRoutine({ routineId, name, description, icon, triggers, conditions, actions }) {
    const includedDevices = [];
    const includedRooms = new Set();

    actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION') {
            if (!includedDevices.includes(action.deviceId)) {
                includedDevices.push(action.deviceId);
            }
        }
    });

    includedDevices.forEach(deviceId => {
        const device = getDeviceById(deviceId);
        if (device) {
            includedRooms.add(device.roomId);
        }
    });

    const newRoutine = {
        routineId,
        name,
        description,
        icon: icon || 'bi bi-gear',
        isEnabled: true,
        includedDevices,
        includedRooms: [...includedRooms],
        triggers,
        conditions,
        actions
    };

    const index = routines.findIndex(r => r.id === routineId);
    if (index !== -1) {
        routines[index] = { ...routines[index], ...newRoutine };
        console.log(`Rutina "${name}" uređena.`);
        return routines[index];
    }
}

// Funkcija za dodavanje quick action
function addQuickAction({ name, description, icon, actions }) {
    const includedDevices = [];
    const includedRooms = new Set();

    actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION') {
            if (!includedDevices.includes(action.deviceId)) {
                includedDevices.push(action.deviceId);
            }
        }
    });

    includedDevices.forEach(deviceId => {
        const device = getDeviceById(deviceId);
        if (device) {
            includedRooms.add(device.roomId);
        }
    });


    const newQuickAction = {
        id: `quickaction-${String(++QuickActionIdCounter).padStart(3, '0')}`,
        name,
        description,
        includedDevices,
        includedRooms: [...includedRooms],
        icon: icon || 'bi bi-gear',
        actions
    }

    QuickAction.push(newQuickAction);
    console.log(`Quick Action "${name}" dodana.`);
    return newQuickAction;
}

// Funkcija za brisanje quick action
function removeQuickAction(quickActionId) {
    const index = QuickAction.findIndex(qa => qa.id === quickActionId);
    if (index !== -1) {
        const removed = QuickAction.splice(index, 1)[0];
        console.log(`Quick Action "${removed.name}" uklonjena.`);
        return removed;
    }
    return false;
}

// Funkcija za uklanjanje rutine
function removeRoutine(routineId) {
    const index = routines.findIndex(r => r.id === routineId);
    if (index !== -1) {
        const removedRoutine = routines.splice(index, 1)[0];
        console.log(`Rutina "${removedRoutine.name}" uklonjena.`);
        return removedRoutine;
    }
    return false;
}

// Funkcija za dohvat svih rutina
function getAllRoutines() {
    return routines;
}

// Funkcija za dohvat rutine po ID-u
function getRoutineById(routineId) {
    return routines.find(r => r.id === routineId);
}

function startSimulation(newDuration) {
    if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
    }

    simulationIntervalDuration = newDuration;
    simulationIntervalId = setInterval(simulateTemperatureChanges, simulationIntervalDuration);
    console.log(`Simulacija je pokrenuta s intervalom od ${simulationIntervalDuration / 1000}s.`);
}

function getSimulationInterval() {
    return simulationIntervalDuration;
}

startSimulation(simulationIntervalDuration);

// Ažurirajanje vanjske temperature
function setOutsideTemperature(newTemp) {
    if (typeof newTemp === 'number') {
        outsideTemperature = Math.max(-15, Math.min(45, newTemp));
        console.log(`Vanjska temperatura ažurirana na: ${outsideTemperature}°C`);
        return outsideTemperature;
    } else {
        console.warn('Ažuriranje vanjske temperature nije uspjelo. Unesite ispravnu brojčanu vrijednost.');
        return null;
    }
}

// Funkcija za dohvat vanjske temperature
function getOutsideTemperature() {
    return outsideTemperature;
}

function simulateTemperatureChanges() {
    const INERTIA_FACTOR = 0.1;

    devices.forEach(device => {
        if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER' || device.type === 'SENSOR') {
            let currentDeviceTemp = device.state.temperature;
            let targetDeviceSimTemp = currentDeviceTemp; // Temperatura kojoj će simulacija težiti

            if (device.type === 'SENSOR') { // SENZOR
                let UVJET = false;
                for (const tempdevice of devices) {
                    if ((tempdevice.type === 'THERMOSTAT' || tempdevice.type === 'AIR_CONDITIONER')
                        && tempdevice.roomId === device.roomId) {
                        device.state.temperature = tempdevice.state.temperature;
                        UVJET = true;
                        break;
                    }
                }
                if (!UVJET) {
                    device.state.temperature = outsideTemperature;
                }
                let currentHumidity = device.state.humidity;
                let randomChange = (Math.random() - 0.5) * 2; // Nasumična promjena između -1 i 1
                device.state.humidity = Math.max(0, Math.min(100, parseFloat((currentHumidity + randomChange).toFixed(0))));
            } else { // THERMOSTAT ili AIR_CONDITIONER
                const mode = device.state.mode;
                const targetUserTemp = device.state.targetTemp;

                if (mode === 'OFF') {
                    // Ako je uređaj ISKLJUČEN, teži vanjskoj temperaturi
                    targetDeviceSimTemp = outsideTemperature;
                } else if (mode === 'HEAT') {
                    if ((targetUserTemp <= currentDeviceTemp && currentDeviceTemp <= outsideTemperature) ||
                        (currentDeviceTemp <= targetUserTemp && targetUserTemp <= outsideTemperature) ||
                        (targetUserTemp <= outsideTemperature && outsideTemperature <= currentDeviceTemp)
                    ) {
                        targetDeviceSimTemp = outsideTemperature;
                    } else {
                        targetDeviceSimTemp = targetUserTemp;
                    }
                } else if (mode === 'COOL') {
                    if ((targetUserTemp <= currentDeviceTemp && currentDeviceTemp <= outsideTemperature) ||
                        (currentDeviceTemp <= targetUserTemp && targetUserTemp <= outsideTemperature) ||
                        (targetUserTemp <= outsideTemperature && outsideTemperature <= currentDeviceTemp)
                    ) {
                        targetDeviceSimTemp = targetUserTemp;
                    } else {
                        targetDeviceSimTemp = outsideTemperature;
                    }
                }

                let change = (targetDeviceSimTemp - currentDeviceTemp) * INERTIA_FACTOR;
                if (Math.abs(change) < 0.1) {
                    change = targetDeviceSimTemp > currentDeviceTemp ? 0.1 : -0.1; // Osiguraj minimalnu promjenu
                }
                let newTemp = currentDeviceTemp + change;
                device.state.temperature = parseFloat(newTemp.toFixed(1));
            }
        }
    });
    // console.log('Simulirane temperature ažurirane.');
}

// Funkcija za dohvat svih uređaja
function getAllDevices() {
    return devices;
}

//Funkcija za dohvat uređaja po ID-u
function getDeviceById(deviceId) {
    return devices.find(device => device.id === deviceId);
}

// Funkcija za izvršavanje akcije na uređaju
function executeDeviceAction(deviceId, actionType, payload) {
    const device = getDeviceById(deviceId);
    if (!device) {
        console.error(`Uređaj s ID-om '${deviceId} nije pronađen.`);
        return null;
    }

    function adjustTempConditioner() {
        if (actionType === 'TOGGLE_ON_OFF' && (payload?.isOn === true || !device.state.isOn)) {
            const preferredState = checkPreferences(device);
            if (preferredState) {
                device.state = { ...device.state, ...preferredState, isOn: true };
                device.state.roomState = 'ON';
                if (preferredState.mode) device.state.prevMode = preferredState.mode;

                console.log(`Primijenjena preferencija za ${device.name}:`, device.state);
                return;
            }
        }
        if (actionType === 'SET_TEMPERATURE') {
            if (payload && typeof payload.targetTemp === 'number') {
                device.state.targetTemp = Math.max(10, Math.min(30, payload.targetTemp));
            } else {
                console.warn('SET_TEMPERATURE pozvana bez ispravnog payload-a.');
                return null;
            }
        } else if (actionType === 'TOGGLE_ON_OFF') {
            let turnOn;
            if (payload && typeof payload.isOn === 'boolean') {
                turnOn = payload.isOn;
            } else {
                turnOn = !device.state.isOn;
            }
            device.state.isOn = turnOn;
            device.state.roomState = turnOn ? 'ON' : 'OFF';
            device.state.mode = turnOn ? device.state.prevMode : 'OFF';

        } else if (actionType === 'SET_MODE') {
            if (payload && ['HEAT', 'COOL'].includes(payload.mode)) {
                device.state.mode = device.state.prevMode = payload.mode;
                device.state.isOn = true;
                device.state.roomState = 'ON';
            } else if (payload && payload.mode === 'OFF') {
                device.state.mode = payload.mode;
                device.state.isOn = false;
                device.state.roomState = 'OFF';
            } else {
                console.warn('SET_MODE pozvana bez ispravnog payload-a.');
                return null;
            }
        } else if (actionType === 'READ_TEMPERATURE') {
            return device.state.temperature;
        } else {
            console.warn(`Nepoznata akcija za THERMOSTAT uređaj: ${actionType}`);
            return null;
        }
    }

    switch (device.type) {
        case 'LIGHT':
            if (actionType === 'TOGGLE_ON_OFF') {
                let turnOn;
                if (payload && typeof payload.isOn === 'boolean') {
                    turnOn = payload.isOn;
                } else {
                    turnOn = !device.state.isOn;
                }
                if (turnOn) {
                    const preferredState = checkPreferences(device);
                    if (preferredState) {
                        device.state = { ...device.state, ...preferredState, isOn: true };
                        device.state.roomState = 'ON';
                        console.log(`Primijenjena preferencija za ${device.name}:`, device.state);
                        break;
                    }
                }
                device.state.isOn = turnOn;
                device.state.roomState = turnOn ? 'ON' : 'OFF';
            } else if (actionType === 'SET_BRIGHTNESS') {
                if (payload && typeof payload.brightness === 'number') {
                    device.state.brightness = Math.max(0, Math.min(100, payload.brightness));
                    device.state.isOn = true;
                    device.state.roomState = 'ON';
                } else {
                    console.warn('SET_BRIGHTNESS pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else {
                console.warn(`Nepoznata akcija za LIGHT uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'THERMOSTAT':
            adjustTempConditioner();
            break;
        case 'SMART_OUTLET':
            if (actionType === 'TOGGLE_ON_OFF') {
                if (payload && typeof payload.isOn === 'boolean') {
                    device.state.isOn = payload.isOn;
                } else {
                    device.state.isOn = !device.state.isOn;
                }
                device.state.roomState = device.state.isOn ? 'ON' : 'OFF';
            } else if (actionType === 'READ_POWER_USAGE') {
                device.state.powerUsage = parseFloat((Math.random() * 100).toFixed(1));
                return device.state.powerUsage;
            } else {
                console.warn(`Nepoznata akcija za SMART_OUTLET uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'SMART_BLIND':
            if (actionType === 'SET_POSITION') {
                if (payload && typeof payload.position === 'number') {
                    device.state.position = Math.max(0, Math.min(100, payload.position));
                } else {
                    console.warn('SET_POSITION pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'OPEN') {
                device.state.position = 0; // Otvori roletu
            } else if (actionType === 'CLOSE') {
                device.state.position = 100; // Zatvori roletu
            } else {
                console.warn(`Nepoznata akcija za SMART_BLIND uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'AIR_CONDITIONER':
            adjustTempConditioner();
            break;
        case 'SENSOR':
            if (actionType === 'READ') {
                return device.state;
            } else {
                console.warn(`Nepoznata akcija za SENSOR uređaj: ${actionType}`);
                return null;
            }
            break;
        default:
            console.warn(`Nepoznat tip uređaja: ${device.type}`);
            return null;
    }

    console.log(`Novo stanje uređaja ${device.name}:`, device.state);
    return device;
}

// Funkcija za dohvat svih uređaja u sobi
function getAllDevicesByRoom(roomId) {
    const filteredDevices = devices.filter(device => device.roomId === roomId);

    if (filteredDevices.length === 0) {
        console.warn(`Nema uređaja u sobi s ID-om ${roomId}.`);
        return null;
    }
    return filteredDevices;
}

// Funkcija za dohvat svih soba s uređajima
function getRoomsWithDevices() {
    return Rooms.map(room => {
        const devicesInRoom = devices.filter(device => device.roomId === room.id);
        return {
            id: room.id,
            name: room.name,
            isOn: room.isOn,
            devices: devicesInRoom,
            numDevices: devicesInRoom.length
        };
    });
}

// Funkcija za dohvat tipova uređaja
function fetchDeviceTypes() {
    return DEVICE_TYPES;
}

// Funkcija za dodavanje nove sobe
function addRoom(roomName) {
    if (!roomName) {
        console.error('Dodavanje sobe nije uspjelo. Naziv sobe je obavezan.');
        return null;
    }

    const existingRoom = Rooms.find(room => room.name.toLowerCase() === roomName.toLowerCase());
    if (existingRoom) {
        console.error(`Soba s imenom '${roomName}' već postoji.`);
        return null;
    }

    const newRoomId = `room-${String(roomIdCounter + 1).padStart(3, '0')}`;
    roomIdCounter++;

    const newRoom = {
        id: newRoomId,
        name: roomName,
        isOn: false
    };

    Rooms.push(newRoom);
    console.log(`Soba ${newRoom.name} dodana.`);
    return newRoom;
}

// Funkcija za dodavanje novog uređaja
function addDevice({ name, type, roomId }) {
    if (!name || !type || !roomId) {
        console.error('Nedostaju podaci za kreiranje uređaja.');
        return { error: 'Nedostaju podaci (ime, tip, ili soba).' };
    }

    if (!DEVICE_TYPES.includes(type)) {
        console.error(`Pokušaj kreiranja uređaja s nepostojećim tipom: ${type}`);
        return { error: `Nepostojeći tip uređaja: ${type}` };
    }

    const newDeviceId = `device-${String(deviceIdCounter + 1).padStart(3, '0')}`;
    deviceIdCounter++;

    const newDevice = {
        id: newDeviceId,
        name: name,
        type: type,
        roomId: roomId,
        state: {},
        supportedActions: []
    };

    switch (type) {
        case 'LIGHT':
            newDevice.state = { roomState: 'OFF', isOn: false, brightness: 0 };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'SET_BRIGHTNESS'];
            break;
        case 'THERMOSTAT':
            newDevice.state = { roomState: 'OFF', isOn: false, temperature: outsideTemperature, targetTemp: 22, mode: 'OFF', prevMode: 'HEAT' };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE'];
            break;
        case 'SMART_OUTLET':
            newDevice.state = { roomState: 'OFF', isOn: false, powerUsage: 0 };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'READ_POWER_USAGE'];
            break;
        case 'SMART_BLIND':
            newDevice.state = { position: 0 };
            newDevice.supportedActions = ['SET_POSITION', 'OPEN', 'CLOSE'];
            break;
        case 'AIR_CONDITIONER':
            newDevice.state = { roomState: 'OFF', isOn: false, temperature: outsideTemperature, targetTemp: 24, mode: 'OFF', prevMode: 'COOL' };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE'];
            break;
        case 'SENSOR':
            newDevice.state = { temperature: outsideTemperature, humidity: 50 };
            newDevice.supportedActions = ['READ'];
            break;
        default:
            newDevice.state = { status: 'unconfigured' };
            break;
    }

    devices.push(newDevice);
    console.log(`Uređaj ${newDevice.name} dodan u sobu ${roomId}.`);
    return { device: newDevice };
}

// Funkcija za uključivanje/isključivanje sobe
function roomToggle(roomId) {
    const room = Rooms.find(r => r.id === roomId);
    if (!room) {
        console.error("Soba s tim ID-om ne postoji.");
        return null;
    }

    const devicesInRoom = getAllDevicesByRoom(roomId);

    if (devicesInRoom.length === 0) {
        console.warn("Soba nema uređaja za uključivanje/isključivanje.");
        room.isOn = false;
        return null;
    }

    if (room.isOn) {
        room.isOn = false;
        devicesInRoom.forEach(device => {
            if (!['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'AIR_CONDITIONER'].includes(device.type)) return;
            device.state.isOn = false;
            if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER') {
                device.state.mode = 'OFF';
            }
        })
    } else {
        room.isOn = true;
        devicesInRoom.forEach(device => {
            if (!['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'AIR_CONDITIONER'].includes(device.type)) return;
            if (device.state.roomState === 'ON') {
                device.state.isOn = true;
                if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER') {
                    device.state.mode = device.state.prevMode;
                }
            }
        });
    }

    const updatedRoomWithDevices = {
        ...room,
        devices: devicesInRoom,
        numDevices: devicesInRoom.length
    };

    console.log(`Soba ${room.name} je sada ${room.isOn ? 'uključena' : 'isključena'}.`);
    return { room: updatedRoomWithDevices };
}

// Funkcija za brisanje uređaja
function removeDevice(deviceId) {
    const deviceIndex = devices.findIndex(device => device.id === deviceId);
    if (deviceIndex === -1) {
        console.error(`Uređaj s ID-om '${deviceId}' nije pronađen.`);
        return null;
    }

    const removedDevice = devices.splice(deviceIndex, 1)[0];
    console.log(`Uređaj ${removedDevice.name} uklonjen.`);
    return removedDevice;
}

// Funkcija za brisanje sobe
function removeRoom(roomId) {
    const roomIndex = Rooms.findIndex(room => room.id === roomId);
    if (roomIndex === -1) {
        console.error(`Soba s ID-om '${roomId}' nije pronađena.`);
        return null;
    }

    const removedRoom = Rooms.splice(roomIndex, 1)[0];
    console.log(`Soba ${removedRoom.name} uklonjena.`);

    devices = devices.filter(device => device.roomId !== roomId);
    console.log(`Uređaji iz sobe ${removedRoom.name} su uklonjeni.`);

    return removedRoom;
}

// Funkcija za uređivanje sobe
function editRoom({ roomId, newRoomName }) {
    const roomIndex = Rooms.findIndex(room => room.id === roomId);
    if (roomIndex === -1) {
        console.error(`Soba s ID-om '${roomId}' nije pronađena.`);
        return null;
    }
    Rooms[roomIndex].name = newRoomName;
    console.log(`Soba ${roomId} preimenovana u ${newRoomName}.`);
    return Rooms[roomIndex];
}

// Funkcija za uređivanje uređaja
function editDevice({ deviceId, newDeviceName, newRoomId }) {
    const deviceIndex = devices.findIndex(device => device.id === deviceId);
    if (deviceIndex === -1) {
        console.error(`Uređaj s ID-om '${deviceId}' nije pronađen.`);
        return null;
    }

    devices[deviceIndex].name = newDeviceName;
    devices[deviceIndex].roomId = newRoomId;

    console.log(`Uređaj ${deviceId} preimenovan u ${newDeviceName} i premješten u sobu ${newRoomId}.`);
    return devices[deviceIndex];
}

// Funkcija za dohvat svih tipova doba dana
function fetchTimesOfDay() {
    return TIMES_OF_DAY;
}

// Funkcija za dohvat trenutnog doba dana
function getCurrentTimeOfDay() {
    return currentTimeOfDay;
}

// Funkcija za postavljanje trenutnog doba dana
function setCurrentTimeOfDay(newTimeOfDay) {
    if (TIMES_OF_DAY.includes(newTimeOfDay)) {
        currentTimeOfDay = newTimeOfDay;
        console.log(`Trenutno doba dana postavljeno na: ${currentTimeOfDay}`);
    }
    else {
        console.warn(`Nepoznata vrijednost doba dana: ${newTimeOfDay}`);
    }
    let updatedDevices = routineManager({ type: 'TIME_OF_DAY_CHANGE', value: currentTimeOfDay });
    return { newTimeOfDay: currentTimeOfDay, updatedDevices: updatedDevices };
}

// Funkcija za dohvat prisutnosti korisnika
function getUserPresence() {
    return userPresence;
}

// Funkcija za postavljanje prisutnosti korisnika
function setUserPresence(isPresent) {
    if (typeof isPresent === 'boolean') {
        userPresence = isPresent;
        console.log(`Trenutna prisutnost korisnika postavljena na: ${userPresence ? 'prisutni' : 'odsutni'}`);
    } else {
        console.warn('Pogrešan tip vrijednosti za prisutnost korisnika. Očekuje se boolean.');
    }
    let updatedDevices = routineManager({ type: 'USER_PRESENCE_CHANGE', value: userPresence });
    return { newUserPresence: userPresence, updatedDevices: updatedDevices };
}

// Funkcija za dohvat predloška forme za rutine
function getRoutineFormTemplate() {
    return {
        ROUTINE_FORM_TEMPLATE
    };
}

// Funkcija za uključivanje/isključivanje rutine
function toggleRoutine(routineId, isEnabled) {
    const routine = getRoutineById(routineId);
    if (!routine) {
        console.error(`Rutina s ID-om '${routineId}' nije pronađena.`);
        return null;
    }

    routine.isEnabled = isEnabled;
    console.log(`Rutina "${routine.name}" je sada ${isEnabled ? 'aktivirana' : 'deaktivirana'}.`);
    return routine;
}

// Funkcija za dohvat svih quick action
function getQuickActions() {
    return QuickAction;
}

// Funkcija za izvršavanje quick action
function executeQuickAction(quickActionId) {
    let updatedDevices = [];

    const quickAction = QuickAction.find(qa => qa.id === quickActionId);
    if (!quickAction) {
        console.error(`Quick Action s ID-om '${quickActionId}' nije pronađena.`);
        return null;
    }

    console.log(`Izvršavanje Quick Action "${quickAction.name}".`);

    quickAction.actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION') {
            updatedDevices.push(executeDeviceAction(action.deviceId, action.actionType, action.payload));
        }
    });

    return updatedDevices;
}

// Funkcija za dodavanje nove preferencije
function addPreference({ name, description, icon, roomId, conditions, actions }) {
    const newPreference = {
        id: `pref-${String(++preferenceIdCounter).padStart(3, '0')}`,
        name,
        description,
        icon,
        roomId,
        conditions,
        actions
    };
    preferences.push(newPreference);
    console.log(`Nova preferencija dodana: "${name}"`);
    return newPreference;
}

// Funkcija za uklanjanje preferencije
function removePreference(prefId) {
    const index = preferences.findIndex(p => p.id === prefId);
    if (index !== -1) {
        const removedPref = preferences.splice(index, 1)[0];
        console.log(`Preferencija "${removedPref.name}" uklonjena.`);
        return removedPref;
    }
    return false;
}

// Funkcija za dohvat preferencija po sobi
function getPreferencesByRoom(roomId) {
    return preferences.filter(p => p.roomId === roomId);
}

// Funkcija za uređivanje preferencije
function editPreference(prefId, { name, description, icon, roomId, conditions, actions }) {
    const index = preferences.findIndex(p => p.id === prefId);
    if (index !== -1) {
        preferences[index] = {
            id: prefId,
            name,
            description,
            icon,
            roomId,
            conditions,
            actions
        };
        console.log(`Preferencija "${name}" uređena.`);
        return preferences[index];
    }
    return false;
}


module.exports = {
    getAllDevices,
    getDeviceById,
    executeDeviceAction,
    setOutsideTemperature,
    getOutsideTemperature,
    getAllDevicesByRoom,
    getRoomsWithDevices,
    addRoom,
    addDevice,
    fetchDeviceTypes,
    roomToggle,
    removeDevice,
    removeRoom,
    editRoom,
    editDevice,
    startSimulation,
    getSimulationInterval,
    getCurrentTimeOfDay,
    setCurrentTimeOfDay,
    getUserPresence,
    setUserPresence,
    fetchTimesOfDay,
    addRoutine,
    removeRoutine,
    getAllRoutines,
    getRoutineById,
    getRoutineFormTemplate,
    toggleRoutine,
    addQuickAction,
    removeQuickAction,
    getQuickActions,
    executeQuickAction,
    editRoutine,
    addPreference,
    removePreference,
    getPreferencesByRoom,
    editPreference
};
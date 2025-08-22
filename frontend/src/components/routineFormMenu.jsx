import '../styles/routineFormMenu.css';
import { getRoutineFormTemplate, addRoutine, addQuickAction, editRoutine, removeRoutine } from '../services/apiService';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const RoutineFormMenu = ({ onClose, allDevices, onAddRoutine, onAddQuickAction, routine, onDeletedRoutine, onEditedRoutine }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [triggers, setTriggers] = useState([{ id: 1, type: '', value: '' }]);
    const [conditions, setConditions] = useState([]);
    const [conditionsOperator, setConditionsOperator] = useState('AND');
    const [actions, setActions] = useState([{ id: 1, deviceId: '', actionType: '', payload: {} }]);
    const [feedback, setFeedback] = useState('');
    const [formTemplate, setFormTemplate] = useState(null);
    const [formType, setFormType] = useState('');

    useEffect(() => {
        if (routine) {
            setName(routine.name);
            setDescription(routine.description);
            setIcon(routine.icon);
            setTriggers(routine.triggers.list.map((trigger, index) => ({ id: index + 1, type: trigger.type, value: String(trigger.value) })));
            setConditions(routine.conditions.list.map((condition, index) => ({ id: index + 1, type: condition.type, operator: condition.operator, value: String(condition.value) })));
            setConditionsOperator(routine.conditions.logicalOperator);
            setActions(routine.actions.map((action, index) => ({ id: index + 1, deviceId: action.deviceId, actionType: action.actionType, payload: action.payload })));
            setFormType('Routine');
        }
    }, [routine]);

    useEffect(() => {
        async function fetchData() {
            try {
                const templateData = await getRoutineFormTemplate();
                setFormTemplate(templateData.ROUTINE_FORM_TEMPLATE);
                if (templateData.ROUTINE_FORM_TEMPLATE?.ICONS?.length > 0) {
                    setIcon(templateData.ROUTINE_FORM_TEMPLATE.ICONS[0]);
                }
            } catch (error) {
                console.error('Error fetching initial form data:', error);
            }
        }
        fetchData();
    }, []);

    const iconOptions = formTemplate?.ICONS.map(iconClass => ({
        value: iconClass,
        label: iconClass.substring(6),
    })) || [];

    const deviceOptions = allDevices
        .filter(device => device.type !== 'SENSOR')
        .map(device => ({
            value: device.id,
            label: device.name
        }));

    const formTypeOptions = [
        { value: 'Routine', label: 'Routine' },
        { value: 'QuickAction', label: 'Quick Action' },
        { value: 'Preference', label: 'Preference' }
    ];

    const triggerTypeOptions = formTemplate?.TRIGGER_TYPES.map(type => ({ value: type, label: type })) || [];

    const getTriggerValueOptions = (type) => {
        if (type === 'TIME_OF_DAY_CHANGE') return formTemplate.TIMES_OF_DAY;
        if (type === 'USER_PRESENCE_CHANGE') return ['true', 'false'];
        return [];
    };

    const getTriggerValueOptionsForSelect = (type) => {
        const options = getTriggerValueOptions(type);
        return options.map(val => ({ value: val, label: String(val) }));
    };

    const logicalOperatorOptions = formTemplate?.LOGICAL_OPERATORS.map(op => ({ value: op, label: op })) || [];

    const conditionTypeOptions = formTemplate ? Object.keys(formTemplate.CONDITION_TYPES).map(type => ({ value: type, label: type })) : [];

    const userPresenceOptions = [
        { value: 'true', label: 'Present' },
        { value: 'false', label: 'Not Present' }
    ];

    const getConditionOperatorOptions = (type) => {
        if (type === 'OUTSIDE_TEMPERATURE') {
            return formTemplate.CONDITION_TYPES.OUTSIDE_TEMPERATURE.operators.map(op => ({ value: op, label: op }));
        }
        return [];
    };

    const getActionTypeOptions = (deviceType) => {
        if (!deviceType || !formTemplate.availableActions[deviceType]) return [];
        return formTemplate.availableActions[deviceType].map(act => ({ value: act.actionType, label: act.label }));
    };

    const getPayloadStateOptions = (actionDetails) => {
        if (!actionDetails || !Array.isArray(actionDetails.payloads)) return [];
        return actionDetails.payloads.map(p => ({ value: p, label: p }));
    };

    const getPayloadSelectOptions = (payload) => {
        if (!payload || !payload.options) return [];
        return payload.options.map(opt => ({ value: opt, label: opt }));
    };

    const formatOptionLabel = ({ value, label }) => (
        <div>
            <i className={`bi ${value}`} style={{ marginRight: '8px' }}></i>
            {label}
        </div>
    );

    const handleAddTrigger = () => {
        setTriggers([...triggers, { id: Date.now(), type: '', value: '' }]);
    };

    const handleRemoveTrigger = (id) => {
        setTriggers(triggers.filter(t => t.id !== id));
    };

    const handleTriggerChange = (id, field, value) => {
        setTriggers(triggers.map(t => t.id === id ? { ...t, [field]: value, ...(field === 'type' && { value: '' }) } : t));
    };

    const handleAddCondition = () => {
        setConditions([...conditions, { id: Date.now(), type: '', operator: '', value: '' }]);
    };

    const handleRemoveCondition = (id) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const handleConditionChange = (id, field, value) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleAddAction = () => {
        setActions([...actions, { id: Date.now(), deviceId: '', actionType: '', payload: {} }]);
    };

    const handleRemoveAction = (id) => {
        setActions(actions.filter(a => a.id !== id));
    };

    const handleActionChange = (id, field, value) => {
        const newActions = actions.map(a => {
            if (a.id === id) {
                const updatedAction = { ...a, [field]: value };
                if (field === 'deviceId') {
                    updatedAction.actionType = '';
                    updatedAction.payload = {};
                }
                if (field === 'actionType') {
                    updatedAction.payload = {};
                }
                return updatedAction;
            }
            return a;
        });
        setActions(newActions);
    };

    const handleClear = () => {
        setName('');
        setDescription('');
        setIcon(iconOptions[0]?.value || '');
        setTriggers([{ id: 1, type: '', value: '' }]);
        setConditions([]);
        setConditionsOperator('AND');
        setActions([{ id: 1, deviceId: '', actionType: '', payload: {} }]);
        setFeedback('');
    };

    const handleDelete = async () => {
        if (!routine) return;
        try {
            const deletedRoutine = await removeRoutine(routine.id);
            onDeletedRoutine(deletedRoutine);
            onClose();
        } catch (error) {
            console.error('Failed to delete routine:', error);
            setFeedback('Error deleting routine.');
        }
    };

    const handlePayloadChange = (id, payloadName, payloadValue) => {
        setActions(actions.map(a => a.id === id ? { ...a, payload: { ...a.payload, [payloadName]: payloadValue } } : a));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const routineData = {
            name,
            description,
            icon,
            triggers: {
                logicalOperator: 'OR',
                list: triggers.map(({ type, value }) => ({ type, value: value === 'true' ? true : value === 'false' ? false : value }))
            },
            conditions: {
                logicalOperator: conditionsOperator,
                list: conditions.map(({ type, operator, value }) => ({ type, operator, value: type === 'USER_PRESENCE' ? (value === 'true') : Number(value) }))
            },
            actions: actions.map(({ deviceId, actionType, payload }) => ({
                type: 'DEVICE_ACTION',
                deviceId,
                actionType,
                payload
            }))
        };

        const quickActionData = {
            name,
            description,
            icon,
            actions: actions.map(({ deviceId, actionType, payload }) => ({
                type: 'DEVICE_ACTION',
                deviceId,
                actionType,
                payload
            }))
        };
        if (formType === 'QuickAction') {
            try {
                const newQuickAction = await addQuickAction(quickActionData);
                onAddQuickAction(newQuickAction);
                setFeedback('Quick Action created successfully!');
            } catch (error) {
                console.error('Failed to create quick action:', error);
                setFeedback('Error creating quick action.');
            }
            return;
        } else if (formType === 'Routine') {
            if (routine) {
                try {
                    const updatedRoutine = await editRoutine(routine.id, routineData);
                    onEditedRoutine(updatedRoutine);
                    setFeedback('Routine updated successfully!');
                } catch (error) {
                    console.error('Failed to update routine:', error);
                    setFeedback('Error updating routine.');
                }
            }
            else {
                try {
                    const newRoutine = await addRoutine(routineData);
                    onAddRoutine(newRoutine);
                    setFeedback('Routine created successfully!');
                } catch (error) {
                    console.error('Failed to create routine:', error);
                    setFeedback('Error creating routine.');
                }
            }
        }
    };

    if (!formTemplate) {
        return <div>Loading form...</div>;
    }

    const renderPayloadInputs = (action) => {
        const device = allDevices.find(d => d.id === action.deviceId);
        if (!device || !action.actionType) return null;

        const actionDetails = formTemplate.availableActions[device.type]?.find(a => a.actionType === action.actionType);
        if (!actionDetails || !actionDetails.payloads) return null;

        if (Array.isArray(actionDetails.payloads) && typeof actionDetails.payloads[0] === 'string') {
            const stateOptions = getPayloadStateOptions(actionDetails);
            const currentValue = typeof action.payload.isOn === 'boolean'
                ? stateOptions.find(option => option.value === (action.payload.isOn ? 'ON' : 'OFF'))
                : null;
            return (
                <Select
                    className="form-select-mutant mt-2"
                    classNamePrefix="select"
                    value={currentValue}
                    onChange={selectedOption => handlePayloadChange(action.id, 'isOn', selectedOption.value === 'ON')}
                    options={stateOptions}
                    placeholder="Select state"
                    isSearchable={false}
                    required
                />
            );
        }

        return actionDetails.payloads.map(p => (
            <div key={p.name} className="mt-2">
                {p.type === 'number' && (
                    <input
                        type="number"
                        className="form-control"
                        min={p.min}
                        max={p.max}
                        value={action.payload[p.name] || ''}
                        placeholder={`Select ${p.label}`}
                        onChange={e => handlePayloadChange(action.id, p.name, Number(e.target.value))}
                        required
                    />
                )}
                {p.type === 'select' && (
                    <Select
                        className="form-select-mutant"
                        classNamePrefix="select"
                        value={getPayloadSelectOptions(p).find(option => option.value === action.payload[p.name])}
                        onChange={selectedOption => handlePayloadChange(action.id, p.name, selectedOption.value)}
                        options={getPayloadSelectOptions(p)}
                        placeholder={`Select ${p.label}`}
                        isSearchable={false}
                        required
                    />
                )}
            </div>
        ));
    };

    const routineDetailsSection = (
        <div className="routine-background">
            <h5>Details</h5>
            <div className="mb-1">
                <label htmlFor="routineName" className="form-label">Name</label>
                <input type="text" className="form-control" id="routineName" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="mb-1">
                <label htmlFor="routineDesc" className="form-label">Description</label>
                <textarea className="form-control" id="routineDesc" rows="2" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
            </div>
            <div className="mb-1">
                <label htmlFor="routineIcon" className="form-label">Icon</label>
                <Select
                    id="routineIcon"
                    value={iconOptions.find(option => option.value === icon)}
                    onChange={selectedOption => setIcon(selectedOption.value)}
                    options={iconOptions}
                    formatOptionLabel={formatOptionLabel}
                    isSearchable={false}
                    required
                />
            </div>
        </div>
    );

    const routineTriggerSection = (
        <div className="form-section routine-background">
            <h5>Triggers</h5>
            {triggers.map((trigger) => (
                <div key={trigger.id} className="d-flex align-items-center mb-2 gap-2">
                    <Select
                        className="form-select-mutant"
                        classNamePrefix="select"
                        value={triggerTypeOptions.find(option => option.value === trigger.type)}
                        onChange={selectedOption => handleTriggerChange(trigger.id, 'type', selectedOption.value)}
                        options={triggerTypeOptions}
                        placeholder="Select Trigger Type"
                        isSearchable={false}
                        required
                    />
                    {trigger.type && (
                        <Select
                            className="form-select-mutant"
                            classNamePrefix="select"
                            value={getTriggerValueOptionsForSelect(trigger.type).find(option => option.value === trigger.value)}
                            onChange={selectedOption => handleTriggerChange(trigger.id, 'value', selectedOption.value)}
                            options={getTriggerValueOptionsForSelect(trigger.type)}
                            placeholder="Select Value"
                            isSearchable={false}
                            required
                        />
                    )}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveTrigger(trigger.id)} disabled={triggers.length === 1}><i className="bi bi-dash-lg" /></button>
                </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm add-button" onClick={handleAddTrigger}>Add Trigger</button>
        </div>
    )

    const routineConditionSection = (
        <div className="form-section routine-background">
            <h5>Conditions</h5>
            <div className="mb-2">
                <label className="form-label">Logical Operator</label>
                <Select
                    className="form-select-mutant"
                    classNamePrefix="select"
                    value={logicalOperatorOptions.find(option => option.value === conditionsOperator)}
                    onChange={selectedOption => setConditionsOperator(selectedOption.value)}
                    options={logicalOperatorOptions}
                    isSearchable={false}
                    required
                />
            </div>
            {conditions.map((condition) => (
                <div key={condition.id} className="d-flex align-items-center mb-2 gap-2">
                    <Select
                        className="form-select-mutant"
                        classNamePrefix="select"
                        value={conditionTypeOptions.find(option => option.value === condition.type)}
                        onChange={selectedOption => handleConditionChange(condition.id, 'type', selectedOption.value)}
                        options={conditionTypeOptions}
                        placeholder="Select Condition Type"
                        isSearchable={false}
                        required
                    />
                    {condition.type === 'USER_PRESENCE' && (
                        <Select
                            className="form-select-mutant"
                            classNamePrefix="select"
                            value={userPresenceOptions.find(option => option.value === condition.value)}
                            onChange={selectedOption => handleConditionChange(condition.id, 'value', selectedOption.value)}
                            options={userPresenceOptions}
                            placeholder="Select Presence"
                            isSearchable={false}
                            required
                        />
                    )}
                    {condition.type === 'OUTSIDE_TEMPERATURE' && (
                        <>
                            <Select
                                className="form-select-mutant"
                                classNamePrefix="select"
                                value={getConditionOperatorOptions(condition.type).find(option => option.value === condition.operator)}
                                onChange={selectedOption => handleConditionChange(condition.id, 'operator', selectedOption.value)}
                                options={getConditionOperatorOptions(condition.type)}
                                placeholder="Op"
                                isSearchable={false}
                                required
                            />
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Value"
                                min={formTemplate.CONDITION_TYPES.OUTSIDE_TEMPERATURE.valueRange[0]}
                                max={formTemplate.CONDITION_TYPES.OUTSIDE_TEMPERATURE.valueRange[1]}
                                value={condition.value}
                                onChange={e => handleConditionChange(condition.id, 'value', e.target.value)}
                                required
                            />
                        </>
                    )}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveCondition(condition.id)}><i className="bi bi-dash-lg" /></button>
                </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm add-button" onClick={handleAddCondition}>Add Condition</button>
        </div>
    )

    const routineActionSection = (
        <div className="form-section routine-background">
            <h5>Actions</h5>
            {actions.map((action) => {
                const selectedDevice = allDevices.find(d => d.id === action.deviceId);
                return (
                    <div key={action.id} className="action-item">
                        <div className="d-flex align-items-center gap-2">
                            <Select
                                className="form-select-mutant"
                                classNamePrefix="select"
                                value={deviceOptions.find(option => option.value === action.deviceId)}
                                onChange={selectedOption => handleActionChange(action.id, 'deviceId', selectedOption.value)}
                                options={deviceOptions}
                                placeholder="Select Device"
                                menuPlacement='top'
                                isSearchable={true}
                                required
                            />
                            {action.deviceId && (
                                <Select
                                    className="form-select-mutant"
                                    classNamePrefix="select"
                                    value={getActionTypeOptions(selectedDevice?.type).find(option => option.value === action.actionType)}
                                    onChange={selectedOption => handleActionChange(action.id, 'actionType', selectedOption.value)}
                                    options={getActionTypeOptions(selectedDevice?.type)}
                                    placeholder="Select Action"
                                    isSearchable={false}
                                    required
                                />
                            )}
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveAction(action.id)} disabled={actions.length === 1}><i className="bi bi-dash-lg" /></button>
                        </div>
                        {renderPayloadInputs(action)}
                    </div>
                );
            })}
            <button type="button" className="btn btn-secondary btn-sm add-button" onClick={handleAddAction}>Add Action</button>
        </div>
    )

    return (
        <div className="routine-form-container">
            <form onSubmit={handleSubmit}>
                {!routine && <div className="mb-2">
                    <label htmlFor="formType" className="form-label">Type</label>
                    <Select
                        id="formType"
                        className="form-select-mutant"
                        classNamePrefix="select"
                        value={formTypeOptions.find(option => option.value === formType)}
                        onChange={selectedOption => setFormType(selectedOption.value)}
                        options={formTypeOptions}
                        placeholder="Choose type..."
                        isSearchable={false}
                        required
                    />
                </div>}

                {formType === 'Routine' && (
                    <>
                        {routineDetailsSection}
                        {routineTriggerSection}
                        {routineConditionSection}
                        {routineActionSection}
                        {feedback &&
                            <div className="alert alert-info">{feedback}</div>}
                        {routine
                            ?
                            <div className="form-section-buttons">
                                <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                                <button type="submit" className="btn btn-primary">Save routine</button>
                            </div>
                            :
                            <div className="form-section-buttons">
                                <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handleClear}>Clear</button>
                                <button type="submit" className="btn btn-primary">Create Routine</button>
                            </div>
                        }
                    </>
                )}

                {formType === 'QuickAction' && (
                    <>
                        {routineDetailsSection}
                        {routineActionSection}
                        {feedback &&
                            <div className="alert alert-info">{feedback}</div>}
                        <div className="form-section-buttons">
                            <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleClear}>Clear</button>
                            <button type="submit" className="btn btn-primary">Create QuickAction</button>
                        </div>
                    </>
                )}

                {formType === 'Preference' && (
                    <>
                        {routineDetailsSection}
                        {routineTriggerSection}
                        {routineConditionSection}
                        {routineActionSection}
                        {feedback &&
                            <div className="alert alert-info">{feedback}</div>}
                        <div className="form-section-buttons">
                            <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleClear}>Clear</button>
                            <button type="submit" className="btn btn-primary">Create Routine</button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default RoutineFormMenu;
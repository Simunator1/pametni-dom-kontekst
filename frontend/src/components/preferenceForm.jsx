import '../styles/routineFormMenu.css';
import { getRoutineFormTemplate, addPreference, editPreference, removePreference } from '../services/apiService';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const PreferenceForm = ({ room, onClose, pref }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [conditions, setConditions] = useState([]);
    const [conditionsOperator, setConditionsOperator] = useState('AND');
    const [actions, setActions] = useState([{ id: 1, deviceType: '', state: {} }]);
    const [feedback, setFeedback] = useState('');

    const [formTemplate, setFormTemplate] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const templateData = await getRoutineFormTemplate();
                setFormTemplate(templateData.ROUTINE_FORM_TEMPLATE);
                if (templateData.ROUTINE_FORM_TEMPLATE?.ICONS?.length > 0) {
                    setIcon(templateData.ROUTINE_FORM_TEMPLATE.ICONS[0]);
                }
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (pref) {
            setName(pref.name || '');
            setDescription(pref.description || '');
            setIcon(pref.icon || '');
            if (pref.conditions && pref.conditions.list) {
                const loadedConditions = pref.conditions.list.map((cond, index) => ({
                    id: Date.now() + index,
                    type: cond.type || '',
                    operator: cond.operator || '',
                    value: cond.value !== undefined ? String(cond.value) : ''
                }));
                setConditions(loadedConditions);
                setConditionsOperator(pref.conditions.logicalOperator || 'AND');
            } else {
                setConditions([]);
                setConditionsOperator('AND');
            }
            if (pref.actions && pref.actions.length > 0) {
                const loadedActions = pref.actions.map((act, index) => ({
                    id: Date.now() + index,
                    deviceType: act.deviceType || '',
                    state: act.state || {}
                }));
                setActions(loadedActions);
            } else {
                setActions([{ id: 1, deviceType: '', state: {} }]);
            }
        }
    }, [pref]);

    const iconOptions = formTemplate?.ICONS.map(iconClass => ({
        value: iconClass,
        label: iconClass.substring(6)
    })) || [];

    const formatOptionLabel = ({ value, label }) => (
        <div>
            <i className={`bi ${value}`} style={{ marginRight: '8px' }}></i>
            {label}
        </div>
    );

    const conditionTypeOptions = formTemplate ? Object.keys(formTemplate.CONDITION_TYPES).map(type => ({ value: type, label: type })) : [];
    const logicalOperatorOptions = formTemplate?.LOGICAL_OPERATORS.map(op => ({ value: op, label: op })) || [];
    const timeOfDayOptions = formTemplate?.TIMES_OF_DAY.map(tod => ({ value: tod, label: tod })) || [];
    const userPresenceOptions = [{ value: 'true', label: 'Present' }, { value: 'false', label: 'Not Present' }];
    const conditionOperatorOptions = formTemplate?.CONDITION_TYPES.OUTSIDE_TEMPERATURE.operators.map(op => ({ value: op, label: op })) || [];

    const preferenceDeviceTypeOptions = room.devices
        .filter(d => ['LIGHT', 'THERMOSTAT', 'AIR_CONDITIONER'].includes(d.type))
        .map(d => d.type)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map(type => ({ value: type, label: type }));

    const handleAddCondition = () => setConditions([...conditions, { id: Date.now(), type: '', operator: '', value: '' }]);
    const handleRemoveCondition = id => setConditions(conditions.filter(c => c.id !== id));
    const handleConditionChange = (id, field, value) => setConditions(conditions.map(c => (c.id === id ? { ...c, [field]: value } : c)));

    const handleAddAction = () => setActions([...actions, { id: Date.now(), deviceType: '', state: {} }]);
    const handleRemoveAction = id => setActions(actions.filter(a => a.id !== id));
    const handleActionChange = (id, field, value) => setActions(actions.map(a => (a.id === id ? { ...a, [field]: value, state: {} } : a)));
    const handleStateChange = (id, stateName, stateValue) => setActions(actions.map(a => (a.id === id ? { ...a, state: { ...a.state, [stateName]: stateValue } } : a)));

    const handleDelete = async () => {
        if (!pref) return;
        try {
            await removePreference(pref.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete preference:', error);
            setFeedback('Error deleting preference.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const preferenceData = {
            name,
            description,
            icon,
            roomId: room.id,
            conditions: {
                logicalOperator: conditionsOperator,
                list: conditions.map(c => {
                    const condition = { type: c.type };
                    if (c.type === 'USER_PRESENCE') condition.value = (c.value === 'true');
                    else if (c.type === 'TIME_OF_DAY') condition.value = c.value;
                    else if (c.type === 'OUTSIDE_TEMPERATURE') {
                        condition.operator = c.operator;
                        condition.value = Number(c.value);
                    }
                    return condition;
                })
            },
            actions: actions.map(({ deviceType, state }) => ({ deviceType, state }))
        };

        if (pref) {
            try {
                const updatedPreference = await editPreference(pref.id, preferenceData);
                onClose();
            } catch (error) {
                console.error('Failed to update preference:', error);
                setFeedback('Error updating preference.');
            }

        } else {
            try {
                const newPreference = await addPreference(preferenceData);
                onClose();
            } catch (error) {
                console.error('Failed to create preference:', error);
                setFeedback('Error creating preference.');
            }
        }
    };

    if (!formTemplate) return <div>Loading...</div>;

    return (
        <div className="routine-form-container">
            <form onSubmit={handleSubmit}>
                <div className="routine-background">
                    <h5>Details</h5>
                    <div className="mb-2">
                        <label htmlFor="prefName" className="form-label">Name</label>
                        <input type="text" className="form-control" id="prefName" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="prefDesc" className="form-label">Description</label>
                        <textarea className="form-control" id="prefDesc" rows="2" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="prefIcon" className="form-label">Icon</label>
                        <Select
                            id="prefIcon" value={iconOptions.find(o => o.value === icon)}
                            onChange={sel => setIcon(sel.value)} options={iconOptions}
                            formatOptionLabel={formatOptionLabel} isSearchable={false} required
                        />
                    </div>
                </div>

                <div className="form-section routine-background">
                    <h5>Conditions</h5>
                    <div className="mb-2">
                        <label className="form-label">Logical Operator</label>
                        <Select
                            className="form-select-mutant" value={logicalOperatorOptions.find(o => o.value === conditionsOperator)}
                            onChange={sel => setConditionsOperator(sel.value)} options={logicalOperatorOptions} isSearchable={false} required
                        />
                    </div>
                    {conditions.map(c => (
                        <div key={c.id} className="d-flex align-items-center mb-2 gap-2">
                            <Select
                                className="form-select-mutant" value={conditionTypeOptions.find(opt => opt.value === c.type)}
                                onChange={sel => handleConditionChange(c.id, 'type', sel.value)} options={conditionTypeOptions}
                                placeholder="Select Condition" required
                            />
                            {c.type === 'TIME_OF_DAY' && <Select value={timeOfDayOptions.find(opt => opt.value === c.value)} options={timeOfDayOptions} onChange={sel => handleConditionChange(c.id, 'value', sel.value)} className="form-select-mutant" placeholder="Select Time..." required />}
                            {c.type === 'USER_PRESENCE' && <Select value={userPresenceOptions.find(opt => opt.value === c.value)} options={userPresenceOptions} onChange={sel => handleConditionChange(c.id, 'value', sel.value)} className="form-select-mutant" placeholder="Select Presence..." required />}
                            {c.type === 'OUTSIDE_TEMPERATURE' && (
                                <>
                                    <Select value={conditionOperatorOptions.find(opt => opt.value === c.operator)} options={conditionOperatorOptions} onChange={sel => handleConditionChange(c.id, 'operator', sel.value)} className="form-select-mutant" placeholder="Op" required />
                                    <input type="number" className="form-control" value={c.value} onChange={e => handleConditionChange(c.id, 'value', e.target.value)} placeholder="Temp °C" required />
                                </>
                            )}
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveCondition(c.id)}><i className="bi bi-dash-lg" /></button>
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm add-button" onClick={handleAddCondition}>Add Condition</button>
                </div>

                <div className="form-section routine-background">
                    <h5>Preferred State</h5>
                    {actions.map((action) => (
                        <div key={action.id} className="action-item">
                            <div className="d-flex align-items-center gap-2">
                                <Select
                                    className="form-select-mutant"
                                    placeholder="Select Device Type..."
                                    options={preferenceDeviceTypeOptions}
                                    value={preferenceDeviceTypeOptions.find(opt => opt.value === action.deviceType)}
                                    onChange={selected => handleActionChange(action.id, 'deviceType', selected.value)}
                                    required
                                />
                                {action.deviceType === 'LIGHT' &&
                                    <input
                                        type="number" min="0" max="100" className="form-control"
                                        placeholder="Brightness %" required
                                        value={action.state.brightness || ''}
                                        onChange={e => handleStateChange(action.id, 'brightness', Number(e.target.value))}
                                    />
                                }
                                {(action.deviceType === 'THERMOSTAT' || action.deviceType === 'AIR_CONDITIONER') &&
                                    <>
                                        <input
                                            type="number" min="10" max="30" className="form-control"
                                            placeholder="Target Temp °C" required
                                            value={action.state.targetTemp || ''}
                                            onChange={e => handleStateChange(action.id, 'targetTemp', Number(e.target.value))}
                                        />
                                        <Select
                                            className="form-select-mutant" placeholder="Mode..." required
                                            options={[{ value: 'HEAT', label: 'HEAT' }, { value: 'COOL', label: 'COOL' }]}
                                            value={[{ value: 'HEAT', label: 'HEAT' }, { value: 'COOL', label: 'COOL' }].find(opt => opt.value === action.state.mode)}
                                            onChange={sel => handleStateChange(action.id, 'mode', sel.value)}
                                        />
                                    </>
                                }
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveAction(action.id)} disabled={actions.length === 1}>
                                    <i className="bi bi-dash-lg" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm add-button" onClick={handleAddAction}>
                        Add Preferred State
                    </button>
                </div>

                {feedback && <div className="alert alert-info mt-2">{feedback}</div>}
                <div className="form-section-buttons">
                    <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                    {pref ?
                        <>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </>
                        :
                        <button type="submit" className="btn btn-primary">Create Preference</button>}
                </div>
            </form>
        </div>
    );
};

export default PreferenceForm;
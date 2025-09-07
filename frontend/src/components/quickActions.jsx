import { useState } from 'react';
import '../styles/quickActions.css';
import { executeQuickAction, removeQuickAction } from '../services/apiService';

function quickActions({ quickActions, onAutomatizationUpdate, onQuickActionRemove, showNotification }) {
    const [removal, setRemoval] = useState(false);

    const quickActionRemoval = (quickActionId) => async (e) => {
        e.stopPropagation();
        try {
            const removedQuickAction = await removeQuickAction(quickActionId);
            onQuickActionRemove(removedQuickAction);
            console.log(`Quick action ${quickActionId} removed successfully.`);
        } catch (error) {
            console.error(`Error removing quick action ${quickActionId}:`, error);
        }
    }

    const handleExecuteQuickAction = (quickAction) => async () => {
        if (removal) return;
        try {
            const response = await executeQuickAction(quickAction.id);
            const updatedDevices = response.updatedDevices;
            onAutomatizationUpdate(updatedDevices);
            showNotification(`Quick action ${quickAction.name} activated.`);
        }
        catch (error) {
            console.error(`Error executing quick action ${quickAction.id}:`, error);
        }
    }

    return (
        <div className="quick-actions">
            <div className="quick-header">
                <div></div>
                <p>Quick actions</p>
                <i className="quick-ikona bi bi-gear" onClick={() => setRemoval(!removal)}></i>
            </div>
            <div className="actions">
                {quickActions.map(quickAction => (
                    <div className="action" key={quickAction.id} onClick={handleExecuteQuickAction(quickAction)}>
                        {removal && <i className="removeIcon bi bi-dash" onClick={quickActionRemoval(quickAction.id)} />}
                        <i className={`quick-ikona ${quickAction.icon}`}></i>
                        <p>{quickAction.name}</p>
                    </div>
                ))}
            </div>
        </div>)
};

export default quickActions;
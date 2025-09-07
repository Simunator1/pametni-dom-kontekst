import '../styles/routineMini.css';
import { toggleRoutine } from '../services/apiService';

const RoutineMini = ({ routine, onRoutineToggle, onSelectRoutine }) => {
    const handleToggle = async () => {
        try {
            const updatedRoutine = await toggleRoutine(routine.id, !routine.is_enabled);
            onRoutineToggle(updatedRoutine);
        } catch (error) {
            console.error(`Failed to toggle routine ${routine.id}:`, error);
        }
    };

    return (
        <div className={`routine-container${!routine.is_enabled ? ' gray' : ''}`} onClick={() => onSelectRoutine(routine)}>
            <div className="routine">
                <i className={`routine-ikona ${!routine.is_enabled ? ' gray ' : ''}${routine.icon}`}></i>
                <div className={'routine-name-wrapper'}>
                    <p
                        className="routine-name"
                        title={routine.name}
                    >
                        {routine.name}
                    </p>
                </div>
                <div className="form-check form-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`switch-${routine.id}`}
                        checked={routine.is_enabled}
                        onChange={handleToggle}
                    />
                </div>
            </div>
            <div>
                <p className={`description${!routine.is_enabled ? ' gray' : ''}`}>{routine.description}</p>
            </div>
        </div>
    );
};

export default RoutineMini;
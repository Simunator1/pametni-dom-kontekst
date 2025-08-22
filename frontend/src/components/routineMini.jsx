import '../styles/routineMini.css';
import { toggleRoutine } from '../services/apiService';

const RoutineMini = ({ routine, onRoutineToggle }) => {
    const handleToggle = async () => {
        try {
            const updatedRoutine = await toggleRoutine(routine.id, !routine.isEnabled);
            onRoutineToggle(updatedRoutine);
        } catch (error) {
            console.error(`Failed to toggle routine ${routine.id}:`, error);
        }
    };

    return (
        <div className={`routine-container${!routine.isEnabled ? ' gray' : ''}`}>
            <div className="routine">
                <i className={`routine-ikona ${!routine.isEnabled ? ' gray ' : ''}${routine.icon}`}></i>
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
                        checked={routine.isEnabled}
                        onChange={handleToggle}
                    />
                </div>
            </div>
            <div>
                <p className="description">{routine.description}</p>
            </div>
        </div>
    );
};

export default RoutineMini;
import React, { useState, useEffect } from 'react';
import { getTimesOfDay } from '../../services/apiService';
import '../../styles/Header.css';
import '../../styles/developerMenu.css';

function DeveloperMenu({
    TimeOfDay,
    UserPresence,
    OutsideTemp,
    currentInterval,
    onTimeChange,
    onPresenceChange,
    onTempChange,
    onIntervalChange
}) {

    const [timeOfDay, setTimeOfDay] = useState(TimeOfDay);
    const [userPresent, setUserPresent] = useState(UserPresence);
    const [tempInput, setTempInput] = useState(OutsideTemp);
    const [intervalInput, setIntervalInput] = useState(currentInterval / 1000);
    const [timesOfDay, setTimesOfDay] = useState([]);

    useEffect(() => {
        const fetchTimesOfDay = async () => {
            try {
                const fetchedTimes = await getTimesOfDay();
                setTimesOfDay(fetchedTimes);
            } catch (error) {
                console.error("Greška pri dohvaćanju doba dana:", error);
            }
        };
        fetchTimesOfDay();
    }, []);

    const handleSetInterval = () => {
        const seconds = parseFloat(intervalInput);
        if (!isNaN(seconds) && seconds >= 0.5) {
            if (onIntervalChange) onIntervalChange(seconds * 1000);
        } else {
            alert('Interval mora biti broj veći ili jednak 0.5.');
        }
    };

    const handleSetTemp = () => {
        const temp = parseInt(tempInput, 10);
        if (!isNaN(temp)) {
            if (onTempChange) onTempChange(temp);
        } else {
            alert('Unesite ispravnu temperaturu.');
        }
    };


    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTimeOfDay(newTime);
        if (onTimeChange) onTimeChange(newTime);
    };

    const handlePresenceToggle = (e) => {
        const isPresent = e.target.checked;
        setUserPresent(isPresent);
        if (onPresenceChange) onPresenceChange(isPresent);
    };

    return (
        <div className="dropdown developer-menu">
            <div className="menu">
                <div className="menu-item">
                    <span className="icon-left bi bi-clock" />
                    <label htmlFor="time-select">Time of day</label>
                    <select id="time-select" className="form-select" value={timeOfDay} onChange={handleTimeChange}>
                        <option value="">Select time...</option>
                        {timesOfDay.map((time, index) => (
                            <option key={index} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                <div className="menu-item">
                    <span className="icon-left bi bi-person-check" />
                    <label htmlFor="presence-switch">User presence</label>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="presence-switch"
                            checked={userPresent}
                            onChange={handlePresenceToggle}
                        />
                    </div>
                </div>

                <div className="menu-item">
                    <span className="icon-left bi bi-thermometer-half" />
                    <label htmlFor="temp-input">Outside Temp</label>
                    <div className="input-group">
                        <input
                            type="number"
                            id="temp-input"
                            className="form-control"
                            value={tempInput}
                            onChange={(e) => setTempInput(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleSetTemp}>Set</button>
                    </div>
                </div>

                <div className="menu-item">
                    <span className="icon-left bi bi-hourglass" />
                    <label htmlFor="interval-input">Sim interval(s)</label>
                    <div className="input-group">
                        <input
                            type="number"
                            id="interval-input"
                            className="form-control"
                            value={intervalInput}
                            onChange={(e) => setIntervalInput(e.target.value)}
                            step="0.5"
                            min="0.5"
                        />
                        <button className="btn btn-primary" onClick={handleSetInterval}>Set</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeveloperMenu;
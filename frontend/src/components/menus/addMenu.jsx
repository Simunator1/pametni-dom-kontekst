import React, { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { addRoom, fetchRoomsWithDevices, fetchDeviceTypes, addDevice } from '../../services/apiService';

function AddRoomForm({ onRoomAdded }) {
    const [roomName, setRoomName] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) {
            setFeedback('Ime sobe ne može biti prazno.');
            return;
        }
        try {
            const newRoom = await addRoom(roomName);
            setFeedback(`Soba "${newRoom.name}" je uspješno dodana!`);
            setRoomName('');
            if (onRoomAdded) onRoomAdded(newRoom);
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-form">
            <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Unesite ime sobe"
                className="form-control"
            />
            <button type="submit" className="btn btn-primary mt-2">Add Room</button>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </form>
    );
}

function AddDeviceForm({ onDeviceAdded }) {
    const [deviceName, setDeviceName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const [rooms, setRooms] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);

    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [fetchedRooms, fetchedTypes] = await Promise.all([
                    fetchRoomsWithDevices(),
                    fetchDeviceTypes()
                ]);
                setRooms(fetchedRooms);
                setDeviceTypes(fetchedTypes);
                if (fetchedRooms.length > 0) setSelectedRoom(fetchedRooms[0].id);
                if (fetchedTypes.length > 0) setSelectedType(fetchedTypes[0]);
            } catch (error) {
                setFeedback('Greška pri učitavanju soba i tipova.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deviceName.trim() || !selectedRoom || !selectedType) {
            setFeedback('Sva polja su obavezna.');
            return;
        }
        try {
            const newDevice = await addDevice({ name: deviceName, room_id: selectedRoom, type: selectedType });
            setFeedback(`Uređaj "${newDevice.name}" je dodan!`);
            setDeviceName('');
            if (onDeviceAdded) onDeviceAdded(newDevice);
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške.');
        }
    };

    if (loading) return <p className="feedback-message">Loading...</p>;

    return (
        <form onSubmit={handleSubmit} className="add-form">
            <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Unesite ime uređaja"
                className="form-control mb-2"
            />
            <select className="form-select mb-2" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                {rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
            <select className="form-select mb-2" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <button type="submit" className="btn btn-primary mt-2">Add Device</button>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </form>
    );
}

function AddMenu({ onRoomAdded, onDeviceAdded, onGoToRoutineAdd, closeMenu }) {
    const [activeMenu, setActiveMenu] = useState('main');
    const nodeRefMain = useRef(null);
    const nodeRefAddRoom = useRef(null);
    const nodeRefAddDevice = useRef(null);

    function DropdownItem(props) {
        return (
            <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
                <span className={`icon-left ${props.leftIcon || ''}`}></span>
                {props.children}
            </a>
        );
    }

    return (
        <div className="dropdown add-menu">
            <CSSTransition nodeRef={nodeRefMain} in={activeMenu === 'main'} unmountOnExit timeout={500} classNames="menu-primary">
                <div ref={nodeRefMain} className="menu">
                    <div onClick={() => { onGoToRoutineAdd(); closeMenu(); }}>
                        <DropdownItem leftIcon="bi bi-gear-wide-connected">Add automatization</DropdownItem>
                    </div>
                    <DropdownItem goToMenu="addroom" leftIcon="bi bi-house-add">Add Room</DropdownItem>
                    <DropdownItem goToMenu="adddevice" leftIcon="bi bi-plus-circle">Add Device</DropdownItem>
                </div>
            </CSSTransition>

            <CSSTransition nodeRef={nodeRefAddRoom} in={activeMenu === 'addroom'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefAddRoom} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <AddRoomForm onRoomAdded={onRoomAdded} />
                </div>
            </CSSTransition>

            <CSSTransition nodeRef={nodeRefAddDevice} in={activeMenu === 'adddevice'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefAddDevice} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <AddDeviceForm onDeviceAdded={onDeviceAdded} />
                </div>
            </CSSTransition>
        </div>
    );
}

export default AddMenu;
import React, { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { editDevice, removeDevice, fetchRoomsWithDevices } from '../../services/apiService';

function EditDeviceForm({ device, onDeviceEdited }) {
    const [deviceName, setDeviceName] = useState(device.name);
    const [selectedRoom, setSelectedRoom] = useState(device.roomId);
    const [rooms, setRooms] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRooms() {
            try {
                setLoading(true);
                const fetchedRooms = await fetchRoomsWithDevices();
                setRooms(fetchedRooms);
            } catch (error) {
                setFeedback('Greška pri učitavanju soba.');
            } finally {
                setLoading(false);
            }
        }
        loadRooms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deviceName.trim() || !selectedRoom) {
            setFeedback('Sva polja su obavezna.');
            return;
        }
        try {
            const updatedDevice = await editDevice(device.id, deviceName, selectedRoom);
            setFeedback(`Uređaj "${updatedDevice.name}" je uspješno ažuriran!`);
            if (onDeviceEdited) onDeviceEdited(updatedDevice);
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške pri ažuriranju.');
        }
    };

    if (loading) return <p className="feedback-message">Učitavanje soba...</p>;

    return (
        <form onSubmit={handleSubmit} className="add-form">
            <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Unesite novo ime uređaja"
                className="form-control mb-2"
            />
            <select className="form-select mb-2" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                {rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
            <button type="submit" className="btn btn-primary mt-2">Spremi Promjene</button>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </form>
    );
}

function RemoveDeviceConfirmation({ device, onDeviceRemoved, onCancel }) {
    const [feedback, setFeedback] = useState('');

    const handleConfirm = async () => {
        try {
            await removeDevice(device.id);
            setFeedback(`Uređaj "${device.name}" je obrisan.`);
            if (onDeviceRemoved) onDeviceRemoved(device.id);
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške pri brisanju.');
        }
    };

    return (
        <div className="add-form text-center">
            <p>Are you sure you want to delete "{device.name}"?</p>
            <div className="d-flex justify-content-around mt-3">
                <button onClick={handleConfirm} className="btn btn-danger">Delete</button>
                <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
            </div>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </div>
    );
}

function EditDeviceMenu({ device, onDeviceEdited, onDeviceRemoved }) {
    const [activeMenu, setActiveMenu] = useState('main');
    const nodeRefMain = useRef(null);
    const nodeRefEdit = useRef(null);
    const nodeRefRemove = useRef(null);

    function DropdownItem(props) {
        return (
            <a href="#" className="menu-item" onClick={(e) => {
                e.preventDefault();
                if (props.goToMenu) setActiveMenu(props.goToMenu);
                if (props.onClick) props.onClick();
            }}>
                <span className={`icon-left ${props.leftIcon || ''}`}></span>
                {props.children}
            </a>
        );
    }

    return (
        <div className="dropdown edit-device-menu">
            <CSSTransition nodeRef={nodeRefMain} in={activeMenu === 'main'} unmountOnExit timeout={500} classNames="menu-primary">
                <div ref={nodeRefMain} className="menu">
                    <DropdownItem goToMenu="edit" leftIcon="bi bi-pencil-square">Edit Device</DropdownItem>
                    <DropdownItem goToMenu="remove" leftIcon="bi bi-trash">Remove Device</DropdownItem>
                </div>
            </CSSTransition>

            <CSSTransition nodeRef={nodeRefEdit} in={activeMenu === 'edit'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefEdit} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <EditDeviceForm
                        device={device}
                        onDeviceEdited={onDeviceEdited}
                    />
                </div>
            </CSSTransition>

            <CSSTransition nodeRef={nodeRefRemove} in={activeMenu === 'remove'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefRemove} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <RemoveDeviceConfirmation
                        device={device}
                        onDeviceRemoved={onDeviceRemoved}
                        onCancel={() => setActiveMenu('main')}
                    />
                </div>
            </CSSTransition>
        </div>
    );
}

export default EditDeviceMenu;
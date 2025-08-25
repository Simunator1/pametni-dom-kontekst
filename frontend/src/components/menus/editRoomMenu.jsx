import { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { editRoom, removeRoom, fetchDeviceTypes, addDevice } from '../../services/apiService';

function EditRoomForm({ room, onRoomEdited }) {
    const [roomName, setRoomName] = useState(room.name);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) {
            setFeedback('Naziv sobe je obavezan.');
            return;
        }
        try {
            const updatedRoom = await editRoom(room.id, roomName);
            setFeedback(`Soba "${updatedRoom.name}" je uspješno ažurirana!`);
            if (onRoomEdited) onRoomEdited(updatedRoom);
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške pri ažuriranju.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="add-form">
            <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter new room name"
                className="form-control mb-2"
            />
            <button type="submit" className="btn btn-primary mt-2">Save changes</button>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </form>
    )

}

function RemoveRoomConfirmation({ room, onRoomRemoved, handleCancel }) {
    const [feedback, setFeedback] = useState('');

    const handleConfirm = async () => {
        try {
            await removeRoom(room.id);
            if (onRoomRemoved) onRoomRemoved(room);
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške pri brisanju.');
        }
    }

    return (
        <div className="add-form text-center">
            <p>Are you sure you want to delete "{room.name}" and all of the devices inside?</p>
            <div className="d-flex justify-content-around mt-3">
                <button onClick={handleConfirm} className="btn btn-danger">Yes, delete</button>
                <button onClick={handleCancel} className="btn btn-secondary">No, cancel</button>
            </div>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </div>

    )
}

function AddDeviceForm({ onDeviceAdded, room }) {
    const [deviceName, setDeviceName] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const fetchedTypes = await fetchDeviceTypes();
                setDeviceTypes(fetchedTypes);
                if (fetchedTypes.length > 0) setSelectedType(fetchedTypes[0]);
            } catch (error) {
                setFeedback('Greška pri učitavanju tipova.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deviceName.trim() || !selectedType) {
            setFeedback('Sva polja su obavezna.');
            return;
        }
        try {
            const newDevice = await addDevice({ name: deviceName, roomId: room.id, type: selectedType });
            setFeedback(`Uređaj "${newDevice.name}" je dodan!`);
            setDeviceName('');
            if (onDeviceAdded) {
                onDeviceAdded(newDevice);
            }
        } catch (error) {
            setFeedback(error.message || 'Došlo je do greške.');
        }
    };

    if (loading) return <p className="feedback-message">Učitavanje...</p>;

    return (
        <form onSubmit={handleSubmit} className="add-form">
            <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Unesite ime uređaja"
                className="form-control mb-2"
            />
            <select className="form-select mb-2" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <button type="submit" className="btn btn-primary mt-2">Add Device</button>
            {feedback && <p className="feedback-message mt-2">{feedback}</p>}
        </form>
    );
}

function EditRoomMenu({ room, onRoomEdited, onRoomRemoved, onDeviceAdded, onGoToAddPreference, closeMenu }) {
    const [activeMenu, setActiveMenu] = useState('main');
    const nodeRefMain = useRef(null);
    const nodeRefEdit = useRef(null);
    const nodeRefRemove = useRef(null);
    const nodeRefAddDevice = useRef(null);

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
        <div className="dropdown edit-room-menu">
            <CSSTransition nodeRef={nodeRefMain} in={activeMenu === 'main'} unmountOnExit timeout={500} classNames="menu-primary">
                <div ref={nodeRefMain} className="menu">
                    <DropdownItem goToMenu="edit" leftIcon="bi bi-pencil-square">Edit Room</DropdownItem>
                    <DropdownItem goToMenu="addDevice" leftIcon="bi bi-plus-square">Add Device</DropdownItem>
                    <div onClick={() => { onGoToAddPreference(); closeMenu(); }}>
                        <DropdownItem leftIcon="bi bi-house-gear">Add Preference</DropdownItem>
                    </div>
                    <DropdownItem goToMenu="remove" leftIcon="bi bi-trash">Remove Room</DropdownItem>
                </div>
            </CSSTransition>
            <CSSTransition nodeRef={nodeRefEdit} in={activeMenu === 'edit'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefEdit} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <EditRoomForm
                        room={room}
                        onRoomEdited={onRoomEdited}
                    />
                </div>
            </CSSTransition>
            <CSSTransition nodeRef={nodeRefRemove} in={activeMenu === 'remove'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefRemove} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <RemoveRoomConfirmation
                        room={room}
                        onRoomRemoved={onRoomRemoved}
                        handleCancel={() => setActiveMenu('main')}
                    />
                </div>
            </CSSTransition>
            <CSSTransition nodeRef={nodeRefAddDevice} in={activeMenu === 'addDevice'} unmountOnExit timeout={500} classNames="menu-secondary">
                <div ref={nodeRefAddDevice} className="menu">
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <AddDeviceForm onDeviceAdded={onDeviceAdded} room={room} />
                </div>
            </CSSTransition>
        </div>
    )
}

export default EditRoomMenu;
import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchRoomsWithDevices, fetchDevices,
    getOutsideTemperature, setOutsideTemperature,
    getSimulationInterval, setSimulationInterval,
    getCurrentTimeOfDay, setTimeOfDay,
    getUserPresence, setUserPresence,
    getAllRoutines, getQuickActions
} from '../services/apiService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css';
import Header from '../components/Header';
import QuickActions from '../components/quickActions';
import DisplayOptions from '../components/displayOptions';
import Room from '../components/room';
import Device from '../components/device';
import DeviceDetails from '../components/deviceDetails';
import RoomDetails from '../components/roomDetails';
import RoutineFormMenu from '../components/routineFormMenu';
import RoutineMini from '../components/routineMini';

function DashboardPage() {
    const [allDevices, setAllDevices] = useState([]); // Za "All Devices" prikaz
    const [roomsData, setRoomsData] = useState([]);   // Za "Rooms" prikaz (sobe s uređajima)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('rooms'); // 'rooms' ili 'devices'
    const [outsideTemp, setOutsideTemp] = useState('N/A');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(5000);
    const [currentTimeOfDay, setCurrentTimeOfDay] = useState('MORNING');
    const [userPresent, setUserPresent] = useState(true);
    const [allRoutines, setAllRoutines] = useState([]); // Za rutine
    const [addingRoutine, setAddingRoutine] = useState(false);
    const [allQuickActions, setAllQuickActions] = useState([]); // Za quick actions

    const naslov = "Home";

    const deviceTypeMap = {
        LIGHT: 'Light',
        THERMOSTAT: 'Thermostat',
        AIR_CONDITIONER: 'Air Conditioner',
        SMART_BLIND: 'Smart Blind',
        SMART_OUTLET: 'Smart Outlet',
        SENSOR: 'Sensor',
    }

    // Učitavanje početnih podataka
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [
                    rooms,
                    devices,
                    temp,
                    interval,
                    timeOfDay,
                    presence,
                    routines,
                    quickActions
                ] = await Promise.all([
                    fetchRoomsWithDevices(),
                    fetchDevices(),
                    getOutsideTemperature(),
                    getSimulationInterval(),
                    getCurrentTimeOfDay(),
                    getUserPresence(),
                    getAllRoutines(),
                    getQuickActions()
                ]);

                setRoomsData(rooms);
                setAllDevices(devices);
                setOutsideTemp(temp.outsideTemp);
                setPollingInterval(interval.interval);
                setCurrentTimeOfDay(timeOfDay);
                setUserPresent(presence);
                setAllRoutines(routines);
                setAllQuickActions(quickActions);

                setError(null);
            } catch (err) {
                console.error("Greška pri dohvaćanju početnih podataka:", err);
                setError(err.message || 'Došlo je do greške pri učitavanju.');
                setOutsideTemp('N/A');
                setUserPresent(true);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleDeviceChange = useCallback((updatedDevice) => {
        setAllDevices(prevDevices =>
            prevDevices.map(device =>
                device.id === updatedDevice.id ? updatedDevice : device
            )
        );

        setRoomsData(prevRooms => {
            const newRooms = prevRooms.map(room => {
                if (room.id === updatedDevice.roomId) {
                    const newDevices = room.devices.map(d =>
                        d.id === updatedDevice.id ? updatedDevice : d
                    );
                    const updatedRoom = { ...room, devices: newDevices };

                    if (selectedRoom && selectedRoom.id === room.id) {
                        setSelectedRoom(updatedRoom);
                    }

                    return updatedRoom;
                }
                return room;
            });
            return newRooms;
        });

        setSelectedDevice(prevSelected => {
            if (prevSelected && prevSelected.id === updatedDevice.id) {
                return updatedDevice;
            }
            return prevSelected;
        });
    }, [selectedRoom]);

    const handleDeviceSelect = (device) => {
        setSelectedDevice(device);
    };

    const handleDeviceCloseDetails = () => {
        setSelectedDevice(null);
    };

    const handleRoomSelect = (room) => {
        setSelectedRoom(room);
    };

    const handleCloseRoomDetails = () => {
        setSelectedRoom(null);
    };

    const handleRoomAdded = (newRoom) => {
        setRoomsData(prevRooms => [...prevRooms, { ...newRoom, devices: [], numDevices: 0 }]);
    };

    const handleDeviceAdded = (newDevice) => {
        let updatedRoom;
        setAllDevices(prevDevices => [...prevDevices, newDevice]);

        setRoomsData(prevRooms => {
            let finalUpdatedRoom = null;
            const newRooms = prevRooms.map(room => {
                if (room.id === newDevice.roomId) {
                    const updatedRoom = {
                        ...room,
                        devices: [...room.devices, newDevice],
                        numDevices: room.numDevices + 1
                    };
                    finalUpdatedRoom = updatedRoom;
                    return updatedRoom;
                }
                return room;
            });

            if (selectedRoom && selectedRoom.id === newDevice.roomId && finalUpdatedRoom) {
                setSelectedRoom(finalUpdatedRoom);
            }

            return newRooms;
        });
    };

    const handleRoomToggle = (updatedRoom) => {
        const updatedDeviceIds = new Set(updatedRoom.devices.map(d => d.id));
        const updatedDevicesMap = new Map(updatedRoom.devices.map(d => [d.id, d]));

        setAllDevices(prevDevices =>
            prevDevices.map(device =>
                updatedDeviceIds.has(device.id) ? updatedDevicesMap.get(device.id) : device
            )
        );

        setRoomsData(prevRooms =>
            prevRooms.map(room =>
                room.id === updatedRoom.id ? updatedRoom : room
            )
        );

        if (selectedRoom && selectedRoom.id === updatedRoom.id) {
            setSelectedRoom(updatedRoom);
        }
    };

    const handleDeviceRemoval = (deviceIdToDelete) => {
        setAllDevices(prevDevices =>
            prevDevices.filter(device => device.id !== deviceIdToDelete)
        );

        setRoomsData(prevRooms =>
            prevRooms.map(room => {
                if (room.devices.some(device => device.id === deviceIdToDelete)) {
                    const updatedDevices = room.devices.filter(device => device.id !== deviceIdToDelete);
                    return {
                        ...room,
                        devices: updatedDevices,
                        numDevices: updatedDevices.length
                    };
                }
                return room;
            })
        );
        setSelectedDevice(null);
    };

    const handleIntervalChange = async (newIntervalMs) => {
        try {
            await setSimulationInterval(newIntervalMs);
            setPollingInterval(newIntervalMs);
        } catch (error) {
            console.error("Greška pri postavljanju novog intervala:", error);
        }
    };

    const handleSetOutsideTemp = async (newOutsideTemp) => {
        try {
            const updatedTemp = await setOutsideTemperature(newOutsideTemp);
            setOutsideTemp(updatedTemp);
        } catch (error) {
            console.error("Greška pri postavljanju vanjske temperature:", error);
        }
    }

    const handleTimeChange = async (newTimeOfDay) => {
        try {
            await setTimeOfDay(newTimeOfDay);
            setCurrentTimeOfDay(newTimeOfDay);
        } catch (error) {
            console.error("Greška pri postavljanju vremena dana:", error);
        }
    };

    const handlePresenceToggle = async (isPresent) => {
        try {
            await setUserPresence(isPresent);
            setUserPresent(isPresent);
        }
        catch (error) {
            console.error("Greška pri postavljanju prisutnosti korisnika:", error);
        }
    }

    const handleRoomEdit = (updatedRoom) => {
        const oldRoom = roomsData.find(room => room.id === updatedRoom.id);

        const updatedRoomWithDevices = {
            ...updatedRoom,
            devices: oldRoom.devices,
            numDevices: oldRoom.devices.length
        }

        setRoomsData(prevRooms =>
            prevRooms.map(room =>
                room.id === updatedRoom.id ? updatedRoomWithDevices : room
            )
        )

        setSelectedRoom(updatedRoomWithDevices);
    };

    const handleRoomRemoval = (roomToDelete) => {
        const devicesToRemove = roomToDelete.devices.map(device => device.id);
        setRoomsData(prevRooms =>
            prevRooms.filter(room => room.id !== roomToDelete.id)
        );

        setAllDevices(prevDevices =>
            prevDevices.filter(device => !devicesToRemove.includes(device.id))
        )

        setSelectedRoom(null);
    }

    const handleAddRoutine = (newRoutine) => {
        setAllRoutines(prevRoutines => [...prevRoutines, newRoutine]);
    }

    const handleRoutineToggle = (updatedRoutine) => {
        setAllRoutines(prevRoutines =>
            prevRoutines.map(routine =>
                routine.id === updatedRoutine.id ? updatedRoutine : routine
            )
        );
    }

    const handleAddQuickAction = (newQuickAction) => {
        setAllQuickActions(prevActions => [...prevActions, newQuickAction]);
    }

    const handleAutomatizationUpdate = (updatedDevices) => {
        updatedDevices.forEach(device => {
            handleDeviceChange(device);
        });
    }

    const handleQuickActionRemove = (removedQuickAction) => {
        setAllQuickActions(prevActions =>
            prevActions.filter(action => action.id !== removedQuickAction.id)
        );
    }

    let headerProps;


    if (selectedDevice) {
        // Props za detaljni prikaz uređaja
        headerProps = {
            view: 'deviceDetails',
            device: selectedDevice,
            title: deviceTypeMap[selectedDevice.type] || 'Device',
            onBack: handleDeviceCloseDetails,
            onDeviceEdited: handleDeviceChange,
            onDeviceRemoved: handleDeviceRemoval
        };
    } else if (selectedRoom) {
        // Props za detaljni prikaz sobe
        headerProps = {
            view: 'roomDetails',
            room: selectedRoom,
            title: "Room Overview",
            onBack: handleCloseRoomDetails,
            onRoomEdited: handleRoomEdit,
            onRoomRemoved: handleRoomRemoval,
            onDeviceAdded: handleDeviceAdded
        }
    } else if (addingRoutine) {
        // Props za dodavanje rutine
        headerProps = {
            view: 'routineAdd',
            title: "Add Routine",
            onBack: () => setAddingRoutine(false),
        }
    }
    else {
        // Props za glavni prikaz
        headerProps = {
            view: 'main',
            title: naslov,
            onIntervalChange: handleIntervalChange,
            currentInterval: pollingInterval,
            onTempChange: handleSetOutsideTemp,
            OutsideTemp: outsideTemp,
            onTimeChange: handleTimeChange,
            TimeOfDay: currentTimeOfDay,
            onPresenceChange: handlePresenceToggle,
            UserPresence: userPresent,
            onRoomAdded: handleRoomAdded,
            onDeviceAdded: handleDeviceAdded,
            onGoToRoutineAdd: () => { setAddingRoutine(true) }
        };
    }

    if (loading) {
        return <p>Učitavanje uređaja...</p>;
    }

    if (error) {
        return <p>Greška: {error}</p>;
    }


    // --- Prikaz 1: Detalji Uređaja ---
    if (selectedDevice) {
        return (
            <div className="dashboard-container">
                <Header {...headerProps} />
                <QuickActions
                    quickActions={allQuickActions}
                    onAutomatizationUpdate={handleAutomatizationUpdate}
                    onQuickActionRemove={handleQuickActionRemove} />
                <DeviceDetails
                    device={selectedDevice}
                    onStateChange={handleDeviceChange}
                    outsideTemp={outsideTemp}
                    pollingInterval={pollingInterval}
                />
            </div>
        );
    }

    // --- Prikaz 2: Detalji Sobe ---
    else if (selectedRoom) {
        return (
            <div className="dashboard-container">
                <Header {...headerProps} />
                <QuickActions
                    quickActions={allQuickActions}
                    onAutomatizationUpdate={handleAutomatizationUpdate}
                    onQuickActionRemove={handleQuickActionRemove} />
                <RoomDetails
                    room={selectedRoom}
                    routines={allRoutines}
                    onRoomToggle={handleRoomToggle}
                    handleDeviceChange={handleDeviceChange}
                    handleDeviceSelect={handleDeviceSelect}
                    onRoutineToggle={handleRoutineToggle}
                />
            </div>
        );
    }

    // --- Prikaz 3: Dodavanje Rutine, Quick Action ili Preference ---
    else if (addingRoutine) {
        return (
            <div className="dashboard-container">
                <Header {...headerProps} />
                <RoutineFormMenu
                    allDevices={allDevices}
                    onAddRoutine={handleAddRoutine}
                    onAddQuickAction={handleAddQuickAction}
                    onClose={() => setAddingRoutine(false)} />
            </div>
        )
    }

    // --- Prikaz 4: Glavna ploča (Default) ---
    return (
        <div className="dashboard-container">
            <Header {...headerProps} />
            <QuickActions
                quickActions={allQuickActions}
                onAutomatizationUpdate={handleAutomatizationUpdate}
                onQuickActionRemove={handleQuickActionRemove} />
            <DisplayOptions currentView={viewMode} onViewChange={setViewMode} />

            {viewMode === 'rooms' && (
                <div className="rooms-wrapper">
                    {roomsData.map(room => (
                        <Room
                            key={room.id}
                            room={room}
                            onRoomToggle={handleRoomToggle}
                            onRoomSelect={handleRoomSelect}
                        />
                    ))}
                </div>
            )}
            {viewMode === 'devices' && (
                <div className="devices-wrapper">
                    {allDevices.map(device => (
                        <Device
                            key={device.id}
                            device={device}
                            onStateChange={handleDeviceChange}
                            onDeviceSelect={handleDeviceSelect}
                        />
                    ))}
                </div>
            )}
            {viewMode === 'routines' && (
                <div className="devices-wrapper">
                    {allRoutines.map(routine => (
                        <RoutineMini
                            key={routine.id}
                            routine={routine}
                            onRoutineToggle={handleRoutineToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


export default DashboardPage;
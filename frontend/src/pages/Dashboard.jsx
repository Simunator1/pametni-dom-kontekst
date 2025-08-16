import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchRoomsWithDevices, fetchDevices,
    getOutsideTemperature, setOutsideTemperature,
    getSimulationInterval, setSimulationInterval,
    getCurrentTimeOfDay, setTimeOfDay,
    getUserPresence, setUserPresence
} from '../services/apiService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css';
import Header from '../components/Header';
import QuickActions from '../components/quickActions';
import DisplayOptions from '../components/displayOptions';
import Room from '../components/room';
import Device from '../components/device';
import DeviceDetails from '../components/deviceDetails';

function DashboardPage() {
    const [allDevices, setAllDevices] = useState([]); // Za "All Devices" prikaz
    const [roomsData, setRoomsData] = useState([]);   // Za "Rooms" prikaz (sobe s uređajima)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('rooms'); // 'rooms' ili 'devices'
    const [outsideTemp, setOutsideTemp] = useState('N/A');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(5000);
    const [currentTimeOfDay, setCurrentTimeOfDay] = useState('MORNING');
    const [userPresent, setUserPresent] = useState(true);

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
                    presence
                ] = await Promise.all([
                    fetchRoomsWithDevices(),
                    fetchDevices(),
                    getOutsideTemperature(),
                    getSimulationInterval(),
                    getCurrentTimeOfDay(),
                    getUserPresence()
                ]);

                setRoomsData(rooms);
                setAllDevices(devices);
                setOutsideTemp(temp.outsideTemp);
                setPollingInterval(interval.interval);
                setCurrentTimeOfDay(timeOfDay);
                setUserPresent(presence);

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
                const devicesWithoutUpdated = room.devices.filter(d => d.id !== updatedDevice.id);

                if (room.id === updatedDevice.roomId) {
                    return {
                        ...room,
                        devices: [...devicesWithoutUpdated, updatedDevice],
                        numDevices: devicesWithoutUpdated.length + 1
                    };
                }

                return {
                    ...room,
                    devices: devicesWithoutUpdated,
                    numDevices: devicesWithoutUpdated.length
                };
            });
            return newRooms;
        });

        setSelectedDevice(prevSelected => {
            if (prevSelected && prevSelected.id === updatedDevice.id) {
                return updatedDevice;
            }
            return prevSelected;
        });
    }, []);

    const handleDeviceSelect = (device) => {
        setSelectedDevice(device);
    };

    const handleCloseDetails = () => {
        setSelectedDevice(null);
    };

    const handleRoomAdded = (newRoom) => {
        setRoomsData(prevRooms => [...prevRooms, { ...newRoom, devices: [], numDevices: 0 }]);
    };

    const handleDeviceAdded = (newDevice) => {
        setAllDevices(prevDevices => [...prevDevices, newDevice]);

        setRoomsData(prevRooms =>
            prevRooms.map(room => {
                if (room.id === newDevice.roomId) {
                    return {
                        ...room,
                        devices: [...room.devices, newDevice],
                        numDevices: room.numDevices + 1
                    };
                }
                return room;
            })
        );
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

        setSelectedDevice(prevSelected => {
            if (prevSelected && prevSelected.id === deviceIdToDelete) {
                return null;
            }
            return prevSelected;
        });
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

    let headerProps;

    if (selectedDevice) {
        // Props za detaljni prikaz uređaja
        headerProps = {
            device: selectedDevice,
            title: deviceTypeMap[selectedDevice.type] || 'Device',
            onBack: handleCloseDetails,
            onDeviceEdited: handleDeviceChange,
            onDeviceRemoved: handleDeviceRemoval
        };
    } else {
        // Props za glavni prikaz
        headerProps = {
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
        };
    }

    if (loading) {
        return <p>Učitavanje uređaja...</p>;
    }

    if (error) {
        return <p>Greška: {error}</p>;
    }

    return (
        <div className="dashboard-container">
            <Header {...headerProps} />
            {selectedDevice ? (
                <>
                    <QuickActions />
                    <DeviceDetails
                        device={selectedDevice}
                        onStateChange={handleDeviceChange}
                        outsideTemp={outsideTemp}
                        pollingInterval={pollingInterval}
                    />
                </>
            ) : (
                <>
                    <QuickActions />
                    <DisplayOptions currentView={viewMode} onViewChange={setViewMode} />

                    {viewMode === 'rooms' && (
                        <div className="rooms-wrapper">
                            {roomsData.map(room => (
                                <Room key={room.id} room={room} onRoomToggle={handleRoomToggle} />
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
                                    pollingInterval={pollingInterval}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

export default DashboardPage;
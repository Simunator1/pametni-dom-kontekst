import React, { useState, useEffect, useCallback } from 'react';
import { fetchRoomsWithDevices, fetchDevices, getOutsideTemperature } from '../services/apiService';
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

    const naslov = "Home";

    const deviceTypeMap = {
        LIGHT: 'Light',
        THERMOSTAT: 'Thermostat',
        AIR_CONDITIONER: 'Air Conditioner',
        SMART_BLIND: 'Smart Blind',
        SMART_OUTLET: 'Smart Outlet',
        SENSOR: 'Sensor',
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const fetchedRoomsData = await fetchRoomsWithDevices();
                setRoomsData(fetchedRoomsData);

                const fetchedAllDevices = await fetchDevices();
                setAllDevices(fetchedAllDevices);

                setError(null);
            } catch (err) {
                console.error("Greška u DashboardPage pri dohvaćanju podataka:", err);
                setError(err.message || 'Došlo je do greške pri učitavanju.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const fetchOutsideTemperature = async () => {
            try {
                const response = await getOutsideTemperature();
                setOutsideTemp(response.outsideTemp);
            } catch (error) {
                console.error("Greška pri dohvaćanju vanjske temperature:", error);
                setOutsideTemp('N/A');
            }
        };

        fetchOutsideTemperature();
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
                        numDevices: devicesWithoutUpdated.length + 1 // Ispravno računamo broj
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

    if (loading) {
        return <p>Učitavanje uređaja...</p>;
    }

    if (error) {
        return <p>Greška: {error}</p>;
    }

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
    return (
        <div className="dashboard-container">
            <Header
                device={selectedDevice ? selectedDevice : null}
                title={selectedDevice ? deviceTypeMap[selectedDevice.type] : naslov}
                onBack={selectedDevice ? handleCloseDetails : null}
                onDeviceEdited={selectedDevice ? handleDeviceChange : null}
                onDeviceRemoved={selectedDevice ? handleDeviceRemoval : null}

                onRoomAdded={!selectedDevice ? handleRoomAdded : null}
                onDeviceAdded={!selectedDevice ? handleDeviceAdded : null}
            />
            {selectedDevice ? (
                <>
                    <QuickActions />
                    <DeviceDetails
                        device={selectedDevice}
                        onStateChange={handleDeviceChange}
                        outsideTemp={outsideTemp}
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
                                    onDeviceSelect={handleDeviceSelect} // Proslijedi funkciju za odabir
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
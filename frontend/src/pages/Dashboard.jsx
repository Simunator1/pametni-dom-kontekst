import React, { useState, useEffect, useCallback } from 'react';
import { fetchRoomsWithDevices, fetchDevices, getOutsideTemperature } from '../services/apiService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css';
import Header from '../components/Header';
import QuickActions from '../components/quickActions';
import DisplayOptions from '../components/displayOptions';
import Room from '../components/room';
import Device from '../components/device';
import Light from '../components/devices/light';
import TempConditioner from '../components/devices/tempConditioner';
import SmartBlind from '../components/devices/smartBlind';
import SmartOutlet from '../components/devices/smartOutlet';
import Sensor from '../components/devices/sensor';

function DashboardPage() {
    const [allDevices, setAllDevices] = useState([]); // Za "All Devices" prikaz
    const [roomsData, setRoomsData] = useState([]);   // Za "Rooms" prikaz (sobe s uređajima)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('rooms'); // 'rooms' ili 'devices'
    const [outsideTemp, setOutsideTemp] = useState('N/A');

    const naslov = "Home";

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

    const handleDeviceStateChange = useCallback((updatedDevice) => {
        setAllDevices(prevDevices =>
            prevDevices.map(device =>
                device.id === updatedDevice.id ? updatedDevice : device
            )
        );
        setRoomsData(prevRooms =>
            prevRooms.map(room => ({
                ...room,
                devices: room.devices.map(device =>
                    device.id === updatedDevice.id ? updatedDevice : device
                )
            }))
        );
    }, []);

    if (loading) {
        return <p>Učitavanje uređaja...</p>;
    }

    if (error) {
        return <p>Greška: {error}</p>;
    }

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

    return (
        <div className="dashboard-container">
            <Header
                title={naslov}
                onRoomAdded={handleRoomAdded}
                onDeviceAdded={handleDeviceAdded} />
            <QuickActions />
            <DisplayOptions currentView={viewMode} onViewChange={setViewMode} />
            {viewMode === 'rooms' &&
                <div className="rooms-wrapper">
                    {roomsData.map(room => (
                        <Room key={room.id} room={room} onRoomToggle={handleRoomToggle} />
                    ))}
                </div>
            }
            {viewMode === 'devices' &&
                <div className="devices-wrapper">
                    {allDevices.map(device => (
                        <Device
                            key={device.id}
                            device={device}
                            onStateChange={handleDeviceStateChange} />
                    ))}
                </div>
            }
        </div>
    );
}

export default DashboardPage;
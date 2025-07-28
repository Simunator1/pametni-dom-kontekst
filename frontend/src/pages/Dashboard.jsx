import React, { useState, useEffect } from 'react';
import { fetchRoomsWithDevices, fetchDevices } from '../services/apiService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css';
import Header from '../components/Header';
import QuickActions from '../components/quickActions';
import DisplayOptions from '../components/displayOptions';
import Room from '../components/room';
import Device from '../components/device';

function DashboardPage() {
    const [allDevices, setAllDevices] = useState([]); // Za "All Devices" prikaz
    const [roomsData, setRoomsData] = useState([]);   // Za "Rooms" prikaz (sobe s uređajima)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('rooms'); // 'rooms' ili 'devices'

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

    if (loading) {
        return <p>Učitavanje uređaja...</p>;
    }

    if (error) {
        return <p>Greška: {error}</p>;
    }

    const handleDeviceStateChange = (updatedDevice) => {
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
    };

    return (
        <div className="dashboard-container">
            <Header title={naslov} />
            <QuickActions />
            <DisplayOptions currentView={viewMode} onViewChange={setViewMode} />
            {viewMode === 'rooms' &&
                <div className="rooms-wrapper">
                    {roomsData.map(room => (
                        <Room key={room.id} room={room} />
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
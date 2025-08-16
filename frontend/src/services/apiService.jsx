const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchDevices = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju uređaja: ${response.status} ${errorData.message || ''}`);
        }

        const devices = await response.json();
        return devices;
    } catch (error) {
        console.error("Problem s fetchDevices:", error);
        throw error;
    }
};

export const fetchRoomsWithDevices = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/getRoomsWithDevices`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju soba s uređajima: ${response.status} ${errorData.message || ''}`);
        }
        const roomsData = await response.json();
        return roomsData;
    } catch (error) {
        console.error("Problem s fetchRoomsWithDevices:", error);
        throw error;
    }
};

export const sendDeviceAction = async (deviceId, action) => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/actions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(action),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri slanju akcije: ${response.status} ${errorData.message || ''}`);
        }

        const updatedDevice = await response.json();
        return updatedDevice;
    } catch (error) {
        console.error("Problem sa sendDeviceAction:", error);
        throw error;
    }
};

export const addRoom = async (roomName) => {
    try {
        const response = await fetch(`${API_BASE_URL}/addRoom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: roomName }),
        });

        if (response.status === 409) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`${errorData.message || ''}`);
        }

        else if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dodavanju sobe: ${response.status} ${errorData.message || ''}`);
        }

        const newRoom = await response.json();
        return newRoom;
    } catch (error) {
        console.error("Problem s addRoom:", error);
        throw error;
    }
};

export const fetchDeviceTypes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllDeviceTypes`);
        if (!response.ok) {
            throw new Error('Greška pri dohvaćanju tipova uređaja');
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s fetchDeviceTypes:", error);
        throw error;
    }
};

export const addDevice = async (deviceData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/addDevice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deviceData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dodavanju uređaja: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s addDevice:", error);
        throw error;
    }
};

export const toggleRoom = async (roomId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/roomToggle`, {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri gašenju/paljenju sobe: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s toggleRoom:", error);
        throw error;
    }
};

export const getOutsideTemperature = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/outside-temp`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju vanjske temperature: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s getOutsideTemperature:", error);
        throw error;
    }
};

export const setOutsideTemperature = async (temperature) => {
    try {
        const response = await fetch(`${API_BASE_URL}/outside-temp`, {
            method: 'POST',
            headers: {

                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ temperature }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri postavljanju vanjske temperature: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s setOutsideTemperature:", error);
        throw error;
    }
};

export const getDeviceById = async (deviceId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju uređaja: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s getDeviceById:", error);
        throw error;
    }
};

export const removeDevice = async (deviceId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri brisanju uređaja: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s removeDevice:", error);
        throw error;
    }
};

export const removeRoom = async (roomId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri brisanju sobe: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s removeRoom:", error);
        throw error;
    }
};

export const editRoom = async (roomId, newRoomName) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newRoomName }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri uređivanju sobe: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s editRoom:", error);
        throw error;
    }
};

export const editDevice = async (deviceId, newDeviceName, newRoomId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newDeviceName, newRoomId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri uređivanju uređaja: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s editDevice:", error);
        throw error;
    }
};

export const getSimulationInterval = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/simulation/interval`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju intervala simulacije: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s getSimulationInterval:", error);
        throw error;
    }
}

export const setSimulationInterval = async (newIntervalMs) => {
    try {
        const response = await fetch(`${API_BASE_URL}/simulation/interval`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newIntervalMs }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri postavljanju intervala simulacije: ${response.status} ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Problem s setSimulationInterval:", error);
        throw error;
    }
};

export const getCurrentTimeOfDay = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/context/time-of-day`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju doba dana: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s getCurrentTimeOfDay:", error);
        throw error;
    }
};

export const setTimeOfDay = async (timeOfDay) => {
    try {
        const response = await fetch(`${API_BASE_URL}/context/time-of-day`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeOfDay }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri postavljanju doba dana: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s setCurrentTimeOfDay:", error);
        throw error;
    }
};

export const getUserPresence = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/context/user-presence`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju prisutnosti korisnika: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s getUserPresence:", error);
        throw error;
    }
};

export const setUserPresence = async (isPresent) => {
    try {
        const response = await fetch(`${API_BASE_URL}/context/user-presence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPresent }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri postavljanju prisutnosti korisnika: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s setUserPresence:", error);
        throw error;
    }
};

export const getTimesOfDay = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/context/times-of-day`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Greška pri dohvaćanju svih doba dana: ${response.status} ${errorData.message || ''}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Problem s getTimesOfDay:", error);
        throw error;
    }
}
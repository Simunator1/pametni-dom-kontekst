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
            body: JSON.stringify(action), // npr. { actionType: 'TOGGLE_ON_OFF' }
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
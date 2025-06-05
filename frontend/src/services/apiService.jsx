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
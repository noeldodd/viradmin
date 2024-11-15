// database.ts
import { response } from 'express'
import { JSONFilePreset } from 'lowdb/node'

type User = { id: string, username: string, password: string }
type Device = { id: string, userId: string, displayname: string, profile: object }
type Data = { users: User[], devices: Device[] }

const defaultData: Data = { users: [], devices: [] }
const db = await JSONFilePreset('db.json', defaultData)
db.write();

const { users, devices } = db.data
console.log("Starting database.ts...")
console.log(users, devices)

// CRUD functions for interacting with `users` and `devices`
export async function addUser(user: User) {
    await users.push(user);
    await db.write();
}
export async function findUserById(id: string) {
    return await users.find(user => user.id === id);
   
}
export async function findUserByUsername(username: string) {
    const ruser = await users.find(user => user.username === username);
    console.log("findUserByUsername: ", ruser);
    return ruser;
    //return await users.find(user => user.username === username);
}
export async function getAllDevices(userId: string) {
    await db.read();
    return devices.filter(device => device.userId === userId);
}
export async function addDevice(device: Device) {
    devices.push(device);
    await db.write();
    console.log("db.addDevice: " + devices.length       );
}
export async function updateDevice(id: string, updates: Partial<Device>) {
    const device = await devices.find(device => device.id === id);
    if (device) {
        Object.assign(device, updates);
        await db.write();
        return device;
    }
    return null;
}
export async function deleteDevice(id: string) {
    await db.read();
    const index = devices.findIndex(device => device.id === id);
    if (index !== -1) {
        const [deletedDevice] = devices.splice(index, 1);
        await db.write();
        return deletedDevice;
    }
    return null;
}

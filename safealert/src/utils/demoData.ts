export const DEMO_USERS = ['Riya Sharma', 'Arjun Mehta', 'Priya Nair', 'Karan Patel', 'Sneha Iyer'];

export const DEMO_LOCATIONS: { label: string; latitude: number; longitude: number }[] = [
  { label: 'MG Road, Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { label: 'Connaught Place, Delhi', latitude: 28.6315, longitude: 77.2167 },
  { label: 'Marine Drive, Mumbai', latitude: 18.9432, longitude: 72.8236 },
  { label: 'MG Road, Bengaluru', latitude: 12.9758, longitude: 77.6045 },
  { label: 'Park Street, Kolkata', latitude: 22.5524, longitude: 88.3529 },
];

export function randomDemoUser() {
  return DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
}

export function randomDemoLocation() {
  const base = DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
  // jitter slightly so repeated demo alerts aren't identical
  return {
    latitude: base.latitude + (Math.random() - 0.5) * 0.01,
    longitude: base.longitude + (Math.random() - 0.5) * 0.01,
    label: base.label,
  };
}

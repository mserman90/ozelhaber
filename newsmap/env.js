export function getEnv() {
  const isGhPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  return (
    window["env"] || {
      API_ROOT: isGhPages ? "https://newsmap.ijmacd.com/api" : "",
      UPDATE_FREQUENCY: 300000,
      DONATION_LINK: "",
    }
  );
}

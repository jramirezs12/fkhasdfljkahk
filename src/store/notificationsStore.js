import { create } from 'zustand';

export const useNotificationsStore = create((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => {
    const exists = state.notifications.some(n => n.id === notification.id);
    if (exists) return { notifications: state.notifications };
    return { notifications: [notification, ...state.notifications] };
  }),
  addNotificationsIfNotExist: (newNotifications) => set((state) => {
    const currentIds = new Set(state.notifications.map(n => n.id));
    const filtered = newNotifications.filter(n => !currentIds.has(n.id));
    return { notifications: [...filtered, ...state.notifications] };
  }),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationsStore;

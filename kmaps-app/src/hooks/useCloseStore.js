import create from 'zustand';

export const closeStore = create((set) => ({
    buttonState: true,
    changeButtonState: () =>
        set((state) => ({ buttonState: !state.buttonState })),
    openButtonState: () => set((state) => ({ buttonState: true })),
}));

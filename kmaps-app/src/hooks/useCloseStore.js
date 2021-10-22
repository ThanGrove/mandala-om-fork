import create from 'zustand';

export const closeStore = create((set, get) => ({
    buttonState: true,
    changeButtonState: () => {
        set((state) => ({ buttonState: !state.buttonState }));
    },
    openButtonState: () => {
        set((state) => ({ buttonState: true }));
    },
}));

export const openTabStore = create((set, get) => ({
    openTab: 1, // 0 = none, 1 = adv search, 2 = trees
    changeButtonState: (current) => {
        const newstate = current === get().openTab ? 0 : current;
        set((state) => ({ openTab: newstate }));
    },
}));

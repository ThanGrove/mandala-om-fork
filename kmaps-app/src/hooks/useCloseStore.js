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
    openTab: mandalaSidebar(), // openTab Values: 0 = none, 1 = adv search, 2 = trees
    changeButtonState: (newstate) => {
        if (newstate !== get().openTab) {
            // console.log("newstate", newstate);
            set((state) => ({ openTab: newstate }));
        }
    },
}));

export const treeStore = create((set) => ({
    tree: process?.env?.REACT_APP_DEFAULT_KMAP_TAB || 'places',
    setTree: (newTree) => {
        set({ tree: newTree });
    },
}));

/**
 * Mandala sidebar function checks to see if there is a JSON script element with id "mandala_settings"
 * If so, it takes the text which should be JSON and parses it.
 * If there is a sidebar variable, it returns that. Otherwise it returns 1 for adv search.
 * See Mandala Kadence theme's functions.php file for "add_custom_data()" function that writes the JSON
 * @returns {string|boolean}
 */
function mandalaSidebar() {
    const mandala_settings = document.getElementById('mandala_data');
    if (mandala_settings && mandala_settings?.innerText) {
        const mandala_settings_json = JSON.parse(mandala_settings.innerText);
        if (mandala_settings_json && mandala_settings_json?.sidebar) {
            return mandala_settings_json.sidebar;
        }
    }
    return 1;
}

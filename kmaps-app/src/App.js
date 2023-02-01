import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SearchUI from './legacy/searchui';
import Pages from './legacy/pages';
import { Main } from './main/Main';

export const ADVANCED_LABEL = 'Advanced';
export const BASIC_LABEL = 'Basic Search';

const queryClient = new QueryClient();

export default function App() {
    if (!window.sui) {
        window.sui = new SearchUI();
    }

    let sui = window.sui;

    if (!window.sui.pages) {
        sui.pages = window.sui.pages = new Pages(sui);
    }

    window.mandala = {};

    return (
        <QueryClientProvider client={queryClient}>
            <Main sui={sui} />
        </QueryClientProvider>
    );
}

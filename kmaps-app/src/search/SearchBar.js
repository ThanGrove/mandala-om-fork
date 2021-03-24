import React from 'react';
import { BasicSearch } from './BasicSearch';

export function SearchBar(props) {
    const searchbar = (
        <section id="c-site__search" className="c-site__search">
            {/*<form onSubmit={this.handleSubmit}>*/}
            <BasicSearch />
            {/*</form>*/}
        </section>
    );
    return searchbar;
}

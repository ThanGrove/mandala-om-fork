import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
// import store from './app/store';
// import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

const target = document.getElementById('mandala-root');

if (target) {
    ReactDOM.render(<App />, target);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

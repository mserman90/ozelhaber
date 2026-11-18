import React, { Component } from 'react';
import { translate as t } from '../i18n.js';

export default class ErrorHandler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            /** @type {Error?} */
            error: null,
        };
    }

    /**
     * @param {Error} error
     */
    componentDidCatch(error) {
        this.setState({ error });

        if (window['gtag']) {
            window['gtag']('event', 'exception', { description: error.message, fatal: true });
        }
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ color: "white", margin: 32 }}>
      <h1 style={{ textShadow: "2px 2px black" }}>{t(document.documentElement.lang, "browserProblem")}</h1>
      <p>{t(document.documentElement.lang, "browserProblemHelp")} <a href={`//github.com/IJMacD/newsmap-js/issues/new?title=Browser+Problem&amp;body=${encodeURIComponent(navigator.userAgent + "\n\n" + this.state.error.message)}`}>GitHub</a>.</p>
                    <p><code>{this.state.error.message}</code></p>
                </div>
            );
        }

        return this.props.children;
    }
}

import React, { useState } from 'react';
import * as palettes from '../colours.js';
import editions from '../data/editions.json';
import { translate as t } from '../i18n.js';

/**
 *
 * @param {object} props
 * @param {"en"|"tr"} props.locale
 * @param {string[]} props.selectedEditions
 * @param {"tree"|"tree_mixed"|"grid"} props.mode
 * @param {"time"|"source_count"|"sources"|"position"} props.weightingMode
 * @param {boolean} props.showGradient
 * @param {boolean} props.headerTop
 * @param {number} props.itemsPerCategory
 * @param {boolean} props.newTab
 * @param {boolean} props.enableSourcesModal
 * @param {string} props.selectedPalette
 * @param {string} [props.theme]
 * @param {string} [props.geminiApiKey]
 * @param {() => void} props.onClose
 * @param {(ed: string[]) => void} props.onEditionChange
 * @param {(state: any) => void} props.setSavedState
 * @param {string} [props.donationLink]
 * @returns
 */
export function OptionsModal({
  locale = "en",
  selectedEditions,
  mode,
  weightingMode,
  showGradient,
  headerTop,
  itemsPerCategory,
  newTab,
  enableSourcesModal,
  selectedPalette,
  theme = "dark",
  geminiApiKey = "",
  onClose,
  onEditionChange,
  setSavedState,
  donationLink,
}) {
  /**
   * @param {import('react').FormEvent<HTMLSelectElement>} e
   */
  function handleEditionChange(e) {
    const { options } = e.currentTarget;
    const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
    onEditionChange(selected);
  }

  return (
    <div className="App-shade" onClick={onClose}>
      <div className="App-modal App-Options" onClick={e => e.stopPropagation()}>
        <h1>{t(locale, "settings")}</h1>
        <div className="App-modalbody">
          <div className="App-formgroup">
            <label htmlFor="sel-language">{t(locale, "language")}</label>
            <select id="sel-language" value={locale} onChange={e => setSavedState({ locale: e.target.value })}>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label htmlFor="sel-theme">{t(locale, "theme")}</label>
            <select id="sel-theme" value={theme} onChange={e => setSavedState({ theme: e.target.value })}>
              <option value="dark">{t(locale, "themeDark")}</option>
              <option value="oled">{t(locale, "themeOled")}</option>
              <option value="light">{t(locale, "themeLight")}</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label htmlFor="sel-editions">
              {t(locale, "edition")}
            </label>
            <select
              id="sel-editions"
              multiple
              onChange={handleEditionChange}
              value={selectedEditions}
            >
              {editions.map(ed => <option key={ed.value} value={ed.value}>{ed.name}</option>)}
            </select>
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-top-header">
              {t(locale, "controlsTop")}
            </label>
            <input id="chk-top-header" type="checkbox" checked={headerTop} onChange={e => setSavedState({ headerTop: e.target.checked })} />
          </div>
          <div className="App-formgroup">
            <label htmlFor="sel-layout-mode">
              {t(locale, "layoutMode")}
            </label>
            <select id="sel-layout-mode" value={mode} onChange={e => setSavedState({ mode: e.target.value })}>
              <option value="tree">{t(locale, "treeMap")}</option>
              <option value="tree_mixed">{t(locale, "treeMapCombined")}</option>
              <option value="grid">{t(locale, "grid")}</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label htmlFor="sel-weighting-mode">
              {t(locale, "weightingMode")}
            </label>
            <select id="sel-weighting-mode" value={weightingMode} onChange={e => setSavedState({ weightingMode: e.target.value })}>
              <option value="time">{t(locale, "timeBased")}</option>
              <option value="sources">{t(locale, "sourceAndPosition")}</option>
              <option value="position">{t(locale, "position")}</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label>
              {t(locale, "palette")}
            </label>
            <PaletteSelect selectedPalette={selectedPalette} setPalette={(name) => setSavedState({ palette: name })} locale={locale} />
          </div>
          <div className="App-formgroup">
            <label>
              {t(locale, "squareStyle")}
            </label>
            <div>
              <label htmlFor="chk-style-flat" style={{ marginBottom: 8 }}>
                <input id="chk-style-flat" name="chk-style" type="radio" checked={!showGradient} onChange={e => setSavedState({ showGradient: !e.target.checked })} />
                {t(locale, "flat")}
              </label>
              <label htmlFor="chk-style-gradient" style={{ marginBottom: 8 }}>
                <input id="chk-style-gradient" name="chk-style" type="radio" checked={showGradient} onChange={e => setSavedState({ showGradient: e.target.checked })} />
                {t(locale, "gradient")}
              </label>
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="num-per-cat">
              {t(locale, "itemsPerCategory")}
            </label>
            <div>
              <input id="num-per-cat" type="number" min={0} value={itemsPerCategory} onChange={e => setSavedState({ itemsPerCategory: e.target.value })} />
              <p style={{ fontStyle: "italic", fontSize: "0.8em" }}>{t(locale, "maxItems")}</p>
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-new-tab">
              {t(locale, "openNewTab")}
            </label>
            <input id="chk-new-tab" type="checkbox" checked={newTab} onChange={e => setSavedState({ newTab: e.target.checked })} />
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-sources-modal">
              {t(locale, "showSourcesBeforeLink")}
            </label>
            <input id="chk-sources-modal" type="checkbox" checked={enableSourcesModal} onChange={e => setSavedState({ enableSourcesModal: e.target.checked })} />
          </div>
          <div className="App-formgroup" style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #333' }}>
            <label htmlFor="txt-gemini-key">
              {t(locale, "geminiApiKey")}
            </label>
            <div>
              <input
                id="txt-gemini-key"
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={e => setSavedState({ geminiApiKey: e.target.value })}
                style={{ width: '100%' }}
              />
              <p style={{ fontStyle: "italic", fontSize: "0.75em", color: "#888", marginTop: '4px' }}>
                {t(locale, "geminiApiKeyHint")}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {donationLink && <DonationLink link={donationLink} locale={locale} />}
          <p style={{ textAlign: "right", margin: 0, marginLeft: 'auto' }}>
            <button onClick={onClose}>{t(locale, "dismiss")}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function PaletteSelect({ selectedPalette, setPalette, locale }) {
  return Object.entries(palettes).map(([name, palette]) => {
    if (name === "default")
      return null;

    return (
      <div
        key={name}
        className="App-palette"
        style={{ outlineColor: name === selectedPalette ? "#FFF" : void 0 }}
        onClick={() => setPalette(name)}
      >
        {Object.entries(palette).map(([cat, colour]) => (
          <div
            key={cat}
            className="App-swatch"
            style={{ backgroundColor: colour }}
            title={t(locale, `categories.${cat}`)} />
        ))}
      </div>
    );
  });
}

function DonationLink({ link, locale }) {
  const [showDonationLink, setShowDonationLink] = useState(false);

  return (
    <div style={{ flex: 1 }}>
      {showDonationLink ?
        <p style={{ fontSize: "0.8em" }}>
          {t(locale, "donationText")}{' '}
          <a href={link} target="_blank" rel="noopener">{link}</a>.
        </p> :
        <p style={{ margin: 0 }}>
          <button onClick={() => setShowDonationLink(true)} className="btn-link">
            {t(locale, "helpHosting")}
          </button>
        </p>
      }
    </div>
  );
}

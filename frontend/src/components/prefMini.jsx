import '../styles/prefMini.css';

const PrefMini = ({ pref, onSelectPref }) => {

    return (
        <div className={`pref-container`} onClick={() => onSelectPref(pref)}>
            <div className="pref">
                <i className={`pref-ikona ${pref.icon}`}></i>
                <div className={'pref-name-wrapper'}>
                    <p
                        className="pref-name"
                        title={pref.name}
                    >
                        {pref.name}
                    </p>
                </div>
            </div>
            <div>
                <p className="description">{pref.description}</p>
            </div>
        </div>
    );
};

export default PrefMini;
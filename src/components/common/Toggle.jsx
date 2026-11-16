function Toggle({ checked, onChange, label, disabled = false }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            className="switch"
            onClick={onChange}
            disabled={disabled}
        />
    );
}

export default Toggle;
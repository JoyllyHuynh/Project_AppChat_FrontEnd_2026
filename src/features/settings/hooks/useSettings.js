import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetSettings, selectSettings, toggleSetting } from "../settingsSlice";

export default function useSettings() {
    const dispatch = useDispatch();
    const settings = useSelector(selectSettings);

    const toggle = useCallback((key) => dispatch(toggleSetting(key)), [dispatch]);
    const reset = useCallback(() => dispatch(resetSettings()), [dispatch]);

    return { settings, toggle, reset };
}
package iot.espressif.esp32.model.device.properties;

public class EspDeviceState {
    private int mStateValue;

    /**
     * Set device state
     *
     * @param state
     */
    public void setState(State state) {
        mStateValue = state.getStateValue();
    }

    /**
     * Set device state with state value
     *
     * @param stateValue
     */
    public void setState(int stateValue) {
        mStateValue = stateValue;
    }

    /**
     * Get device state value
     *
     * @return device state value
     */
    public int getStateValue() {
        return mStateValue;
    }

    /**
     * Add device state
     *
     * @param state
     */
    public void addState(State state) {
        mStateValue |= state.getStateValue();
    }

    /**
     * Remove device state
     *
     * @param state
     */
    public void removeState(State state) {
        mStateValue &= ~state.getStateValue();
    }

    /**
     * Clear device state
     */
    public void clearState() {
        mStateValue = 0;
    }

    /**
     * Whether device contain target state
     *
     * @param state
     * @return device contain state or not
     */
    public boolean isState(State state) {
        return (mStateValue & state.getStateValue()) != 0;
    }

    public enum State {
        IDLE,
        OFFLINE,
        LOCAL,
        CLOUD,
        UPGRADING_LOCAL,
        UPGRADING_CLOUD,
        DELETED,
        ;

        private final int mStateValue;

        State() {
            mStateValue = 1 << this.ordinal();
        }

        public int getStateValue() {
            return mStateValue;
        }
    }
}

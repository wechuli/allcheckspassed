export function validateIntervalValues(value: number): number {
    const maxInterval = 360;
    if (isNaN(value) || value < 0) {
        return 1;
    }
    if (value > maxInterval) {
        return maxInterval;
    }
    return value;
}
export function validateIntervalValues(value: number): number {
    if (isNaN(value) || value < 0 || value === Infinity) {
        return 1;
    }
    return value;
}

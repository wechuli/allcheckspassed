import {validateIntervalValues} from '../src/utils/validators';


describe("validateIntervalValues", () => {
    it("returns 1 if input is less than 1", () => {
        expect(validateIntervalValues(-0.5)).toBe(1);
        expect(validateIntervalValues(-1)).toBe(1);
        expect(validateIntervalValues(-100)).toBe(1);
    });

    it("returns 1 if input is NaN", () => {
        expect(validateIntervalValues(NaN)).toBe(1);
    });

    it("returns 360 if input is Infinity", () => {
        expect(validateIntervalValues(Infinity)).toBe(360);
    });

    it("returns 360 if input is greater than 360", () => {
        expect(validateIntervalValues(361)).toBe(360);
        expect(validateIntervalValues(1000)).toBe(360);
    });
    it("returns input if input is between 0 and 360", () => {
        expect(validateIntervalValues(0)).toBe(0);
        expect(validateIntervalValues(1)).toBe(1);
        expect(validateIntervalValues(2)).toBe(2);
        expect(validateIntervalValues(359)).toBe(359);
        expect(validateIntervalValues(360)).toBe(360);
    });

    it("return 1 if input i negative infinity", () => {
        expect(validateIntervalValues(-Infinity)).toBe(1);
    });

    it('returns a float if input is a float', () => {
        expect(validateIntervalValues(1.5)).toBe(1.5);
        expect(validateIntervalValues(1.1)).toBe(1.1);
        expect(validateIntervalValues(0.5)).toBe(0.5);
        expect(validateIntervalValues(0.1)).toBe(0.1);
        expect(validateIntervalValues(359.9)).toBe(359.9);
    });

});




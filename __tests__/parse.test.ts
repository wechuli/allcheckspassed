import {parseChecksArray,isValidCheckInput,validateCheckInputs} from '../src/utils/inputsExtractor';



describe("parseChecksArray", () => {

    it("returns an empty array if input is -1", () => {
        expect(parseChecksArray("-1")).toEqual([]);
    });

    it("returns an array of objects if input is a JSON array", () => {
        expect(parseChecksArray('[{"name":"check1","app_id":1},{"name":"check2","app_id":2}]')).toEqual([{name:"check1",app_id:1},{name:"check2",app_id:2}]);
    });

    it("returns an array of objects if input is a JSON array omitting empty values", () => {
        expect(parseChecksArray('[{"name":"check1","app_id":1},{"name":"","app_id":-1}]')).toEqual([{name:"check1",app_id:1}]);
    });

    it("returns an array of objects if input is a JSON object", () => {
        expect(parseChecksArray('{"name":"check1","app_id":1}')).toEqual([{name:"check1",app_id:1}]);
    });

    it("returns an array of objects if input is a comma-separated list of check names", () => {
        expect(parseChecksArray('check1,check2')).toEqual([{name:"check1",app_id:-1},{name:"check2",app_id:-1}]);
    });

    it("returns an array of objects if input is a comma-separated list of check names with spaces", () => {
        expect(parseChecksArray('check1, check2')).toEqual([{name:"check1",app_id:-1},{name:"check2",app_id:-1}]);
    });

    it("returns an array of objects if input is a comma-separated list of check names with extra commas", () => {
        expect(parseChecksArray('check1,,check2,')).toEqual([{name:"check1",app_id:-1},{name:"check2",app_id:-1}]);
    });

    it("returns an error if input is invalid JSON",()=>{
        expect(()=>parseChecksArray('{"name":"check1","app_id":1')).toThrowError();

    })

    it("return an error if the parsed JSON does not have the correct properties",()=>{
        expect(()=>parseChecksArray('[{"name":"check1","app_id":1},{"name":"check2"}]')).toThrowError();
    })

});

describe("isValidCheckInput", () => {
    it("returns true if input is a valid check input", () => {
        expect(isValidCheckInput({name:"check1",app_id:1})).toBe(true);
    });

    it("returns false if input is not a valid check input", () => {
        expect(isValidCheckInput({name:"check1"})).toBe(false);
        expect(isValidCheckInput({app_id:1})).toBe(false);
        expect(isValidCheckInput({name:"check1",app_id:"1"})).toBe(false);
        expect(isValidCheckInput({name:1,app_id:1})).toBe(false);
        expect(isValidCheckInput({name:"check1",app_id:1,extra:"extra"})).toBe(true);
    });
});

describe("validateCheckInputs", () => {
    it("returns true if input is an array of valid check inputs", () => {
        expect(validateCheckInputs([{name:"check1",app_id:1},{name:"check2",app_id:2}])).toBe(true);
    });

    it("returns false if input is an array of invalid check inputs", () => {
        expect(validateCheckInputs([{name:"check1",app_id:1},{name:"check2"}])).toBe(false);
        expect(validateCheckInputs([{name:"check1",app_id:1},{app_id:1}])).toBe(false);
        expect(validateCheckInputs([{name:"check1",app_id:1},{name:"check2",app_id:"1"}])).toBe(false);
        expect(validateCheckInputs([{name:1,app_id:1},{name:"check2",app_id:2}])).toBe(false);
        expect(validateCheckInputs([{name:"check1",app_id:1},{name:"check2",app_id:2,extra:"extra"}])).toBe(true);
    });
});
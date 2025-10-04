"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statuses_1 = require("./statuses");
const statusesAPI_1 = require("./statusesAPI");
const statusesFilters_1 = require("./statusesFilters");
let cities = ["Nairobi", "Kampala", "Addis Ababa", "Cairo"];
let cities2 = ["Newyork", "Los Angeles", "Chicago", "Houston"];
cities = cities.concat(cities2);
console.log(cities);
(0, statusesAPI_1.getAllStatusCommits)("githubuserdemo", "statuscommitsplay", "5ea77250c07745c560d0094246f5360289ce531c")
    .then((statuses) => {
    console.log("All statuses:", statuses.length);
    console.log("\n=== All Statuses ===");
    console.log((0, statuses_1.mapStatusesToChecksModel)(statuses));
    statuses.forEach((s) => {
        console.log(`ID: ${s.id}, Creator: ${s.creator.login}, Context: ${s.context}, State: ${s.state}`);
    });
    // Filter to get most recent per context/creator
    const filtered = (0, statusesFilters_1.getMostRecentStatusPerContextAndCreator)(statuses);
    console.log("\n=== Filtered (Most Recent per Context/Creator) ===");
    console.log("Filtered statuses:", filtered.length);
    filtered.forEach((s) => {
        console.log(`ID: ${s.id}, Creator: ${s.creator.login}, Context: ${s.context}, State: ${s.state}`);
    });
})
    .catch((error) => {
    console.error("Error fetching statuses:", error);
});
//# sourceMappingURL=test.js.map
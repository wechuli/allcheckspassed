import { getAllStatusCommits } from "./statusesAPI";
import { getMostRecentStatusPerContextAndCreator } from "./statusesFilters";

getAllStatusCommits(
  "githubuserdemo",
  "statuscommitsplay",
  "5ea77250c07745c560d0094246f5360289ce531c"
)
  .then((statuses) => {
    console.log("All statuses:", statuses.length);
    console.log("\n=== All Statuses ===");
    console.log(statuses);
    statuses.forEach((s) => {
      console.log(
        `ID: ${s.id}, Creator: ${s.creator.login}, Context: ${s.context}, State: ${s.state}`
      );
    });

    // Filter to get most recent per context/creator
    const filtered = getMostRecentStatusPerContextAndCreator(statuses);
    console.log("\n=== Filtered (Most Recent per Context/Creator) ===");
    console.log("Filtered statuses:", filtered.length);
    filtered.forEach((s) => {
      console.log(
        `ID: ${s.id}, Creator: ${s.creator.login}, Context: ${s.context}, State: ${s.state}`
      );
    });
  })
  .catch((error) => {
    console.error("Error fetching statuses:", error);
  });

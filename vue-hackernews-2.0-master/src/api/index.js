// this is aliased in webpack config based on server/client build
import { createAPI } from "create-api";
const logRequests = !!process.env.DEBUG_API;

const api = createAPI({
  version: "/v0",
  config: {
    databaseURL: "http://localhost:8081",
  },
});

// const api = createAPI({
//   version: "/v0",
//   config: {
//     databaseURL: "https://hacker-news.firebaseio.com",
//   },
// });

function fetch(child) {
  logRequests && console.log(`fetching ${child}...`);
  const cache = api.cachedItems;
  if (cache && cache.has(child)) {
    logRequests && console.log(`cache hit for ${child}.`);
    return Promise.resolve(cache.get(child));
  } else {
    return new Promise((resolve, reject) => {
      console.log("api.child(child).once", child);
      api.child(child).once(
        "value",
        (snapshot) => {
          console.log("api.child(child).once snapshot", snapshot);
          const val = snapshot.val();
          // mark the timestamp when this item is cached
          if (val) val.__lastUpdated = Date.now();
          cache && cache.set(child, val);
          logRequests && console.log(`fetched ${child}.`);
          resolve(val);
        },
        reject
      );
    });
  }
}

export function fetchDataAPI() {
  console.log("api fetchDataAPI");
  return fetch("/data");
}

export function fetchItem (id) {
  return fetch(`item/${id}`)
}
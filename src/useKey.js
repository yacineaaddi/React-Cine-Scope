import { useEffect } from "react";

export default function useKey(key, action) {
  useEffect(
    function () {
      function callback(e) {
        if (e.code === key.toLowerCase()) {
          action();
          console.log(key);
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [action, key]
  );
}

import { useEffect } from "react";

const TARGET_URL = "https://your-app.com";

const Redirect = () => {
  useEffect(() => {
    window.location.href = TARGET_URL;
  }, []);

  return null;
};

export default Redirect;

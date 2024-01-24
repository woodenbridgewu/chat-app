import React from "react";
import "../../App.css";

function SignOut({ auth }) {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>登出</button>
  );
}

export default SignOut;

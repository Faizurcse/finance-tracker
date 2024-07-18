import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "./Header";
import { toast } from "react-toastify";

const SignUpSignIn = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const navigate = useNavigate(); /* >>> useNavigate is a hook provided by the react-router-dom library.
   It's used to programmatically navigate between routes in a React application that uses React Router 
   for client-side routing.*/

  const createUserDocument = async (user) => {
    setLoading(true);
    if (!user) return;

    /*
    -----------Getting a Document Reference:--------------------------------
    >>In Firebase, auth and db are instances of Firebase services that you initialize and configure to use Firebase
     Authentication and Firestore Database in your application.
    >>doc(db, "users", user.uid) creates a reference to a document in the "users" collection in your Firestore database.
     The document is identified by the user.uid (the user's unique ID).
     >>Using auth in Your Application:
       Once you have initialized Firebase Authentication, you can use the auth instance to perform various authentication operations, 
        such as signing in, signing out, and managing user sessions.
    >> db represents your Firestore database instance.Using db in Your Application:
        With Firestore initialized, you can use the db instance to perform various database operations, 
         such as reading from and writing to your Firestore database.

     >>getDoc(userRef) retrieves the document referenced by userRef.
     */

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      //userData.exists() is a method that checks if the document exists in the Firestore database.
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName ? displayName : name,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
        });
        toast.success("Account Created!");
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
        setLoading(false);
      }
    }
    //  else{ // when login with email and password also login with google
    //   toast.error("document is already exist");
    // }
  };

  const signUpWithEmail = async (e) => {
    //signup with name , email and password , confirm password
    setLoading(true);
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    /* ------------------auth------------------
  >>The auth object in Firebase Authentication represents the 
  authentication service instance,
   which you use to perform various authentication 
  operations, such as signing up, logging in,
   and managing user sessions.

   ----------------createUserWithEmailAndPassword---------
   >>when you use the createUserWithEmailAndPassword
    function from Firebase
    Authentication, it checks if the email and 
    password meet Firebase's criteria. Specifically:

Email Validation: The email must be a valid email
 address format.

Password Validation: The password must be at least
 6 characters long.
*/

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      //console.log("result-----",result)

      const user = result.user;

      await createUserDocument(user);
      toast.success("Successfully Signed Up!");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing up with email and password: ",
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithEmail = async (e) => {
    //login with email password....
    setLoading(true);
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      const user = result.user;
      await createUserDocument(user);
      navigate("/dashboard");
      toast.success("Logged In Successfully!");
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing in with email and password: ",
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    //login or signUp both with google.................
    setLoading(true);
    try {
      /*
      -----------------------provider---------------------------------
      >>>The provider in Firebase is a library that allows you to authenticate 
      users using third-party providers like Google, Facebook, GitHub, etc. When you use a provider 
      like GoogleAuthProvider, it facilitates the authentication 
      process and gives you access to the user's information such as email, full name, and photo.
       */
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user);
      toast.success("User Authenticated Successfully!");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
      console.error("Error signing in with Google: ", error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="wrapper">
        {flag ? (
          <div className="signup-signin-container">
            <h2 style={{ textAlign: "center" }}>
              Log In on <span className="blue-text">Financely.</span>
            </h2>
            <form onSubmit={signInWithEmail}> 
              <div className="input-wrapper">
                <p>Email</p>
                <input
                  type="email"
                  placeholder="JohnDoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <p>Password</p>
                <input
                  type="password"
                  placeholder="Example123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                disabled={loading}
                className="btn"
                type="submit"
              >
                {loading ? "Loading..." : " Log In with Email and Password"}
              </button>
            </form>
            <p style={{ textAlign: "center", margin: 0 }}>or</p>
            <button
              disabled={loading}
              className="btn btn-blue"
              onClick={signInWithGoogle}
            >
              {loading ? "Loading..." : " Log In with Google"}
            </button>
            <p
              onClick={() => setFlag(!flag)}
              style={{
                textAlign: "center",
                marginBottom: 0,
                marginTop: "0.5rem",
                cursor: "pointer",
              }}
            >
              Or Don't Have An Account? Click Here.
            </p>
          </div>
        ) : (
          <div className="signup-signin-container">
            <h2 style={{ textAlign: "center" }}>
              Sign Up on <span className="blue-text">Financely.</span>
            </h2>
            <form onSubmit={signUpWithEmail}>
              <div className="input-wrapper">
                <p>Full Name</p>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <p>Email</p>
                <input
                  type="email"
                  placeholder="JohnDoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <p>Password</p>
                <input
                  type="password"
                  placeholder="Example123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <p>Confirm Password</p>
                <input
                  type="password"
                  placeholder="Example123"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn">
                {loading ? "Loading..." : "Sign Up with Email and Password"}
              </button>
            </form>
            <p style={{ textAlign: "center", margin: 0 }}>or</p>
            <button
              disabled={loading} /*disabled Attribute: This is a standard HTML attribute used to disable a
               button, input, or other form elements. When an element has the 
              disabled attribute, it becomes unclickable and unresponsive to user interactions.
              workinh on loading tru disabled loading false undesabled
               */
              className="btn btn-blue"
              onClick={signInWithGoogle}
            >
              {loading ? "Loading..." : "Sign Up with Google"}
            </button>
            <p
              onClick={() => setFlag(!flag)}
              style={{
                textAlign: "center",
                marginBottom: 0,
                marginTop: "0.5rem",
                cursor: "pointer",
              }}
            >
              Or Have An Account Already? Click Here
            </p>
            {/* <button onClick={signInWithEmail}>
            Sign In with Email and Password
          </button> */}
          </div>
        )}
      </div>
    </>
  );
};

export default SignUpSignIn;

import "./App.css";
import { initializeApp } from "firebase/app";
import {
  collection,
  query,
  orderBy,
  limit,
  getFirestore,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect, useRef } from "react";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h2>聊天室!!</h2>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function ChatRoom() {
  const [ARR, setARR] = useState([]);
  const [formValue, setFormValue] = useState("");
  const toBottonRef = useRef();

  useEffect(() => {
    // return unsubscribe 函数，以便在component卸載時取消監聽
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "messages"),
        orderBy("createdAt", "desc"),
        limit(25)
      ),
      (querySnapshot) => {
        const newARR = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setARR(() => [...newARR.reverse()]);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    // 在component卸載時取消監聽
    return () => unsubscribe();
  }, []);

  // 在 ARR 變化時，滾動到底部
  useEffect(() => {
    toBottonRef.current.scrollIntoView({ behavior: "smooth" });
  }, [ARR]);

  async function sendMessage(e) {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    const messagesCollection = collection(firestore, "messages");

    if (formValue === "") {
      return;
    }
    try {
      await addDoc(messagesCollection, {
        uid: uid,
        photoURL: photoURL,
        text: formValue,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    setFormValue("");
  }
  return (
    <>
      <main>
        {ARR.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.text}
            uid={msg.uid}
            photoURL={msg.photoURL}
          />
        ))}
        <div ref={toBottonRef}></div>
      </main>
      <form action="" onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="請輸入內容..."
        />
        <button type="submit">傳送</button>
      </form>
    </>
  );
}

function ChatMessage({ message, uid, photoURL }) {
  const messagesClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messagesClass}`}>
      <img src={photoURL} alt="" />
      <p>{message}</p>
    </div>
  );
}

function SignIn() {
  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
  return <button onClick={signInWithGoogle}>請登入您的Google帳號</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>登出</button>
  );
}

export default App;

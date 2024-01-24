import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import SignOut from "./shared/SignOut/SignOut";
import Header from "./components/Header/Header";
import Title from "./components/Header/Title";
import ChatRoom from "./pages/ChatRoom/ChatRoom";
import SignIn from "./pages/SignIn/SignIn";
import Section from "./components/Section/Section";

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
      <Header>
        <Title />
        <SignOut auth={auth} />
      </Header>
      <Section>
        {user ? (
          <ChatRoom auth={auth} firestore={firestore} />
        ) : (
          <SignIn auth={auth} />
        )}
      </Section>
    </div>
  );
}

export default App;

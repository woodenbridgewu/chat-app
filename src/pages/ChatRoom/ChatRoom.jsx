import React, { useEffect, useRef, useState } from "react";
import "../../App.css";
import ChatMessage from "../../shared/ChatMessage/ChatMessage";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

function ChatRoom({ auth, firestore }) {
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
  }, [firestore]);

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
            auth={auth}
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

export default ChatRoom;

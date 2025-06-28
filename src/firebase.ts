import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 사용자님의 Firebase 프로젝트 설정 정보입니다.
const firebaseConfig = {
  apiKey: "AIzaSyD4WoZhVDoqawKxyals3DYXbU7LLRTHF10",
  authDomain: "classprogress-14369.firebaseapp.com",
  projectId: "classprogress-14369",
  storageBucket: "classprogress-14369.appspot.com",
  messagingSenderId: "890517195769",
  appId: "1:890517195769:web:7c4c8a7ca874cf73620b28",
  measurementId: "G-4XGKZ5CH6T"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 다른 파일에서 사용할 수 있도록 Firebase 서비스 내보내기
export const auth = getAuth(app); // 인증 담당
export const db = getFirestore(app); // 데이터베이스(Firestore) 담당

"use client";
import React, { useEffect, useState } from "react";
import MainHomeClient from "../MainHome/MainHome.client";
import { useRouter } from "next/navigation";
export function TutorialOverlay({ onClose }) {
  const [index, setIndex] = useState(0);
  const images = [
    "/tuto1.png",
    "/tuto2.png",
    "/tuto3.png",
    "/tuto4.png",
    "/tuto5.png",
    "/tuto6.png",
  ];

  const titles = [
    "홈",
    "연습문제",
    "연습문제",
    "실전문제",
    "랭킹",
    "마이페이지",
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(2px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#0f0f0f",
          borderRadius: 20,
          padding: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 1100,
          position: "relative",
          border: "solid",
        }}
      >
        <h3 className="mb-2 mt-2">사용 가이드</h3>
        {/* X 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            fontSize: 32,
            color: "#fff",
            cursor: "pointer",
            zIndex: 1,
            lineHeight: 1,
            fontWeight: "bold",
            padding: 0,
          }}
          aria-label="닫기"
        >
          ×
        </button>
        <div className="border-solid border-2 py-1.5 px-7 rounded-4xl border-[#f3f3f3]">
          <h4 className="text-xl">{titles[index]}</h4>
        </div>
        {/* 고정된 최소 이미지 영역 */}
        <div
          style={{
            minWidth: 1000,
            minHeight: 600,
            maxWidth: 900,
            maxHeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            marginBottom: 2,
            overflow: "hidden",
          }}
        >
          <img
            src={images[index]}
            alt={`튜토리얼${index + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
        {images.length > 1 && (
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              style={{
                marginRight: 12,
                opacity: index === 0 ? 0.3 : 1,
                pointerEvents: index === 0 ? "none" : "auto",
              }}
            >
              이전
            </button>
            <button
              onClick={() => setIndex(Math.min(images.length - 1, index + 1))}
              disabled={index === images.length - 1}
              style={{
                opacity: index === images.length - 1 ? 0.3 : 1,
                pointerEvents: index === images.length - 1 ? "none" : "auto",
              }}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeWithTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login"); // 토큰 없으면 바로 로그인 이동
      return;
    }

    if (localStorage.getItem("hideTutorial") !== "true") {
      setShowTutorial(true);
    }
    setCheckingAuth(false);
  }, [router]);

  const handleCloseTutorial = () => {
    localStorage.setItem("hideTutorial", "true");
    setShowTutorial(false);
  };

  if (checkingAuth) return null;
  return (
    <>
      {showTutorial && <TutorialOverlay onClose={handleCloseTutorial} />}
      {!showTutorial && <MainHomeClient />}
    </>
  );
}

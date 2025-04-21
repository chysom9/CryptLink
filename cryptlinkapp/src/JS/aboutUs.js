import React from "react";
import { Link } from "react-router-dom";
import "../css/chatRoom.css";
import kyleImg from "../assets/kyle.jpg";
import harshImg from "../assets/harsh.jpg";
import chiImg from "../assets/chi.jpg";
import mahmoodImg from "../assets/mahmood.jpg";
import zakirImg from "../assets/zakir.jpg";

function AboutUs() {
  const developers = [
    {
      name: "Kyle Marshall Sparks II",
      role: "Front End Developer",
      description: "Kyle brings our interface to life with smooth, intuitive design and attention to detail.",
      image: kyleImg,
    },
    {
      name: "Harsh Bhadania",
      role: "Backend Developer",
      description: "Harsh handles the brains of CryptLink—our APIs, data flows, and backend logic.",
      image: harshImg,
    },
    {
      name: "Chi Nwosu",
      role: "Unit Tester",
      description: "Chi ensures our code is clean and tested, catching bugs before they reach production.",
      image: chiImg,
    },
    {
      name: "Mahmood Kidwai",
      role: "Backend Developer",
      description: "Mahmood builds out the infrastructure, keeping things secure and scalable.",
      image: mahmoodImg,
    },
    {
      name: "Zakir Shahzad",
      role: "Front End Developer",
      description: "Zakir makes sure the user experience is smooth, secure, and visually polished.",
      image: zakirImg,
    },
  ];

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      {/* Home Button */}
      <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
        <Link
          to="/"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#5563DE",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          ← Home
        </Link>
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Meet the Developers</h1>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {developers.map((dev, idx) => (
          <div
            key={idx}
            style={{
              textAlign: "center",
              padding: "1rem",
              border: "1px solid #aaa",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <h2 style={{ margin: "0.5rem 0" }}>{dev.name}</h2>
            <h4 style={{ margin: "0.25rem 0", color: "#ccc" }}>{dev.role}</h4>
            <img
              src={dev.image}
              alt={dev.name}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "2px solid #fff",
                margin: "0.75rem 0",
              }}
            />
            <p
              style={{
                fontSize: "0.95rem",
                margin: "0 auto",
                maxWidth: "600px",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              {dev.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AboutUs;

import React from 'react';
import './StarryBackground.css';

function StarryBackground() {
  return (
    <div className="starry-bg">
      <div className="starry-bg__layer starry-bg__layer--1" />
      <div className="starry-bg__layer starry-bg__layer--2" />
      <div className="starry-bg__layer starry-bg__layer--3" />
      <div className="starry-bg__layer starry-bg__layer--4" />
    </div>
  );
}

export default StarryBackground;

import React from 'react';
import { Link } from 'react-router-dom';

function Card({ title, btn, description, icon: Icon, iconColor, page, style }) {
  return (
    <div className="card" style={style}>
      {Icon && (
        <Icon
          size={24}
          className="card-icon"
          color={iconColor}
        />
      )}
      <h2>{title}</h2>
      <div className="card-content">
        {description}
      </div>
      <div className="card-actions">
        <Link to={page}>
          <button className="btn">{btn}</button>
        </Link>
      </div>
    </div>
  );
}

export default Card;
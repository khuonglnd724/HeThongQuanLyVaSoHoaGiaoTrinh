import { useEffect, useState } from "react";
import "./UserSwitcher.css";

export default function UserSwitcher() {
  const [userId, setUserId] = useState(
    localStorage.getItem("x_user_id") || "1"
  );

  useEffect(() => {
    localStorage.setItem("x_user_id", userId);
  }, [userId]);

  return (
    <div className="user-switcher">
      <label htmlFor="lecturer-id" className="user-switcher__label">
        Lecturer
      </label>

      <input
        id="lecturer-id"
        className="user-switcher__input"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button
        className="user-switcher__button"
        onClick={() => window.location.reload()}
      >
        Apply
      </button>
    </div>
  );
}

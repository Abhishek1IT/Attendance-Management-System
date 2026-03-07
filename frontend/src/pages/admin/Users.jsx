import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllUsersApi,
  changeRoleApi,
  deactivateUserApi,
  deleteUserApi,
} from "../../api/adminApi";
import "../../styles/Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const res = await getAllUsersApi();
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const res = await getAllUsersApi();
        if (isMounted) {
          setUsers(res.data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load users");
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const performAction = async (action) => {
    try {
      await action();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="users-page">
      <div className="users-card">
        <div className="users-header">
          <h2 className="users-title">Users</h2>
          <Link className="users-back" to="/dashboard">
            Back
          </Link>
        </div>

        {error ? <p className="users-error">{error}</p> : null}

        {!error && users.length === 0 ? (
          <p className="users-empty">No users found.</p>
        ) : null}

        {!error && users.length > 0 ? (
          <div className="users-table">
            <div className="users-row users-row-head">
              <span>Name</span>
              <span>Role</span>
              <span>Actions</span>
            </div>

            {users.map((u) => (
              <div className="users-row" key={u._id}>
                <span>{u.name}</span>
                <span className="users-role">{u.role}</span>

                <div className="users-actions">
                  <button
                    className="users-btn users-btn-admin"
                    onClick={() =>
                      performAction(() =>
                        changeRoleApi(
                          u._id,
                          u.role === "Admin" ? "Employee" : "Admin",
                        ),
                      )
                    }
                  >
                    {u.role === "Admin" ? "Make Employee" : "Make Admin"}
                  </button>

                  <button
                    className="users-btn users-btn-deactivate"
                    onClick={() =>
                      performAction(() => deactivateUserApi(u._id))
                    }
                  >
                    Deactivate
                  </button>

                  <button
                    className="users-btn users-btn-delete"
                    onClick={() => performAction(() => deleteUserApi(u._id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

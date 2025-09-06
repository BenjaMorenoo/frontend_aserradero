import React, { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await pb.collection("users").getList(1, 50, { sort: "name" });
      setUsers(res.items);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await pb.collection("users").update(userId, { rol: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Error al actualizar rol");
    }
  };

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-2 bg-white shadow rounded">
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <select
            value={user.rol}
            onChange={(e) => handleRoleChange(user.id, e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="pedidos">Pedidos</option>
            <option value="produccion">Producción</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}

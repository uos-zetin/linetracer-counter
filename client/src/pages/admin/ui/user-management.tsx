import { useEffect, useState } from "react";
import type { User, UserRegisterForm } from "@/entities/user";
import { useUserService, AdminUserCreateModal, AdminUserEditRolesModal, AdminUserDeleteModal } from "@/features/user";

export function UserManagement() {
  /* ───────────────────────── 서비스 & 상태 ───────────────────────── */
  const userService = useUserService();
  const users = userService.use.users();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditRolesModalOpen, setIsEditRolesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  /* ───────────────────────── 초기 로딩 ───────────────────────── */
  useEffect(() => {
    userService.load.all().catch((e) => console.error("Failed to load users:", e));
  }, [userService]);

  /* ───────────────────────── 핸들러 ───────────────────────── */
  const openCreate = () => setIsCreateModalOpen(true);

  const openEditRoles = (user: User) => {
    setSelectedUser(user);
    setIsEditRolesModalOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (data: UserRegisterForm) => {
    try {
      await userService.admin.create(data);
      setIsCreateModalOpen(false);
    } catch (e) {
      console.error("Failed to create user:", e);
    }
  };

  const handleEditRolesSubmit = async (roles: User["roles"]) => {
    if (!selectedUser) return;
    try {
      await userService.admin.updateRoles(selectedUser.id, roles);
      setIsEditRolesModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error("Failed to update user roles:", e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await userService.admin.delete(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error("Failed to delete user:", e);
    }
  };

  /* ───────────────────────── 뷰 ───────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-gray-600">사용자를 생성, 권한 수정, 삭제할 수 있습니다</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          사용자 생성
        </button>
      </div>

      {/* User Cards */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9l3 3-3 3M6 9l-3 3 3 3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">사용자가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">새로운 사용자를 생성해보세요.</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                {/* 사용자 정보 */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">ID: {user.id}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    생성일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                  <p className="mt-2 text-gray-600">역할: {user.roles.length ? user.roles.join(", ") : "없음"}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditRoles(user)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                    title="권한 수정"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12h.01M12 12h.01M9 12h.01M13 16h-2m-6 4h16M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDelete(user)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                    title="삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ───────────────────────── 모달 ───────────────────────── */}
      <AdminUserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <AdminUserEditRolesModal
        isOpen={isEditRolesModalOpen}
        onClose={() => {
          setIsEditRolesModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleEditRolesSubmit}
      />

      <AdminUserDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Plus, Users, Trash2, Shield } from "lucide-react";
import { formatDate } from "@/shared/lib";
import { Button, Card, CardContent, Badge } from "@/shared/ui";
import type { User, UserRegisterForm } from "@/entities/user";
import { useErrorHandlingService } from "@/features/error-handling";
import { useUserService, AdminUserCreateModal, AdminUserEditRolesModal, AdminUserDeleteModal } from "@/features/user";

export function UserManagement() {
  const userService = useUserService();
  const users = userService.use.users();
  const errorHandler = useErrorHandlingService();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditRolesModalOpen, setIsEditRolesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    userService.load.all().catch((e) => {
      errorHandler.handle(e as Error, "사용자 목록 로드 중 오류가 발생했습니다");
    });
  }, [userService, errorHandler]);

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
      errorHandler.handle(e as Error, "사용자 생성 중 오류가 발생했습니다");
    }
  };

  const handleEditRolesSubmit = async (roles: User["roles"]) => {
    if (!selectedUser) return;
    try {
      await userService.admin.updateRoles(selectedUser.id, roles);
      setIsEditRolesModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      errorHandler.handle(e as Error, "사용자 권한 수정 중 오류가 발생했습니다");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await userService.admin.delete(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      errorHandler.handle(e as Error, "사용자 삭제 중 오류가 발생했습니다");
    }
  };

  /* ───────────────────────── 뷰 ───────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">사용자 관리</h1>
          <p className="mt-2 text-muted-foreground">사용자를 생성, 권한 수정, 삭제할 수 있습니다</p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          사용자 생성
        </Button>
      </div>

      {/* User Cards */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">사용자가 없습니다</h3>
              <p className="text-muted-foreground mb-4">새로운 사용자를 생성해보세요.</p>
              <Button onClick={openCreate} variant="outline">
                <Plus className="w-4 h-4 mr-2" />첫 번째 사용자 생성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="px-6">
                <div className="flex justify-between items-start">
                  {/* 사용자 정보 */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">ID: {user.id}</p>
                    <p className="mt-1 text-sm text-muted-foreground">생성일: {formatDate(user.createdAt)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">역할:</span>
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role === "administrator" ? "관리자" : role}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          없음
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditRoles(user)}
                      className="h-9 w-9 p-0"
                      title="권한 수정"
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDelete(user)}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
